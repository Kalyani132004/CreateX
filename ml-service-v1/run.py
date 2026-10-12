import uvicorn

from app.config import (
    ML_SERVICE_HOST,
    ML_SERVICE_PORT
)
if __name__ == "__main__":

    uvicorn.run(
        "app.main:app",
        host=ML_SERVICE_HOST,
        port=ML_SERVICE_PORT,
        reload=True
    )
