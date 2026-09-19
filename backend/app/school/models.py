from dataclasses import dataclass
from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class PassportIdentity(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    first_name: str = Field(min_length=1)
    middle_name: str | None = Field(default=None, min_length=1)
    last_name: str = Field(min_length=1)
    date_of_birth: date


@dataclass(frozen=True)
class StudentRecord:
    first_name: str
    middle_name: str | None
    last_name: str
    date_of_birth: date
    actively_enrolled: bool


class SchoolVerificationResult(BaseModel):
    verified: bool
    status: Literal["verified", "inactive", "no_match", "ambiguous"]
    school: str
    source: str
