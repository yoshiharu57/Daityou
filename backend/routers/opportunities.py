from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas
from database import get_db

router = APIRouter(prefix="/api/opportunities", tags=["opportunities"])

STAGES = ["情報収集", "提案中", "入札済み", "受注", "失注"]


@router.get("/", response_model=List[schemas.OpportunityResponse])
def list_opportunities(db: Session = Depends(get_db)):
    return db.query(models.Opportunity).order_by(models.Opportunity.bid_date.asc().nullslast()).all()


@router.post("/", response_model=schemas.OpportunityResponse, status_code=201)
def create_opportunity(data: schemas.OpportunityCreate, db: Session = Depends(get_db)):
    opp = models.Opportunity(**data.model_dump())
    db.add(opp)
    db.commit()
    db.refresh(opp)
    return opp


@router.get("/pipeline-stats")
def pipeline_stats(db: Session = Depends(get_db)):
    opps = db.query(models.Opportunity).all()
    result = {}
    for stage in STAGES:
        items = [o for o in opps if o.stage == stage]
        result[stage] = {
            "count": len(items),
            "amount": sum(o.estimated_amount or 0 for o in items),
            "expected": sum((o.estimated_amount or 0) * (o.win_probability or 0) / 100 for o in items),
        }
    return result


@router.get("/{opp_id}", response_model=schemas.OpportunityResponse)
def get_opportunity(opp_id: int, db: Session = Depends(get_db)):
    opp = db.query(models.Opportunity).filter(models.Opportunity.id == opp_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="案件が見つかりません")
    return opp


@router.put("/{opp_id}", response_model=schemas.OpportunityResponse)
def update_opportunity(opp_id: int, data: schemas.OpportunityUpdate, db: Session = Depends(get_db)):
    opp = db.query(models.Opportunity).filter(models.Opportunity.id == opp_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="案件が見つかりません")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(opp, k, v)
    db.commit()
    db.refresh(opp)
    return opp


@router.delete("/{opp_id}", status_code=204)
def delete_opportunity(opp_id: int, db: Session = Depends(get_db)):
    opp = db.query(models.Opportunity).filter(models.Opportunity.id == opp_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="案件が見つかりません")
    db.delete(opp)
    db.commit()
