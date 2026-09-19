import asyncio
import logging

from fastapi.testclient import TestClient

from app.identity.audit import consent_audit_log
from app.identity.models import SocureIdentityInformation
from app.identity.provider import MockSocureVerificationProvider, SocureVerificationProvider
from app.main import app

client = TestClient(app)


def demo_request(*, consent: bool = True) -> dict[str, object]:
    return {
        "consent": {"granted": consent},
        "identity": {
            "legalName": "Marco Reed Ammerman",
            "dateOfBirth": "1999-01-01",
            "passportNumber": "A•••••482",
            "nationality": "United States",
        },
    }


def liveness_request(*, biometric_consent: bool = True) -> dict[str, object]:
    return {
        **demo_request(),
        "biometricDataConsent": biometric_consent,
        "livenessImages": [
            {"challenge": "center_face", "imageData": "a" * 32},
            {"challenge": "turn_left", "imageData": "a" * 32},
            {"challenge": "turn_right", "imageData": "a" * 32},
            {"challenge": "blink", "imageData": "a" * 32},
        ],
    }


def setup_function() -> None:
    consent_audit_log.clear()


def test_demo_identity_verification_is_server_mediated_and_labeled() -> None:
    response = client.post("/api/identity/socure/verify", json=demo_request())

    assert response.status_code == 200
    assert response.json() == {
        "provider": "socure",
        "verified": True,
        "verificationStatus": "identity_information_verified",
        "verifiedInformation": [
            "legal_name",
            "date_of_birth",
            "passport_number",
            "nationality",
        ],
        "verifiedAt": response.json()["verifiedAt"],
        "source": "Socure — Demo Verification",
        "demo": True,
    }


def test_explicit_consent_is_required_before_provider_call() -> None:
    response = client.post("/api/identity/socure/verify", json=demo_request(consent=False))

    assert response.status_code == 422
    assert consent_audit_log.snapshot() == ()


def test_validation_errors_do_not_echo_sensitive_values() -> None:
    request = demo_request()
    request["identity"] = {
        "legalName": "Sensitive Name",
        "dateOfBirth": "not-a-date",
        "passportNumber": "SECRET-PASSPORT-123",
        "nationality": "Sensitive Nationality",
    }

    response = client.post("/api/identity/socure/verify", json=request)

    assert response.status_code == 422
    assert "Sensitive Name" not in response.text
    assert "SECRET-PASSPORT-123" not in response.text
    assert "Sensitive Nationality" not in response.text
    assert consent_audit_log.snapshot() == ()


def test_unapproved_fields_are_rejected_before_provider_boundary() -> None:
    request = demo_request()
    identity = request["identity"]
    assert isinstance(identity, dict)
    identity["schoolInformation"] = "must-not-be-forwarded"

    response = client.post("/api/identity/socure/verify", json=request)

    assert response.status_code == 422
    assert "must-not-be-forwarded" not in response.text
    assert consent_audit_log.snapshot() == ()


def test_consent_audit_event_contains_metadata_not_identity_values(caplog) -> None:
    caplog.set_level(logging.INFO, logger="verified.audit")

    response = client.post("/api/identity/socure/verify", json=demo_request())

    assert response.status_code == 200
    [event] = consent_audit_log.snapshot()
    assert event.granted is True
    assert event.provider == "socure"
    assert event.shared_field_names == (
        "legal_name",
        "date_of_birth",
        "passport_number",
        "nationality",
    )
    serialized_event = repr(event)
    log_output = caplog.text
    for sensitive_value in (
        "Marco Reed Ammerman",
        "1999-01-01",
        "A•••••482",
        "United States",
    ):
        assert sensitive_value not in serialized_event
        assert sensitive_value not in log_output


def test_unknown_identity_returns_unverified_without_exposing_values() -> None:
    request = demo_request()
    request["identity"] = {
        "legalName": "Alex Rivera",
        "dateOfBirth": "1998-03-04",
        "passportNumber": "TEST-123",
        "nationality": "Canada",
    }

    response = client.post("/api/identity/socure/verify", json=request)

    assert response.status_code == 200
    assert response.json()["verified"] is False
    assert response.json()["verificationStatus"] == "identity_information_not_verified"
    assert response.json()["verifiedInformation"] == []
    assert "TEST-123" not in response.text


def test_mock_implements_socure_provider_interface() -> None:
    provider: SocureVerificationProvider = MockSocureVerificationProvider()
    identity = SocureIdentityInformation.model_validate(demo_request()["identity"])

    result = asyncio.run(provider.verify_identity(identity))

    assert result.verified is True
    assert result.demo is True


def test_liveness_images_require_explicit_biometric_consent_and_are_not_audited() -> None:
    response = client.post("/api/identity/socure/liveness", json=liveness_request())

    assert response.status_code == 204
    [event] = consent_audit_log.snapshot()
    assert event.shared_field_names == ("liveness_images_highly_sensitive_biometric_data",)
    assert "a" * 32 not in repr(event)

    response = client.post(
        "/api/identity/socure/liveness", json=liveness_request(biometric_consent=False)
    )

    assert response.status_code == 422


def test_liveness_validation_does_not_echo_biometric_images() -> None:
    request = liveness_request()
    images = request["livenessImages"]
    assert isinstance(images, list)
    images[0]["imageData"] = "BIOMETRIC-IMAGE-MUST-NOT-ECHO"  # type: ignore[index]

    response = client.post("/api/identity/socure/liveness", json=request)

    assert response.status_code == 422
    assert "BIOMETRIC-IMAGE-MUST-NOT-ECHO" not in response.text


def test_demo_address_is_verified() -> None:
    response = client.post(
        "/api/identity/socure/address/verify",
        json={
            "address": {
                "streetAddress": "123 Demo Street",
                "city": "Austin",
                "state": "TX",
                "zipCode": "78701",
            }
        },
    )

    assert response.status_code == 200
    result = response.json()
    assert result["verified"] is True
    assert result["verifiedAt"]
    assert result["source"] == "Socure — Demo Verification"
    assert result["demo"] is True
