from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class SocureIdentityInformation(BaseModel):
    """Minimum passport-derived fields approved for this verification request."""

    model_config = ConfigDict(str_strip_whitespace=True, populate_by_name=True, extra="forbid")

    legal_name: str = Field(alias="legalName", min_length=1)
    date_of_birth: date = Field(alias="dateOfBirth")
    passport_number: str = Field(alias="passportNumber", min_length=1)
    nationality: str = Field(min_length=1)


class SocureConsent(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="forbid")

    granted: Literal[True]


class SocureVerificationRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="forbid")

    consent: SocureConsent
    identity: SocureIdentityInformation


class SocureVerificationResult(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    provider: Literal["socure"]
    verified: bool
    verification_status: Literal[
        "identity_information_verified", "identity_information_not_verified"
    ] = Field(
        serialization_alias="verificationStatus"
    )
    verified_information: list[
        Literal["legal_name", "date_of_birth", "passport_number", "nationality"]
    ] = Field(serialization_alias="verifiedInformation")
    verified_at: datetime = Field(serialization_alias="verifiedAt")
    source: Literal["Socure — Demo Verification"]
    demo: Literal[True]
