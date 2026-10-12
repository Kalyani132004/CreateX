# CreateX ML Service

FastAPI service that scores a project's similarity / originality / innovation
against existing projects and suggests improvements.

## Run
    python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
    pip install -r requirements.txt
    uvicorn app.main:app --reload --port 8002

POST `/api/ml/analyze`, health check at `/health`.

## Test
    pip install -r requirements-dev.txt
    pytest

## Evaluate accuracy on your own data
    python tools/evaluate_similarity.py tools/sample_pairs.json
`tools/sample_pairs.json` is a 4-pair smoke test only. Build 100+ labelled pairs
from your real projects (include same-domain / same-stack but different-idea
pairs) before trusting or tuning any threshold.

## Files you may already have (keep yours)
- `app/schemas.py`, `app/utils/text_utils.py` and `data/technology_catalog.json`
  are reconstructed / starter versions. Keep your originals; only add the
  optional `id` field to `ProjectInput` so a project can exclude itself.
