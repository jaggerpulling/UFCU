from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class AgreementEnvelopeRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    agreement_version: str = Field(alias="agreementVersion", min_length=1, max_length=64)


class AgreementEnvelope(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    provider: Literal["docusign_demo"]
    envelope_id: str = Field(serialization_alias="envelopeId")
    agreement_version: str = Field(serialization_alias="agreementVersion")
    status: Literal["sent", "signed"]
    signed_at: datetime | None = Field(default=None, serialization_alias="signedAt")
    demo: Literal[True] = True


class CompleteAgreementRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    # This is only an acknowledgement. The typed signature is deliberately not
    # accepted or persisted by the demo API.
    electronic_records_consent: Literal[True] = Field(alias="electronicRecordsConsent")
