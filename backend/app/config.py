from dataclasses import dataclass
from os import getenv
from typing import Literal


def _as_bool(value: str | None, default: bool = True) -> bool:
    if value is None:
        return default
    return value.lower() in {"1", "true", "yes", "on"}


def _clean_url(value: str | None) -> str | None:
    return value.rstrip("/") if value else None


@dataclass(frozen=True, slots=True)
class Settings:
    app_name: str = "VERIFIED API"
    app_env: str = getenv("APP_ENV", "development")
    frontend_origin: str = getenv("FRONTEND_ORIGIN", "http://localhost:5173")
    mock_passport: bool = _as_bool(getenv("MOCK_PASSPORT"))
    identity_provider: Literal["mock_socure"] = getenv(  # type: ignore[assignment]
        "IDENTITY_PROVIDER", "mock_socure"
    ).lower()
    # Reserved for a future authenticated server-side provider. Never expose this
    # value through an API response or a VITE_* frontend environment variable.
    socure_api_key: str | None = getenv("SOCURE_API_KEY")
    socure_api_base_url: str | None = _clean_url(getenv("SOCURE_API_BASE_URL"))
    # Reserved for a future embedded-signing adapter. These values are read only
    # by server-side provider code and must never use a VITE_ prefix.
    esignature_provider: Literal["mock_docusign"] = getenv(  # type: ignore[assignment]
        "ESIGNATURE_PROVIDER", "mock_docusign"
    ).lower()
    docusign_integration_key: str | None = getenv("DOCUSIGN_INTEGRATION_KEY")
    docusign_user_id: str | None = getenv("DOCUSIGN_USER_ID")
    docusign_private_key: str | None = getenv("DOCUSIGN_PRIVATE_KEY")
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
    def docusign_credentials_configured(self) -> bool:
        return all(
            (self.docusign_integration_key, self.docusign_user_id, self.docusign_private_key)
        )

    @property
    def resolved_nova_provider(self) -> Literal["sandbox", "mock"]:
        if self.nova_provider == "mock" or self.mock_nova:
            return "mock"
        if self.nova_credentials_configured:
            return "sandbox"
        return "mock"


settings = Settings()
