from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_mock_docusign_envelope_records_only_completion_metadata() -> None:
    created = client.post(
        "/api/esignature/envelopes",
        json={"agreementVersion": "UFCU-DEMO-MEMBERSHIP-2026-09"},
    )

    assert created.status_code == 200
    envelope = created.json()
    assert envelope["provider"] == "docusign_demo"
    assert envelope["status"] == "sent"
    assert envelope["signedAt"] is None
    assert set(envelope) == {
        "provider",
        "envelopeId",
        "agreementVersion",
        "status",
        "signedAt",
        "demo",
    }

    completed = client.post(
        f"/api/esignature/envelopes/{envelope['envelopeId']}/complete",
        json={"electronicRecordsConsent": True},
    )

    assert completed.status_code == 200
    result = completed.json()
    assert result["status"] == "signed"
    assert result["signedAt"]
    assert result["agreementVersion"] == "UFCU-DEMO-MEMBERSHIP-2026-09"
