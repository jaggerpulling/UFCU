import base64
from typing import Any

import httpx
import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.main import app
from app.nova import NovaClient, NovaInitializationRequest


def initialization_payload() -> dict[str, Any]:
    return {
        "consent": True,
        "prefill": {
            "firstName": "Maya",
            "lastName": "Okafor",
            "email": "maya@example.com",
            "dob": "2004-02-14",
        },
        "country": "NGA",
        "externalId": "member-123",
    }


def sandbox_settings() -> Settings:
    return Settings(
        mock_nova=False,
        nova_provider="sandbox",
        nova_api_base_url="https://api.sandbox.novacredit.com",
        nova_client_id="client-id",
        nova_secret_key="secret-key",
        nova_public_id="public-id",
        nova_product_id="product-id",
    )


def test_missing_credentials_resolve_to_mock() -> None:
    configured = Settings(mock_nova=False, nova_provider="auto")
    assert configured.resolved_nova_provider == "mock"


def test_initialize_requires_explicit_consent() -> None:
    client = TestClient(app)
    payload = initialization_payload()
    payload["consent"] = False
    response = client.post("/api/nova/initialize", json=payload)
    assert response.status_code == 422


def test_mock_flow_initializes_completes_and_returns_synthetic_report(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    from app.api import router as router_module

    mock_settings = Settings(mock_nova=True, nova_provider="auto")
    monkeypatch.setattr(router_module, "_nova_client", lambda: NovaClient(mock_settings))
    client = TestClient(app)

    initialized = client.post("/api/nova/initialize", json=initialization_payload())
    assert initialized.status_code == 200
    body = initialized.json()
    assert body["provider"] == "demo_mock"
    assert "Demo mock provider" in body["providerLabel"]

    completed = client.post(
        "/api/nova/complete",
        json={"publicToken": body["publicToken"], "status": "SUCCESS"},
    )
    assert completed.status_code == 204
    status = client.get(f"/api/nova/status/{body['publicToken']}")
    assert status.json() == {"status": "SUCCESS"}
    report = client.get(f"/api/nova/report/{body['publicToken']}")
    assert report.status_code == 200
    assert report.json()["isSynthetic"] is True


@pytest.mark.asyncio
async def test_sandbox_calls_use_server_credentials_and_documented_auth() -> None:
    requests: list[httpx.Request] = []

    def handler(request: httpx.Request) -> httpx.Response:
        requests.append(request)
        if request.url.path == "/connect/initialization":
            return httpx.Response(200, json={"token": "single-use", "publicToken": "public-token"})
        if request.url.path == "/connect/accesstoken":
            return httpx.Response(200, json={"accessToken": "short-lived"})
        if request.url.path == "/connect/status":
            return httpx.Response(200, json={"status": "SUCCESS"})
        return httpx.Response(200, json={"report": "ready"})

    client = NovaClient(sandbox_settings(), transport=httpx.MockTransport(handler))
    request = NovaInitializationRequest.model_validate(initialization_payload())
    initialized = await client.initialize(request)
    assert initialized.token == "single-use"
    assert await client.status("public-token") == {"status": "SUCCESS"}
    assert await client.report("public-token") == {"report": "ready"}

    basic = base64.b64encode(b"client-id:secret-key").decode()
    bearer = base64.b64encode(b"short-lived").decode()
    init_request = requests[0]
    assert init_request.headers["Authorization"] == f"Basic {basic}"
    assert init_request.headers["X-PRODUCT-ID"] == "product-id"
    assert init_request.headers["X-PUBLIC-ID"] == "public-id"
    assert "secret-key" not in init_request.content.decode()
    status_request = next(request for request in requests if request.url.path == "/connect/status")
    assert status_request.headers["Authorization"] == f"Bearer {bearer}"
    assert status_request.headers["X-PUBLIC-TOKEN"] == "public-token"
