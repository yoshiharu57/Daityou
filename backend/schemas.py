from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime


class DamageRecordBase(BaseModel):
    member_type: Optional[str] = None
    member_number: Optional[str] = None
    damage_type: Optional[str] = None
    damage_rating: Optional[str] = None
    damage_extent: Optional[str] = None
    description: Optional[str] = None
    repair_method: Optional[str] = None


class DamageRecordCreate(DamageRecordBase):
    pass


class DamageRecord(DamageRecordBase):
    id: int
    inspection_id: int

    class Config:
        from_attributes = True


class PhotoBase(BaseModel):
    caption: Optional[str] = None
    photo_type: Optional[str] = None
    member_type: Optional[str] = None
    damage_type: Optional[str] = None


class PhotoCreate(PhotoBase):
    pass


class Photo(PhotoBase):
    id: int
    inspection_id: int
    filename: str
    original_filename: Optional[str] = None
    taken_at: Optional[datetime] = None
    uploaded_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class InspectionBase(BaseModel):
    inspection_date: date
    inspection_type: Optional[str] = "定期点検"
    inspector_company: Optional[str] = None
    inspector_name: Optional[str] = None
    health_rating: Optional[str] = "未判定"
    overall_findings: Optional[str] = None
    repair_urgency: Optional[str] = None
    next_inspection_date: Optional[date] = None


class InspectionCreate(InspectionBase):
    bridge_id: int


class InspectionUpdate(InspectionBase):
    pass


class Inspection(InspectionBase):
    id: int
    bridge_id: int
    created_at: Optional[datetime] = None
    damage_records: List[DamageRecord] = []
    photos: List[Photo] = []

    class Config:
        from_attributes = True


class InspectionSummary(BaseModel):
    id: int
    bridge_id: int
    inspection_date: date
    inspection_type: Optional[str] = None
    health_rating: Optional[str] = None
    inspector_company: Optional[str] = None

    class Config:
        from_attributes = True


class BridgeBase(BaseModel):
    management_number: str
    bridge_name: str
    bridge_name_kana: Optional[str] = None
    road_name: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    bridge_length: Optional[float] = None
    width: Optional[float] = None
    structure_type: Optional[str] = None
    superstructure_type: Optional[str] = None
    substructure_type: Optional[str] = None
    material: Optional[str] = None
    year_built: Optional[int] = None
    road_class: Optional[str] = None
    administrator: Optional[str] = None
    notes: Optional[str] = None


class BridgeCreate(BridgeBase):
    pass


class BridgeUpdate(BridgeBase):
    management_number: Optional[str] = None
    bridge_name: Optional[str] = None


class Bridge(BridgeBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    inspections: List[InspectionSummary] = []

    class Config:
        from_attributes = True


class BridgeListItem(BaseModel):
    id: int
    management_number: str
    bridge_name: str
    bridge_name_kana: Optional[str] = None
    road_name: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    last_inspection_date: Optional[date] = None
    last_health_rating: Optional[str] = None
    next_inspection_date: Optional[date] = None
    inspection_count: int = 0

    class Config:
        from_attributes = True
