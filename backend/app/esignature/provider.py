from abc import ABC, abstractmethod
from datetime import UTC, datetime
from uuid import uuid4

from app.config import settings
from app.esignature.models import AgreementEnvelope


class ESignatureProvider(ABC):
    """Server-side boundary for embedded signing providers.

    A real DocuSign adapter will create recipient views and complete envelopes
    here, keeping API credentials and signing secrets off the browser.
    """

    @abstractmethod
    async def create_envelope(self, agreement_version: str) -> AgreementEnvelope: ...

    @abstractmethod
    async def complete_envelope(self, envelope_id: str) -> AgreementEnvelope | None: ...


class MockDocuSignProvider(ESignatureProvider):
    """Offline DocuSign-shaped provider for the hackathon demo only."""

    def __init__(self) -> None:
        self._envelopes: dict[str, AgreementEnvelope] = {}

    async def create_envelope(self, agreement_version: str) -> AgreementEnvelope:
        envelope = AgreementEnvelope(
            provider="docusign_demo",
            envelope_id=f"demo-{uuid4()}",
            agreement_version=agreement_version,
            status="sent",
        )
        self._envelopes[envelope.envelope_id] = envelope
        return envelope

    async def complete_envelope(self, envelope_id: str) -> AgreementEnvelope | None:
        envelope = self._envelopes.get(envelope_id)
        if envelope is None:
            return None
        if envelope.status == "signed":
            return envelope
        signed = envelope.model_copy(update={"status": "signed", "signed_at": datetime.now(UTC)})
        self._envelopes[envelope_id] = signed
        return signed


_mock_docusign_provider = MockDocuSignProvider()


def get_esignature_provider() -> ESignatureProvider:
    if settings.esignature_provider == "mock_docusign":
        return _mock_docusign_provider
    raise RuntimeError("No server-side electronic-signature provider is configured.")
