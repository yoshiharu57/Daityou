from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    business_number = Column(String(50), unique=True, index=True, nullable=False)
    project_name = Column(String(300), nullable=False)
    client_organization = Column(String(200))
    client_contact = Column(String(100))
    contract_date = Column(Date)
    start_date = Column(Date)
    end_date = Column(Date)
    contract_amount = Column(Float, default=0)
    project_type = Column(String(100))
    person_in_charge = Column(String(100))
    chief_engineer = Column(String(100))
    review_engineer = Column(String(100))
    progress_rate = Column(Integer, default=0)
    status = Column(String(20), default="進行中")
    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    activity_logs = relationship("ActivityLog", back_populates="project", cascade="all, delete-orphan")


class Opportunity(Base):
    """受注前の商談・案件パイプライン"""
    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True, index=True)
    opportunity_name = Column(String(300), nullable=False)
    client_organization = Column(String(200))
    client_contact = Column(String(100))
    bid_date = Column(Date)
    estimated_amount = Column(Float, default=0)
    win_probability = Column(Integer, default=50)
    stage = Column(String(50), default="情報収集")
    project_type = Column(String(100))
    person_in_charge = Column(String(100))
    competitor = Column(String(200))
    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    log_date = Column(Date, nullable=False)
    activity_type = Column(String(50))
    description = Column(Text, nullable=False)
    staff_name = Column(String(100))
    next_action = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    project = relationship("Project", back_populates="activity_logs")
