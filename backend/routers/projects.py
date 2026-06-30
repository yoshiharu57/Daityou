from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List, Optional
from datetime import date
from collections import defaultdict
import models, schemas
from database import get_db

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.get("/", response_model=List[schemas.ProjectResponse])
def list_projects(
    status: Optional[str] = None,
    engineer: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(models.Project)
    if status:
        q = q.filter(models.Project.status == status)
    if engineer:
        q = q.filter(
            (models.Project.person_in_charge == engineer) |
            (models.Project.chief_engineer == engineer) |
            (models.Project.review_engineer == engineer)
        )
    if search:
        like = f"%{search}%"
        q = q.filter(
            (models.Project.project_name.like(like)) |
            (models.Project.business_number.like(like)) |
            (models.Project.client_organization.like(like)) |
            (models.Project.client_contact.like(like))
        )
    return q.order_by(models.Project.end_date.asc().nullslast()).all()


@router.post("/", response_model=schemas.ProjectResponse, status_code=201)
def create_project(data: schemas.ProjectCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Project).filter(
        models.Project.business_number == data.business_number
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="業務ナンバーが既に存在します")
    project = models.Project(**data.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    today = date.today()
    total = db.query(func.count(models.Project.id)).scalar()
    active = db.query(func.count(models.Project.id)).filter(
        models.Project.status == "進行中"
    ).scalar()
    completed = db.query(func.count(models.Project.id)).filter(
        models.Project.status == "完了"
    ).scalar()
    overdue = db.query(func.count(models.Project.id)).filter(
        models.Project.status == "進行中",
        models.Project.end_date < today,
        models.Project.progress_rate < 100
    ).scalar()
    near_deadline = db.query(func.count(models.Project.id)).filter(
        models.Project.status == "進行中",
        models.Project.end_date >= today,
        models.Project.end_date <= date.fromordinal(today.toordinal() + 30)
    ).scalar()
    total_amount = db.query(func.sum(models.Project.contract_amount)).filter(
        models.Project.status != "中断"
    ).scalar() or 0
    return {
        "total": total,
        "active": active,
        "completed": completed,
        "overdue": overdue,
        "near_deadline": near_deadline,
        "total_amount": total_amount,
    }


@router.get("/{project_id}", response_model=schemas.ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="案件が見つかりません")
    return project


@router.put("/{project_id}", response_model=schemas.ProjectResponse)
def update_project(project_id: int, data: schemas.ProjectUpdate, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="案件が見つかりません")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(project, k, v)
    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="案件が見つかりません")
    db.delete(project)
    db.commit()


@router.get("/analytics/engineer-workload")
def engineer_workload(db: Session = Depends(get_db)):
    """担当技術者ごとの稼働状況"""
    active = db.query(models.Project).filter(models.Project.status == "進行中").all()
    workload: dict = {}
    for p in active:
        for role, name in [("担当", p.person_in_charge), ("主任技術者", p.chief_engineer), ("照査技術者", p.review_engineer)]:
            if not name:
                continue
            if name not in workload:
                workload[name] = {"name": name, "count": 0, "total_progress": 0, "projects": []}
            workload[name]["count"] += 1
            workload[name]["total_progress"] += p.progress_rate or 0
            workload[name]["projects"].append({
                "id": p.id,
                "business_number": p.business_number,
                "project_name": p.project_name,
                "role": role,
                "progress_rate": p.progress_rate,
                "end_date": str(p.end_date) if p.end_date else None,
            })
    return list(workload.values())


@router.get("/analytics/monthly-revenue")
def monthly_revenue(year: Optional[int] = None, db: Session = Depends(get_db)):
    """月次受注金額集計"""
    target_year = year or date.today().year
    projects = db.query(models.Project).filter(
        models.Project.contract_date.isnot(None),
        extract("year", models.Project.contract_date) == target_year,
        models.Project.status != "中断",
    ).all()

    monthly: dict = defaultdict(lambda: {"amount": 0, "count": 0, "types": defaultdict(float)})
    for p in projects:
        m = p.contract_date.month
        monthly[m]["amount"] += p.contract_amount or 0
        monthly[m]["count"] += 1
        monthly[m]["types"][p.project_type or "その他"] += p.contract_amount or 0

    result = []
    for m in range(1, 13):
        d = monthly[m]
        result.append({
            "month": m,
            "label": f"{m}月",
            "amount": d["amount"],
            "count": d["count"],
            "types": dict(d["types"]),
        })
    return {"year": target_year, "months": result}


@router.get("/analytics/type-breakdown")
def type_breakdown(db: Session = Depends(get_db)):
    """業務種別構成"""
    projects = db.query(models.Project).filter(models.Project.status != "中断").all()
    breakdown: dict = defaultdict(lambda: {"count": 0, "amount": 0})
    for p in projects:
        t = p.project_type or "その他"
        breakdown[t]["count"] += 1
        breakdown[t]["amount"] += p.contract_amount or 0
    return [{"type": k, **v} for k, v in sorted(breakdown.items(), key=lambda x: -x[1]["amount"])]
