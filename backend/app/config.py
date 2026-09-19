from dataclasses import dataclass
from os import getenv
from typing import Literal


def _as_bool(value: str | None, default: bool = True) -> bool:
    if value is None:
        return default
    return value.lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True, slots=True)
class Settings:
    app_name: str = "VERIFIED API"
    app_env: str = getenv("APP_ENV", "development")
    frontend_origin: str = getenv("FRONTEND_ORIGIN", "http://localhost:5173")
    mock_passport: bool = _as_bool(getenv("MOCK_PASSPORT"))
    student_verification_provider: Literal["mock_nsc"] = getenv(  # type: ignore[assignment]
        "STUDENT_VERIFICATION_PROVIDER", "mock_nsc"
    ).lower()
    mock_nova: bool = _as_bool(getenv("MOCK_NOVA"), default=False)
    nova_provider: Literal["auto", "sandbox", "mock"] = getenv(  # type: ignore[assignment]
        "NOVA_PROVIDER", "auto"
    ).lower()
    nova_api_base_url: str = getenv(
        "NOVA_API_BASE_URL", "https://api.sandbox.novacredit.com"
    ).rstrip("/")
    nova_client_id: str | None = getenv("NOVA_CLIENT_ID")
    nova_secret_key: str | None = getenv("NOVA_SECRET_KEY")
    nova_public_id: str | None = getenv("NOVA_PUBLIC_ID")
    nova_product_id: str | None = getenv("NOVA_PRODUCT_ID")
    nova_sandbox_report_id: str | None = getenv("NOVA_SANDBOX_REPORT_ID")

    @property
    def nova_credentials_configured(self) -> bool:
        return all(
            (self.nova_client_id, self.nova_secret_key, self.nova_public_id, self.nova_product_id)
        )

    @property
    def resolved_nova_provider(self) -> Literal["sandbox", "mock"]:
        if self.nova_provider == "mock" or self.mock_nova:
            return "mock"
        if self.nova_credentials_configured:
            return "sandbox"
        return "mock"


settings = Settings()
