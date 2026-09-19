import asyncio
import base64
import time
from typing import Any, Literal
from uuid import uuid4

import httpx
from pydantic import BaseModel, ConfigDict, Field

from app.config import Settings


class NovaUpstreamError(RuntimeError):
    def __init__(self, message: str, status_code: int = 502) -> None:
        super().__init__(message)
        self.status_code = status_code


class NovaPrefill(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    first_name: str = Field(alias="firstName", min_length=1, max_length=254)
    last_name: str = Field(alias="lastName", min_length=1, max_length=254)
    email: str = Field(min_length=3, max_length=100)
    dob: str | None = None
    city: str | None = Field(default=None, max_length=100)


class NovaInitializationRequest(BaseModel):
    consent: Literal[True]
    prefill: NovaPrefill
    country: str | None = Field(default=None, min_length=3, max_length=3)
    external_id: str | None = Field(default=None, alias="externalId", max_length=64)


class NovaInitializationResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    provider: Literal["nova_sandbox", "demo_mock"]
    provider_label: str = Field(alias="providerLabel")
    token: str
    public_token: str = Field(alias="publicToken")
    public_id: str = Field(alias="publicId")
    product_id: str = Field(alias="productId")
    expires_in: int = Field(default=600, alias="expiresIn")


class NovaCompletionRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    public_token: str = Field(alias="publicToken", min_length=1)
    status: str | None = None


class NovaWebhookPayload(BaseModel):
    model_config = ConfigDict(extra="allow", populate_by_name=True)

    public_token: str = Field(alias="publicToken", min_length=1)
    status: str
    substatus: str | None = None


class MockNovaStore:
    def __init__(self) -> None:
        self._statuses: dict[str, dict[str, Any]] = {}
        self._lock = asyncio.Lock()

    async def initialize(self) -> tuple[str, str]:
        public_token = f"demo-{uuid4()}"
        async with self._lock:
            self._statuses[public_token] = {"status": "INITIALIZED"}
        return f"demo-init-{uuid4()}", public_token

    async def complete(self, public_token: str) -> None:
        async with self._lock:
            if public_token in self._statuses:
                self._statuses[public_token] = {"status": "SUCCESS"}

    async def status(self, public_token: str) -> dict[str, Any]:
        async with self._lock:
            return self._statuses.get(public_token, {"status": "ERROR", "substatus": "NOT_FOUND"})

    async def received_status(self, public_token: str) -> dict[str, Any] | None:
        async with self._lock:
            return self._statuses.get(public_token)

    async def apply_webhook(self, payload: NovaWebhookPayload) -> None:
        async with self._lock:
            self._statuses[payload.public_token] = payload.model_dump(
                by_alias=True, exclude_none=True
            )


mock_nova_store = MockNovaStore()


class NovaClient:
    def __init__(
        self, settings: Settings, transport: httpx.AsyncBaseTransport | None = None
    ) -> None:
        self.settings = settings
        self.transport = transport

    @property
    def is_mock(self) -> bool:
        return self.settings.resolved_nova_provider == "mock"

    def _basic_auth(self) -> str:
        credentials = f"{self.settings.nova_client_id}:{self.settings.nova_secret_key}"
        return base64.b64encode(credentials.encode()).decode()

    async def _request(self, method: str, path: str, **kwargs: Any) -> httpx.Response:
        try:
            async with httpx.AsyncClient(
                base_url=self.settings.nova_api_base_url,
                timeout=15,
                transport=self.transport,
            ) as client:
                response = await client.request(method, path, **kwargs)
            response.raise_for_status()
            return response
        except httpx.HTTPStatusError as exc:
            detail = exc.response.text[:300] or "Nova Credit rejected the request"
            raise NovaUpstreamError(detail, 502) from exc
        except httpx.HTTPError as exc:
            raise NovaUpstreamError("Nova Credit is temporarily unavailable", 503) from exc

    async def initialize(self, request: NovaInitializationRequest) -> NovaInitializationResponse:
        if self.is_mock:
            token, public_token = await mock_nova_store.initialize()
            return NovaInitializationResponse(
                provider="demo_mock",
                providerLabel="Nova Credit — Demo mock provider",
                token=token,
                publicToken=public_token,
                publicId="demo-public-id",
                productId="demo-product-id",
            )

        body: dict[str, Any] = {
            "token": "JWT",
            "prefill": request.prefill.model_dump(by_alias=True, exclude_none=True),
        }
        if request.country:
            body["country"] = request.country.upper()
        if request.external_id:
            body["externalId"] = request.external_id
        if self.settings.nova_sandbox_report_id:
            body["sandboxReportId"] = self.settings.nova_sandbox_report_id

        response = await self._request(
            "POST",
            "/connect/initialization",
            headers={
                "Authorization": f"Basic {self._basic_auth()}",
                "Content-Type": "application/json",
                "X-PRODUCT-ID": str(self.settings.nova_product_id),
                "X-PUBLIC-ID": str(self.settings.nova_public_id),
            },
            json=body,
        )
        data = response.json()
        try:
            return NovaInitializationResponse(
                provider="nova_sandbox",
                providerLabel="Nova Credit Sandbox",
                token=data["token"],
                publicToken=data["publicToken"],
                publicId=str(self.settings.nova_public_id),
                productId=str(self.settings.nova_product_id),
            )
        except (KeyError, TypeError) as exc:
            raise NovaUpstreamError(
                "Nova Credit returned an invalid initialization response"
            ) from exc

    async def complete(self, public_token: str) -> None:
        if self.is_mock:
            await mock_nova_store.complete(public_token)

    async def _access_token(self) -> str:
        response = await self._request(
            "GET",
            "/connect/accesstoken",
            headers={"Authorization": f"Basic {self._basic_auth()}"},
        )
        access_token = response.json().get("accessToken")
        if not access_token:
            raise NovaUpstreamError("Nova Credit returned an invalid access-token response")
        # Nova documents strict base64 encoding of the access token in Bearer requests.
        return base64.b64encode(access_token.encode()).decode()

    async def status(self, public_token: str) -> dict[str, Any]:
        if self.is_mock:
            return await mock_nova_store.status(public_token)
        webhook_status = await mock_nova_store.received_status(public_token)
        if webhook_status:
            return webhook_status
        access_token = await self._access_token()
        response = await self._request(
            "GET",
            "/connect/status",
            headers={
                "Authorization": f"Bearer {access_token}",
                "X-PUBLIC-TOKEN": public_token,
            },
        )
        return response.json()

    async def report(self, public_token: str) -> dict[str, Any]:
        if self.is_mock:
            status = await mock_nova_store.status(public_token)
            if status.get("status") != "SUCCESS":
                raise NovaUpstreamError("The demo report is not ready", 409)
            return {
                "status": "SUCCESS",
                "publicToken": public_token,
                "reportGeneratedAt": int(time.time()),
                "creditHistory": {
                    "historyLengthYears": 4,
                    "activeAccounts": 3,
                    "paymentHistory": "Strong",
                    "reportedDelinquencies": 0,
                },
                "isSynthetic": True,
                "source": "Nova Credit — Demo Data",
            }
        access_token = await self._access_token()
        response = await self._request(
            "GET",
            "/connect/passport/v4/json",
            headers={
                "Authorization": f"Bearer {access_token}",
                "X-PUBLIC-TOKEN": public_token,
            },
        )
        return response.json()
