import asyncio

from fastapi.testclient import TestClient

from app.main import app
from app.school.models import EnrollmentVerificationRequest
from app.school.provider import MockNationalStudentClearinghouseProvider

client = TestClient(app)


def demo_request(**overrides: object) -> dict[str, object]:
    request: dict[str, object] = {
        "schoolId": "austin-community-college",
        "identity": {
            "firstName": "MARCO",
            "lastName": "AMMERMAN",
            "dateOfBirth": "1999-01-01",
        },
    }
    request.update(overrides)
    return request


def test_demo_acc_enrollment_is_verified() -> None:
    response = client.post("/api/school/verify", json=demo_request())

    assert response.status_code == 200
    result = response.json()
    assert result["provider"] == "national_student_clearinghouse"
    assert result["school"] == "Austin Community College"
    assert result["enrollmentStatus"] == "Currently Enrolled"
    assert result["verified"] is True
    assert result["verifiedAt"]
    assert result["demo"] is True
    assert set(result) == {
        "provider",
        "school",
        "enrollmentStatus",
        "verified",
        "verifiedAt",
        "demo",
    }


def test_unknown_identity_is_not_verified() -> None:
    response = client.post(
        "/api/school/verify",
        json=demo_request(
            identity={
                "firstName": "ALEX",
                "lastName": "RIVERA",
                "dateOfBirth": "1998-03-04",
            }
        ),
    )

    assert response.status_code == 200
    assert response.json()["verified"] is False
    assert "enrollmentStatus" not in response.json()


def test_other_supported_school_does_not_use_the_acc_demo_match() -> None:
    response = client.post(
        "/api/school/verify",
        json=demo_request(schoolId="texas-state-university"),
    )

    assert response.status_code == 200
    assert response.json()["school"] == "Texas State University"
    assert response.json()["verified"] is False


def test_invalid_request_is_rejected() -> None:
    response = client.post(
        "/api/school/verify",
        json={
            "schoolId": "austin-community-college",
            "identity": {"firstName": " ", "lastName": "AMMERMAN", "dateOfBirth": "bad"},
        },
    )

    assert response.status_code == 422


def test_provider_interface_returns_demo_result() -> None:
    provider = MockNationalStudentClearinghouseProvider()
    request = EnrollmentVerificationRequest.model_validate(demo_request())

    result = asyncio.run(provider.verify_enrollment(request))

    assert result.verified is True
    assert result.demo is True
