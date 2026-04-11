from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import Base, engine
from app.core.logging import setup_logging
from app.core.middleware import ErrorMiddleware


# Create database tables
@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    setup_logging()
    yield
    # Shutdown

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description=settings.description,
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add error handling middleware
app.add_middleware(ErrorMiddleware)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.app_name}",
        "version": settings.version,
        "docs": "/docs",
        "health": "/api/v1/health/"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": settings.app_name}

if __name__ == "__main__":
    import granian
    granian.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
