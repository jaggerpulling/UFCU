from dataclasses import dataclass
from os import getenv


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
    mock_school: bool = _as_bool(getenv("MOCK_SCHOOL"))
    mock_nova: bool = _as_bool(getenv("MOCK_NOVA"))


settings = Settings()
