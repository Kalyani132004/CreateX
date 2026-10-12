from fastapi import FastAPI
#app start command
#app.main:app --reload --port 8003
from .routers.analyze import router as analyze_router

app = FastAPI(title="CreateX ML Service")
app.include_router(analyze_router)


@app.get("/health")
def health():
    return {"status": "ok"}
