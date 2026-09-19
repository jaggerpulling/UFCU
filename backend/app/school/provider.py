from datetime import date
from typing import Protocol

from app.school.models import StudentRecord


class SchoolDataSource(Protocol):
    school_name: str
    source_label: str

    def students_born_on(self, date_of_birth: date) -> list[StudentRecord]: ...


class MockSchoolDataSource:
    """Synthetic ACC records for the hackathon demo."""

    school_name = "Austin Community College"
    source_label = "ACC Demo Connection"

    _students = (
        StudentRecord("MARCO", "REED", "AMMERMAN", date(1999, 1, 1), True),
        StudentRecord("JORDAN", "LEE", "CHEN", date(2000, 5, 12), False),
    )

    def students_born_on(self, date_of_birth: date) -> list[StudentRecord]:
        return [student for student in self._students if student.date_of_birth == date_of_birth]


_mock_school_data_source = MockSchoolDataSource()


def get_school_data_source() -> SchoolDataSource:
    return _mock_school_data_source
