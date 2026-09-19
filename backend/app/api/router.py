from typing import Any, Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.config import settings
from app.identity.audit import consent_audit_log
from app.identity.models import SocureVerificationRequest, SocureVerificationResult
from app.identity.provider import SocureVerificationProvider, get_socure_verification_provider
from app.nova import (
    NovaClient,
    NovaCompletionRequest,
    NovaInitializationRequest,
    NovaInitializationResponse,
    NovaUpstreamError,
    NovaWebhookPayload,
    mock_nova_store,
)
from app.school.models import EnrollmentVerificationRequest, EnrollmentVerificationResult
from app.school.provider import StudentVerificationProvider, get_student_verification_provider

router = APIRouter()


class HealthResponse(BaseModel):
    status: Literal["ok"]
    service: str


@router.get("/health", response_model=HealthResponse, tags=["system"])
async def health_check() -> HealthResponse:
    return HealthResponse(status="ok", service="verified-api")


@router.post(
    "/identity/socure/verify",
    response_model=SocureVerificationResult,
    response_model_by_alias=True,
    tags=["identity"],
)
async def verify_identity_with_socure(
    request: SocureVerificationRequest,
    provider: SocureVerificationProvider = Depends(get_socure_verification_provider),
) -> SocureVerificationResult:
    # Validation requires consent.granted=true. Record only consent metadata, then
    # pass the minimized identity object across the provider boundary.
    consent_audit_log.record_socure_consent()
    return await provider.verify_identity(request.identity)


@router.post(
    "/school/verify",
    response_model=EnrollmentVerificationResult,
    response_model_by_alias=True,
    response_model_exclude_none=True,
    tags=["school"],
)
async def verify_school_enrollment(
    request: EnrollmentVerificationRequest,
    provider: StudentVerificationProvider = Depends(get_student_verification_provider),
) -> EnrollmentVerificationResult:
    return await provider.verify_enrollment(request)


def _nova_client() -> NovaClient:
    return NovaClient(settings)


def _raise_nova_error(error: NovaUpstreamError) -> None:
    raise HTTPException(status_code=error.status_code, detail=str(error)) from error


@router.post(
    "/nova/initialize",
    response_model=NovaInitializationResponse,
    response_model_by_alias=True,
    tags=["nova"],
)
async def initialize_nova(request: NovaInitializationRequest) -> NovaInitializationResponse:
    try:
        return await _nova_client().initialize(request)
    except NovaUpstreamError as error:
        _raise_nova_error(error)


@router.post("/nova/complete", status_code=204, tags=["nova"])
async def complete_nova(request: NovaCompletionRequest) -> None:
    await _nova_client().complete(request.public_token)


@router.get("/nova/status/{public_token}", tags=["nova"])
async def nova_status(public_token: str) -> dict[str, Any]:
    try:
        return await _nova_client().status(public_token)
    except NovaUpstreamError as error:
        _raise_nova_error(error)


@router.get("/nova/report/{public_token}", tags=["nova"])
async def nova_report(public_token: str) -> dict[str, Any]:
    try:
        return await _nova_client().report(public_token)
    except NovaUpstreamError as error:
        _raise_nova_error(error)


@router.post("/nova/webhook", status_code=204, tags=["nova"])
async def nova_webhook(payload: NovaWebhookPayload) -> None:
    # Nova webhook delivery is an alternative signal to client polling. Production
    # deployments should additionally verify webhook signatures at the edge.
    await mock_nova_store.apply_webhook(payload)
