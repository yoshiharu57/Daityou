from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


class HealthRating(str, enum.Enum):
    I = "I"
    II = "II"
    III = "III"
    IV = "IV"
    UNKNOWN = "未判定"


class InspectionType(str, enum.Enum):
    REGULAR = "定期点検"
    EMERGENCY = "緊急点検"
    DETAILED = "詳細点検"
    INITIAL = "初回点検"


class Bridge(Base):
    __tablename__ = "bridges"

    id = Column(Integer, primary_key=True, index=True)
    management_number = Column(String(50), unique=True, index=True, nullable=False)
    bridge_name = Column(String(200), nullable=False)
    bridge_name_kana = Column(String(200))
    road_name = Column(String(200))
    location = Column(String(500))
    latitude = Column(Float)
    longitude = Column(Float)
    bridge_length = Column(Float)
    width = Column(Float)
    structure_type = Column(String(100))
    superstructure_type = Column(String(100))
    substructure_type = Column(String(100))
    material = Column(String(100))
    year_built = Column(Integer)
    road_class = Column(String(50))
    administrator = Column(String(200))
    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    inspections = relationship("Inspection", back_populates="bridge", cascade="all, delete-orphan")


class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(Integer, primary_key=True, index=True)
    bridge_id = Column(Integer, ForeignKey("bridges.id"), nullable=False)
    inspection_date = Column(Date, nullable=False)
    inspection_type = Column(String(50), default=InspectionType.REGULAR)
    inspector_company = Column(String(200))
    inspector_name = Column(String(100))
    health_rating = Column(String(10), default=HealthRating.UNKNOWN)
    overall_findings = Column(Text)
    repair_urgency = Column(String(50))
    next_inspection_date = Column(Date)
    created_at = Column(DateTime, server_default=func.now())

    bridge = relationship("Bridge", back_populates="inspections")
    damage_records = relationship("DamageRecord", back_populates="inspection", cascade="all, delete-orphan")
    photos = relationship("Photo", back_populates="inspection", cascade="all, delete-orphan")


class DamageRecord(Base):
    __tablename__ = "damage_records"

    id = Column(Integer, primary_key=True, index=True)
    inspection_id = Column(Integer, ForeignKey("inspections.id"), nullable=False)
    member_type = Column(String(100))
    member_number = Column(String(50))
    damage_type = Column(String(100))
    damage_rating = Column(String(10))
    damage_extent = Column(String(50))
    description = Column(Text)
    repair_method = Column(String(200))

    inspection = relationship("Inspection", back_populates="damage_records")


class Photo(Base):
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, index=True)
    inspection_id = Column(Integer, ForeignKey("inspections.id"), nullable=False)
    filename = Column(String(500), nullable=False)
    original_filename = Column(String(500))
    caption = Column(String(500))
    photo_type = Column(String(100))
    member_type = Column(String(100))
    damage_type = Column(String(100))
    taken_at = Column(DateTime)
    uploaded_at = Column(DateTime, server_default=func.now())

    inspection = relationship("Inspection", back_populates="photos")
