from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import date, datetime


class OpportunityBase(BaseModel):
    opportunity_name: str
    client_organization: Optional[str] = None
    client_contact: Optional[str] = None
    bid_date: Optional[date] = None
    estimated_amount: Optional[float] = 0
    win_probability: Optional[int] = 50
    stage: Optional[str] = "情報収集"
    project_type: Optional[str] = None
    person_in_charge: Optional[str] = None
    competitor: Optional[str] = None
    notes: Optional[str] = None


class OpportunityCreate(OpportunityBase):
    pass


class OpportunityUpdate(BaseModel):
    opportunity_name: Optional[str] = None
    client_organization: Optional[str] = None
    client_contact: Optional[str] = None
    bid_date: Optional[date] = None
    estimated_amount: Optional[float] = None
    win_probability: Optional[int] = None
    stage: Optional[str] = None
    project_type: Optional[str] = None
    person_in_charge: Optional[str] = None
    competitor: Optional[str] = None
    notes: Optional[str] = None


class OpportunityResponse(OpportunityBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProjectBase(BaseModel):
    business_number: str
    project_name: str
    client_organization: Optional[str] = None
    client_contact: Optional[str] = None
    contract_date: Optional[date] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    contract_amount: Optional[float] = 0
    project_type: Optional[str] = None
    person_in_charge: Optional[str] = None
    chief_engineer: Optional[str] = None
    review_engineer: Optional[str] = None
    progress_rate: Optional[int] = 0
    status: Optional[str] = "進行中"
    notes: Optional[str] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    business_number: Optional[str] = None
    project_name: Optional[str] = None
    client_organization: Optional[str] = None
    client_contact: Optional[str] = None
    contract_date: Optional[date] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    contract_amount: Optional[float] = None
    project_type: Optional[str] = None
    person_in_charge: Optional[str] = None
    chief_engineer: Optional[str] = None
    review_engineer: Optional[str] = None
    progress_rate: Optional[int] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class ProjectResponse(ProjectBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ActivityLogBase(BaseModel):
    project_id: int
    log_date: date
    activity_type: Optional[str] = None
    description: str
    staff_name: Optional[str] = None
    next_action: Optional[str] = None


class ActivityLogCreate(ActivityLogBase):
    pass


class ActivityLogResponse(ActivityLogBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


