from typing import Any, Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.config import settings
from app.nova import (
    NovaClient,
    NovaCompletionRequest,
    NovaInitializationRequest,
    NovaInitializationResponse,
    NovaUpstreamError,
    NovaWebhookPayload,
    mock_nova_store,
)
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


@router.post(
    "/school/verify",
    response_model=SchoolVerificationResult,
    response_model_exclude_none=True,
    tags=["school"],
)
def verify_school_enrollment(
    identity: PassportIdentity,
    school_data: SchoolDataSource = Depends(get_school_data_source),
) -> SchoolVerificationResult:
    return verify_student(identity, school_data)


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
