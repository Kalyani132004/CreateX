from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

EXISTING = [
    {"id": 1, "title": "Face Recognition Attendance",
     "description": "Marks student presence automatically by detecting and recognizing faces in camera feed.",
     "domain": "AI / ML", "technologies": ["Python", "OpenCV"]},
    {"id": 2, "title": "Online Food Delivery",
     "description": "Customers order meals from restaurants and track deliveries.",
     "domain": "Web Development", "technologies": ["React", "Node.js", "MongoDB"]},
]

NEW = {
    "title": "Smart Attendance System",
    "description": "Automates classroom attendance by recognising students faces from a live camera using OpenCV and Python.",
    "domain": "AI / ML", "technologies": ["Python", "OpenCV"],
    "existing_projects": EXISTING,
}


def test_finds_the_duplicate_first():
    body = client.post("/api/ml/analyze", json=NEW).json()
    assert body["similar_projects"][0]["project_id"] == 1
    assert body["similarity"] > body["similar_projects"][-1]["similarity_score"]
    assert 0 <= body["innovation"] <= 100


def test_project_does_not_match_itself():
    body = client.post("/api/ml/analyze", json={**NEW, "id": 1}).json()
    assert all(p["project_id"] != 1 for p in body["similar_projects"])


def test_empty_description_and_no_existing_projects():
    r = client.post("/api/ml/analyze", json={"title": "x", "description": None,
                                             "domain": "IoT", "technologies": []})
    assert r.status_code == 200
    assert r.json()["similarity"] == 0


def test_used_technologies_are_not_recommended():
    body = client.post("/api/ml/analyze", json={**NEW, "technologies": ["tensorflow", "OpenCV", "PyTorch"]}).json()
    rec = [t.lower() for t in body["technology_recommendation"]["recommended"]]
    assert "tensorflow" not in rec and "pytorch" not in rec
