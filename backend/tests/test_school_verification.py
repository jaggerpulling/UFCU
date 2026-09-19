from datetime import date

from fastapi.testclient import TestClient

from app.main import app
from app.school.models import PassportIdentity, StudentRecord
from app.school.verification import verify_student

client = TestClient(app)


def test_active_student_is_verified() -> None:
    response = client.post(
        "/api/school/verify",
        json={
            "first_name": " marco ",
            "middle_name": "Reed",
            "last_name": "AMMERMAN",
            "date_of_birth": "1999-01-01",
        },
    )

    assert response.status_code == 200
    assert response.json() == {
        "verified": True,
        "status": "verified",
        "school": "Austin Community College",
        "source": "ACC Demo Connection",
        "enrollment_status": "Currently enrolled",
        "program": "Computer Science",
        "expected_completion_date": "2027-08-31",
    }


def test_inactive_student_is_not_verified() -> None:
    response = client.post(
        "/api/school/verify",
        json={
            "first_name": "JORDAN",
            "middle_name": "LEE",
            "last_name": "CHEN",
            "date_of_birth": "2000-05-12",
        },
    )

    assert response.status_code == 200
    assert response.json()["verified"] is False
    assert response.json()["status"] == "inactive"


def test_unknown_student_is_not_verified() -> None:
    response = client.post(
        "/api/school/verify",
        json={
            "first_name": "ALEX",
            "last_name": "RIVERA",
            "date_of_birth": "1998-03-04",
        },
    )

    assert response.status_code == 200
    assert response.json()["verified"] is False
    assert response.json()["status"] == "no_match"


def test_wrong_middle_name_does_not_match() -> None:
    response = client.post(
        "/api/school/verify",
        json={
            "first_name": "MARCO",
            "middle_name": "OTHER",
            "last_name": "AMMERMAN",
            "date_of_birth": "1999-01-01",
        },
    )

    assert response.json()["status"] == "no_match"


def test_invalid_request_is_rejected() -> None:
    response = client.post(
        "/api/school/verify",
        json={"first_name": " ", "last_name": "AMMERMAN", "date_of_birth": "not-a-date"},
    )

    assert response.status_code == 422


def test_multiple_matching_records_are_not_verified() -> None:
    record = StudentRecord("MARCO", "REED", "AMMERMAN", date(1999, 1, 1), True)

    class DuplicateSchoolDataSource:
        school_name = "Austin Community College"
        source_label = "ACC Demo Connection"

        def students_born_on(self, date_of_birth: date) -> list[StudentRecord]:
            return [record, record]

    identity = PassportIdentity(
        first_name="MARCO",
        middle_name="REED",
        last_name="AMMERMAN",
        date_of_birth=date(1999, 1, 1),
    )

    result = verify_student(identity, DuplicateSchoolDataSource())

    assert result.verified is False
    assert result.status == "ambiguous"
