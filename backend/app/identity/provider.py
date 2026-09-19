from abc import ABC, abstractmethod
from datetime import UTC, date, datetime

from app.config import settings
from app.identity.models import (
    SocureAddressInformation,
    SocureAddressVerificationResult,
    SocureIdentityInformation,
    SocureLivenessImage,
    SocureVerificationResult,
)


class SocureVerificationProvider(ABC):
    """Server-side boundary shared by mock and future authenticated providers."""

    @abstractmethod
    async def verify_identity(
        self, identity: SocureIdentityInformation
    ) -> SocureVerificationResult:
        """Verify only the identity fields explicitly approved by the member."""

    @abstractmethod
    async def submit_liveness_images(
        self, identity: SocureIdentityInformation, images: list[SocureLivenessImage]
    ) -> None:
        """Send transient, consented highly sensitive biometric liveness evidence."""

    @abstractmethod
    async def verify_address(
        self, address: SocureAddressInformation
    ) -> SocureAddressVerificationResult:
        """Verify an address through the server-side provider boundary."""


class MockSocureVerificationProvider(SocureVerificationProvider):
    """Offline synthetic provider. No request is sent to Socure or any third party."""

    async def verify_identity(
        self, identity: SocureIdentityInformation
    ) -> SocureVerificationResult:
        # The deterministic match keeps the hackathon flow useful without claiming
        # access to any document, government record, or live Socure capability.
        is_demo_match = (
            _same_text(identity.legal_name, "Marco Reed Ammerman")
            and identity.date_of_birth == date(1999, 1, 1)
            and _same_text(identity.nationality, "United States")
            and identity.passport_number == "A•••••482"
        )
        return SocureVerificationResult(
            provider="socure",
            verified=is_demo_match,
            verification_status=(
                "identity_information_verified"
                if is_demo_match
                else "identity_information_not_verified"
            ),
            verified_information=[
                "legal_name",
                "date_of_birth",
                "passport_number",
                "nationality",
            ]
            if is_demo_match
            else [],
            verified_at=datetime.now(UTC),
            source="Socure — Demo Verification",
            demo=True,
        )

    async def submit_liveness_images(
        self, identity: SocureIdentityInformation, images: list[SocureLivenessImage]
    ) -> None:
        # Intentionally discard the frames. The offline demo must never retain,
        # inspect, or log highly sensitive biometric data.
        del identity, images

    async def verify_address(
        self, address: SocureAddressInformation
    ) -> SocureAddressVerificationResult:
        # Any syntactically complete address is a verified synthetic response in
        # this demo. A real provider would run this request server-side.
        del address
        return SocureAddressVerificationResult(
            verified=True,
            verified_at=datetime.now(UTC),
            source="Socure — Demo Verification",
            demo=True,
        )


def _same_text(left: str, right: str) -> bool:
    return " ".join(left.split()).casefold() == " ".join(right.split()).casefold()


_mock_socure_provider = MockSocureVerificationProvider()


def get_socure_verification_provider() -> SocureVerificationProvider:
    if settings.identity_provider == "mock_socure":
        return _mock_socure_provider
    raise RuntimeError(
        "No authenticated identity provider is configured. "
        "Use IDENTITY_PROVIDER=mock_socure for the offline demo."
    )
