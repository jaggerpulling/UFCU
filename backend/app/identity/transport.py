import ssl

import httpx

from app.config import Settings


def create_socure_http_client(settings: Settings) -> httpx.AsyncClient:
    """Build the server-only transport reserved for a future live Socure provider."""

    if not settings.socure_api_key or not settings.socure_api_base_url:
        raise RuntimeError("Socure server credentials are not configured")
    if not settings.socure_api_base_url.startswith("https://"):
        raise RuntimeError("The Socure API endpoint must use HTTPS")

    tls_context = ssl.create_default_context()
    tls_context.minimum_version = ssl.TLSVersion.TLSv1_2
    return httpx.AsyncClient(
        base_url=settings.socure_api_base_url,
        headers={"Authorization": f"Bearer {settings.socure_api_key}"},
        verify=tls_context,
        timeout=httpx.Timeout(10.0),
    )
