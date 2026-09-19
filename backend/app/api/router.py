from typing import Literal

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.school.models import PassportIdentity, SchoolVerificationResult
from app.school.provider import SchoolDataSource, get_school_data_source
from app.school.verification import verify_student

router = APIRouter()


class HealthResponse(BaseModel):
    status: Literal["ok"]
    service: str


@router.get("/health", response_model=HealthResponse, tags=["system"])
async def health_check() -> HealthResponse:
    return HealthResponse(status="ok", service="verified-api")


@router.post("/school/verify", response_model=SchoolVerificationResult, tags=["school"])
def verify_school_enrollment(
    identity: PassportIdentity,
    school_data: SchoolDataSource = Depends(get_school_data_source),
) -> SchoolVerificationResult:
    return verify_student(identity, school_data)
