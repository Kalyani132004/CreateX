import os


ML_SERVICE_HOST = os.getenv(
    "ML_SERVICE_HOST",
    "127.0.0.1"
)

ML_SERVICE_PORT = int(
    os.getenv(
        "ML_SERVICE_PORT",
        "8003"
    )
)

MAX_SIMILAR_PROJECTS = 5

SIMILARITY_THRESHOLD = 60.0

HIGH_SIMILARITY_THRESHOLD = 80.0