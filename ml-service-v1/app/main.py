from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes.health import router as health_router
from .routes.analysis import router as analysis_router


app = FastAPI(
    title="CreateX ML Service",
    description=(
        "ML service for CreateX project "
        "similarity, originality, innovation "
        "and technology recommendations."
    ),
    version="1.0.0"
)


# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Routers
app.include_router(
    health_router
)

app.include_router(
    analysis_router
)


@app.get("/")
def root():
    return {
        "service": "CreateX ML Service",
        "status": "running",
        "version": "1.0.0"
    }