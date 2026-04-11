from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # App settings
    app_name: str = "project-template"
    version: str = "1.0.0"
    description: str = "A FastAPI application created with fastapi-init"
    debug: bool = False
    host: str = "0.0.0.0"
    port: int = 8000

    # Security
    secret_key: str = "your-secret-key-here"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # Database
    database_url: str = "sqlite:///./app.db"

    # CORS
    allowed_origins: List[str] = ["http://localhost:3000", "http://localhost:8080"]

    # Logging
    log_level: str = "INFO"
    log_file: str = "app.log"

    # Rate limiting
    rate_limit_per_minute: int = 60

    # Adicione os campos específicos do projeto aqui, como MongoDB, AWS, etc.
    # Exemplo:
    # mongodb_main_schema: str = ""
    # spring_data_mongodb_uri: str = ""
    # aws_bucket_model_input: str = ""
    # etc.

    class Config:
        env_file = ".env"
        case_sensitive = False  # Permite correspondência insensível a maiúsculas/minúsculas
        extra = 'allow'  # Permite campos extras no .env

settings = Settings()
