from app.school.models import PassportIdentity, SchoolVerificationResult, StudentRecord
from app.school.provider import SchoolDataSource


def _same_name(left: str, right: str) -> bool:
    return " ".join(left.split()).casefold() == " ".join(right.split()).casefold()


def _matches(identity: PassportIdentity, student: StudentRecord) -> bool:
    return (
        identity.date_of_birth == student.date_of_birth
        and _same_name(identity.first_name, student.first_name)
        and _same_name(identity.last_name, student.last_name)
        and (
            identity.middle_name is None
            or (
                student.middle_name is not None
                and _same_name(identity.middle_name, student.middle_name)
            )
        )
    )


def verify_student(
    identity: PassportIdentity, school_data: SchoolDataSource
) -> SchoolVerificationResult:
    source = {"school": school_data.school_name, "source": school_data.source_label}
    matches = [
        student
        for student in school_data.students_born_on(identity.date_of_birth)
        if _matches(identity, student)
    ]
    if not matches:
        return SchoolVerificationResult(verified=False, status="no_match", **source)
    if len(matches) > 1:
        return SchoolVerificationResult(verified=False, status="ambiguous", **source)
    student = matches[0]
    if not student.actively_enrolled:
        return SchoolVerificationResult(verified=False, status="inactive", **source)
    return SchoolVerificationResult(
        verified=True,
        status="verified",
        enrollment_status="Currently enrolled",
        program=student.program,
        expected_completion_date=student.expected_completion_date,
        **source,
    )
