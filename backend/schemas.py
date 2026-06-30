from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


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


