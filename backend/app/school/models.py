from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class IdentityMatchInformation(BaseModel):
    """The minimum passport-derived fields needed to match a demo enrollment record."""

    model_config = ConfigDict(str_strip_whitespace=True, populate_by_name=True)

    first_name: str = Field(alias="firstName", min_length=1)
    last_name: str = Field(alias="lastName", min_length=1)
    date_of_birth: date = Field(alias="dateOfBirth")


class EnrollmentVerificationRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, populate_by_name=True)

    school_id: str = Field(alias="schoolId", min_length=1)
    identity: IdentityMatchInformation


class EnrollmentVerificationResult(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    provider: Literal["national_student_clearinghouse"]
    school: str
    enrollment_status: str | None = Field(default=None, serialization_alias="enrollmentStatus")
    verified: bool
    verified_at: datetime = Field(serialization_alias="verifiedAt")
    demo: Literal[True]
