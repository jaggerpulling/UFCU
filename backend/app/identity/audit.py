import logging
from dataclasses import dataclass
from datetime import UTC, datetime
from threading import Lock
from typing import Literal
from uuid import UUID, uuid4

logger = logging.getLogger("verified.audit")


@dataclass(frozen=True, slots=True)
class ConsentAuditEvent:
    """Consent metadata only. Sensitive identity values must never be added here."""

    event_id: UUID
    event_type: Literal["identity_provider_consent"]
    provider: Literal["socure"]
    purpose: str
    shared_field_names: tuple[str, ...]
    granted: bool
    recorded_at: datetime


class ConsentAuditLog:
    def __init__(self) -> None:
        self._events: list[ConsentAuditEvent] = []
        self._lock = Lock()

    def record_socure_consent(self) -> ConsentAuditEvent:
        event = ConsentAuditEvent(
            event_id=uuid4(),
            event_type="identity_provider_consent",
            provider="socure",
            purpose="Verify additional identity information required for onboarding",
            shared_field_names=(
                "legal_name",
                "date_of_birth",
                "passport_number",
                "nationality",
            ),
            granted=True,
            recorded_at=datetime.now(UTC),
        )
        with self._lock:
            self._events.append(event)

        # Deliberately log metadata only: never the request model or identity values.
        logger.info(
            "consent_recorded event_id=%s provider=%s purpose=%s fields=%s granted=%s",
            event.event_id,
            event.provider,
            event.purpose,
            ",".join(event.shared_field_names),
            event.granted,
        )
        return event

    def record_socure_biometric_consent(self) -> ConsentAuditEvent:
        event = ConsentAuditEvent(
            event_id=uuid4(),
            event_type="identity_provider_consent",
            provider="socure",
            purpose="Verify live presence for onboarding",
            shared_field_names=("liveness_images_highly_sensitive_biometric_data",),
            granted=True,
            recorded_at=datetime.now(UTC),
        )
        with self._lock:
            self._events.append(event)
        logger.info(
            "consent_recorded event_id=%s provider=%s purpose=%s fields=%s granted=%s",
            event.event_id,
            event.provider,
            event.purpose,
            ",".join(event.shared_field_names),
            event.granted,
        )
        return event

    def snapshot(self) -> tuple[ConsentAuditEvent, ...]:
        with self._lock:
            return tuple(self._events)

    def clear(self) -> None:
        with self._lock:
            self._events.clear()


consent_audit_log = ConsentAuditLog()
