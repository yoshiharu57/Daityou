from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/inspections", tags=["inspections"])


@router.get("/bridge/{bridge_id}", response_model=List[schemas.Inspection])
def list_inspections(bridge_id: int, db: Session = Depends(get_db)):
    bridge = db.query(models.Bridge).filter(models.Bridge.id == bridge_id).first()
    if not bridge:
        raise HTTPException(status_code=404, detail="橋梁が見つかりません")
    return (
        db.query(models.Inspection)
        .filter(models.Inspection.bridge_id == bridge_id)
        .order_by(models.Inspection.inspection_date.desc())
        .all()
    )


@router.get("/{inspection_id}", response_model=schemas.Inspection)
def get_inspection(inspection_id: int, db: Session = Depends(get_db)):
    inspection = db.query(models.Inspection).filter(models.Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="点検記録が見つかりません")
    return inspection


@router.post("/", response_model=schemas.Inspection)
def create_inspection(inspection: schemas.InspectionCreate, db: Session = Depends(get_db)):
    bridge = db.query(models.Bridge).filter(models.Bridge.id == inspection.bridge_id).first()
    if not bridge:
        raise HTTPException(status_code=404, detail="橋梁が見つかりません")
    db_inspection = models.Inspection(**inspection.model_dump())
    db.add(db_inspection)
    db.commit()
    db.refresh(db_inspection)
    return db_inspection


@router.put("/{inspection_id}", response_model=schemas.Inspection)
def update_inspection(inspection_id: int, inspection: schemas.InspectionUpdate, db: Session = Depends(get_db)):
    db_inspection = db.query(models.Inspection).filter(models.Inspection.id == inspection_id).first()
    if not db_inspection:
        raise HTTPException(status_code=404, detail="点検記録が見つかりません")
    update_data = inspection.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_inspection, key, value)
    db.commit()
    db.refresh(db_inspection)
    return db_inspection


@router.delete("/{inspection_id}")
def delete_inspection(inspection_id: int, db: Session = Depends(get_db)):
    db_inspection = db.query(models.Inspection).filter(models.Inspection.id == inspection_id).first()
    if not db_inspection:
        raise HTTPException(status_code=404, detail="点検記録が見つかりません")
    db.delete(db_inspection)
    db.commit()
    return {"message": "点検記録を削除しました"}


@router.post("/{inspection_id}/damage", response_model=schemas.DamageRecord)
def add_damage_record(
    inspection_id: int,
    damage: schemas.DamageRecordCreate,
    db: Session = Depends(get_db)
):
    inspection = db.query(models.Inspection).filter(models.Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="点検記録が見つかりません")
    db_damage = models.DamageRecord(inspection_id=inspection_id, **damage.model_dump())
    db.add(db_damage)
    db.commit()
    db.refresh(db_damage)
    return db_damage


@router.delete("/{inspection_id}/damage/{damage_id}")
def delete_damage_record(inspection_id: int, damage_id: int, db: Session = Depends(get_db)):
    damage = db.query(models.DamageRecord).filter(
        models.DamageRecord.id == damage_id,
        models.DamageRecord.inspection_id == inspection_id
    ).first()
    if not damage:
        raise HTTPException(status_code=404, detail="損傷記録が見つかりません")
    db.delete(damage)
    db.commit()
    return {"message": "損傷記録を削除しました"}
