"""
Minimal CI Test Service

A lightweight FastAPI service used to validate that the Kind cluster
and deployment pipeline are working correctly during infrastructure CI.
"""

from fastapi import FastAPI

app = FastAPI(
    title="CI Test Service",
    description="Minimal service for infrastructure CI validation",
    version="1.0.0"
)


@app.get("/healthcheck")
@app.get("/health")
async def healthcheck():
    """Health check endpoint to verify service is running."""
    return {"status": "SUCCESS", "message": "OK"}


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "CI Test Service is running"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
