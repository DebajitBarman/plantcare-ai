"""
PlantCare AI - Comprehensive Backend & API Integration Tests
Tests all endpoints: Health, Detection, Diseases, Products, History, Advisory, Weather, and Validation.
"""

import io
from PIL import Image
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_health():
    print("Testing GET /api/health...")
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    data = res.json()
    assert data["status"] == "online"
    assert "ml_engine" in data
    print(f"[PASS] Health OK: ML engine status = {data['ml_engine']['architecture']}")


def test_crops():
    print("Testing GET /api/crops...")
    res = client.get("/api/crops")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] > 0
    print(f"[PASS] Crops OK: {data['total']} crops loaded.")


def test_diseases():
    print("Testing GET /api/diseases...")
    res = client.get("/api/diseases?crop=Tomato")
    assert res.status_code == 200
    data = res.json()
    assert data["count"] > 0
    first_disease = data["diseases"][0]
    print(f"[PASS] Diseases OK: Found '{first_disease['disease_name']}' for Tomato.")

    print(f"Testing GET /api/diseases/{first_disease['id']}...")
    detail_res = client.get(f"/api/diseases/{first_disease['id']}")
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert "symptoms" in detail_data
    assert "treatment" in detail_data
    print("[PASS] Disease Detail OK.")


def test_products():
    print("Testing GET /api/products...")
    res = client.get("/api/products")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] > 0
    print(f"[PASS] Products OK: {data['total']} agricultural products in catalog.")


def test_prediction_and_history():
    print("Testing POST /api/predict with synthetic leaf image...")
    # Create synthetic leaf image
    img = Image.new("RGB", (250, 250), color=(34, 139, 34))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    res = client.post(
        "/api/predict",
        files={"file": ("test_leaf.jpg", buf.getvalue(), "image/jpeg")},
        data={"crop": "Tomato", "location": "Test Farm", "growth_stage": "Vegetative"},
    )
    assert res.status_code == 200, f"Prediction failed: {res.text}"
    data = res.json()
    assert data["success"] is True
    assert "prediction" in data
    assert "top_predictions" in data
    assert "disease_info" in data
    assert "recommendations" in data
    assert "weather_risk" in data
    print(f"[PASS] Prediction OK: Detected '{data['prediction']['disease']}' with {data['prediction']['confidence_percent']} confidence (Level: {data['prediction']['confidence_level']}).")

    report_id = data["report_id"]

    print("Testing GET /api/history...")
    hist_res = client.get("/api/history")
    assert hist_res.status_code == 200
    hist_data = hist_res.json()
    assert hist_data["total"] > 0
    print(f"[PASS] History OK: Total scans recorded = {hist_data['total']}.")

    print("Testing GET /api/history/stats...")
    stats_res = client.get("/api/history/stats")
    assert stats_res.status_code == 200
    stats_data = stats_res.json()
    assert stats_data["total_scans"] > 0
    print(f"[PASS] Dashboard Stats OK: Total scans in metrics = {stats_data['total_scans']}.")

    print(f"Testing GET /api/history/{report_id}...")
    item_res = client.get(f"/api/history/{report_id}")
    assert item_res.status_code == 200
    print("[PASS] History Detail OK.")


def test_invalid_upload_validation():
    print("Testing POST /api/predict rejection of invalid file...")
    fake_file_bytes = b"This is not a leaf image."
    res = client.post(
        "/api/predict",
        files={"file": ("corrupt.txt", fake_file_bytes, "text/plain")},
    )
    assert res.status_code == 400, f"Expected 400 but got {res.status_code}: {res.text}"
    print("[PASS] Invalid File Rejected properly with 400 Bad Request.")


def test_advisory():
    print("Testing POST /api/advisory/ask...")
    res = client.post(
        "/api/advisory/ask",
        json={"question": "My tomato leaves have brown spots with concentric circles. What is it?", "crop": "Tomato"},
    )
    assert res.status_code == 200
    data = res.json()
    assert "response" in data
    assert "findings" in data
    print("[PASS] Advisory Assistant OK: Response grounded in knowledge base.")


def test_weather():
    print("Testing GET /api/weather/risk...")
    res = client.get("/api/weather/risk?crop=Tomato&temp=26&humidity=88&wetness_hours=8")
    assert res.status_code == 200
    data = res.json()
    assert data["risk_level"] in ["High", "Severe", "Moderate", "Low"]
    print(f"[PASS] Weather Risk OK: Calculated risk = {data['risk_level']}.")


if __name__ == "__main__":
    print("\n================ STARTING PLANTCARE AI TEST SUITE ================")
    test_health()
    test_crops()
    test_diseases()
    test_products()
    test_prediction_and_history()
    test_invalid_upload_validation()
    test_advisory()
    test_weather()
    print("================ ALL INTEGRATION TESTS PASSED! ================\n")
