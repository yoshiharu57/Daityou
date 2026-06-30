from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas
from database import get_db

router = APIRouter(prefix="/api/activity-logs", tags=["activity_logs"])


@router.get("/project/{project_id}", response_model=List[schemas.ActivityLogResponse])
def list_logs(project_id: int, db: Session = Depends(get_db)):
    return db.query(models.ActivityLog).filter(
        models.ActivityLog.project_id == project_id
    ).order_by(models.ActivityLog.log_date.desc()).all()


@router.post("/", response_model=schemas.ActivityLogResponse, status_code=201)
def create_log(data: schemas.ActivityLogCreate, db: Session = Depends(get_db)):
    log = models.ActivityLog(**data.model_dump())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.delete("/{log_id}", status_code=204)
def delete_log(log_id: int, db: Session = Depends(get_db)):
    log = db.query(models.ActivityLog).filter(models.ActivityLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="記録が見つかりません")
    db.delete(log)
    db.commit()
