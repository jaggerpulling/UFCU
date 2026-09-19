from datetime import UTC, date, datetime
from typing import Protocol

from app.config import settings
from app.school.models import EnrollmentVerificationRequest, EnrollmentVerificationResult


class StudentVerificationProvider(Protocol):
    async def verify_enrollment(
        self, request: EnrollmentVerificationRequest
    ) -> EnrollmentVerificationResult: ...


class MockNationalStudentClearinghouseProvider:
    """Offline synthetic provider; it does not connect to NSC or a school system."""

    provider_name = "national_student_clearinghouse"
    schools = {
        "austin-community-college": "Austin Community College",
        "university-of-texas-at-austin": "The University of Texas at Austin",
        "texas-state-university": "Texas State University",
        "st-edwards-university": "St. Edward's University",
    }

    async def verify_enrollment(
        self, request: EnrollmentVerificationRequest
    ) -> EnrollmentVerificationResult:
        school = self.schools.get(request.school_id, request.school_id)
        identity = request.identity
        is_demo_match = (
            request.school_id == "austin-community-college"
            and _same_text(identity.first_name, "MARCO")
            and _same_text(identity.last_name, "AMMERMAN")
            and identity.date_of_birth == date(1999, 1, 1)
        )

        return EnrollmentVerificationResult(
            provider=self.provider_name,
            school=school,
            enrollment_status="Currently Enrolled" if is_demo_match else None,
            verified=is_demo_match,
            verified_at=datetime.now(UTC),
            demo=True,
        )


def _same_text(left: str, right: str) -> bool:
    return " ".join(left.split()).casefold() == " ".join(right.split()).casefold()


_mock_nsc_provider = MockNationalStudentClearinghouseProvider()


def get_student_verification_provider() -> StudentVerificationProvider:
    if settings.student_verification_provider == "mock_nsc":
        return _mock_nsc_provider
    raise RuntimeError(
        "No authenticated student verification provider is configured. "
        "Use STUDENT_VERIFICATION_PROVIDER=mock_nsc for local development."
    )
