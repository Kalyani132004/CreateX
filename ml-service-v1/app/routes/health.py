from fastapi import APIRouter


router = APIRouter()


@router.get("/health")
def health():

    return {
        "status": "healthy",
        "service": "CreateX ML Service",
        "port": 8003
    }