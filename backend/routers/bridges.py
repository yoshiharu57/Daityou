from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/bridges", tags=["bridges"])


@router.get("/", response_model=List[schemas.BridgeListItem])
def list_bridges(
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(models.Bridge)
    if search:
        query = query.filter(
            models.Bridge.bridge_name.contains(search) |
            models.Bridge.management_number.contains(search) |
            models.Bridge.location.contains(search) |
            models.Bridge.road_name.contains(search)
        )
    bridges = query.order_by(models.Bridge.management_number).all()

    result = []
    for bridge in bridges:
        last_inspection = (
            db.query(models.Inspection)
            .filter(models.Inspection.bridge_id == bridge.id)
            .order_by(models.Inspection.inspection_date.desc())
            .first()
        )
        count = db.query(models.Inspection).filter(models.Inspection.bridge_id == bridge.id).count()

        result.append(schemas.BridgeListItem(
            id=bridge.id,
            management_number=bridge.management_number,
            bridge_name=bridge.bridge_name,
            road_name=bridge.road_name,
            location=bridge.location,
            latitude=bridge.latitude,
            longitude=bridge.longitude,
            last_inspection_date=last_inspection.inspection_date if last_inspection else None,
            last_health_rating=last_inspection.health_rating if last_inspection else None,
            inspection_count=count,
        ))
    return result


@router.get("/{bridge_id}", response_model=schemas.Bridge)
def get_bridge(bridge_id: int, db: Session = Depends(get_db)):
    bridge = db.query(models.Bridge).filter(models.Bridge.id == bridge_id).first()
    if not bridge:
        raise HTTPException(status_code=404, detail="橋梁が見つかりません")
    return bridge


@router.post("/", response_model=schemas.Bridge)
def create_bridge(bridge: schemas.BridgeCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Bridge).filter(
        models.Bridge.management_number == bridge.management_number
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="この管理番号はすでに登録されています")
    db_bridge = models.Bridge(**bridge.model_dump())
    db.add(db_bridge)
    db.commit()
    db.refresh(db_bridge)
    return db_bridge


@router.put("/{bridge_id}", response_model=schemas.Bridge)
def update_bridge(bridge_id: int, bridge: schemas.BridgeUpdate, db: Session = Depends(get_db)):
    db_bridge = db.query(models.Bridge).filter(models.Bridge.id == bridge_id).first()
    if not db_bridge:
        raise HTTPException(status_code=404, detail="橋梁が見つかりません")
    update_data = bridge.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_bridge, key, value)
    db.commit()
    db.refresh(db_bridge)
    return db_bridge


@router.delete("/{bridge_id}")
def delete_bridge(bridge_id: int, db: Session = Depends(get_db)):
    db_bridge = db.query(models.Bridge).filter(models.Bridge.id == bridge_id).first()
    if not db_bridge:
        raise HTTPException(status_code=404, detail="橋梁が見つかりません")
    db.delete(db_bridge)
    db.commit()
    return {"message": "橋梁を削除しました"}
