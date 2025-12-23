import os

# CORS origins - can be configured via environment variable as comma-separated list
_origins_env = os.getenv("CORS_ORIGINS", "http://localhost:7700,http://localhost:3000")
origins = [origin.strip() for origin in _origins_env.split(",")]
