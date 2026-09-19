import asyncio

import pytest

from app.config import Settings
from app.identity.transport import create_socure_http_client


def test_live_transport_requires_server_credentials() -> None:
    with pytest.raises(RuntimeError, match="server credentials"):
        create_socure_http_client(Settings(socure_api_key=None, socure_api_base_url=None))


def test_live_transport_rejects_plain_http() -> None:
    with pytest.raises(RuntimeError, match="must use HTTPS"):
        create_socure_http_client(
            Settings(socure_api_key="server-secret", socure_api_base_url="http://example.invalid")
        )


def test_live_transport_accepts_https_without_exposing_secret() -> None:
    client = create_socure_http_client(
        Settings(socure_api_key="server-secret", socure_api_base_url="https://example.invalid")
    )
    try:
        assert str(client.base_url) == "https://example.invalid"
        assert "server-secret" not in repr(client)
    finally:
        asyncio.run(client.aclose())
