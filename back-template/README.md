# project-template

A FastAPI application created with fastapi-init.

## Features

- 🔐 JWT Authentication
- 🗄️ SQLAlchemy ORM with Alembic migrations
- 📝 Automatic API documentation
- 🧪 Comprehensive testing setup
- 🐳 Docker support
- 📊 Health checks
- 🔒 CORS configuration
- 📝 Structured logging

## Quick Start

### Install uv Package Manager

```bash
# Linux/macOS
curl -LsSf https://astral.sh/uv/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"  # Add to .bashrc/.zshrc for permanence

# Windows (PowerShell)
irm https://astral.sh/uv/install.ps1 | iex
```

### Set Up Environment & Install Dependencies

```bash
# Create and activate virtual environment
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies from requirements file
uv pip install -r requirements-dev.txt
```

### Recreate Environment (if needed)

```bash
deactivate
rm -rf .venv/
uv venv
source .venv/bin/activate
uv pip install -r requirements-dev.txt
```

### Configure Environment Variables

```bash
# Copy sample environment file and update with your values
cp .env.example .env
# Edit .env with your configuration (AWS credentials, MongoDB, etc.)
```

### (Optional) Install VS Code recommended extensions

```bash
# Install recommended VS Code extensions from .vscode/extensions.json
code --install-extension $(cat .vscode/extensions.json | jq -r '.recommendations[]' | tr '\n' ' ')
```

### Database Setup

```bash
# Initialize database
alembic upgrade head
```

### Running the Application

```bash
# Development
granian app.main:app --interface asgi --reload

# Production
granian app.main:app --interface asgi --host 0.0.0.0 --port 8000
```

## API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## Project Structure

```
project-template/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── auth_router.py
│   │       ├── health.py
│   │       └── router.py
│   ├── core/
│   │   ├── auth.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── logging.py
│   │   └── middleware.py
│   ├── models/
│   │   └── models.py
│   ├── schemas/
│   │   └── schemas.py
│   └── main.py
├── tests/
├── alembic/
├── logs/
└── requirements.txt
```

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_auth.py -v
```

## Docker

```bash
# Build image
docker build -t project-template .

# Run container
docker run -p 8000:8000 project-template
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `SECRET_KEY`: JWT secret key
- `DATABASE_URL`: Database connection string
- `DEBUG`: Enable debug mode
- `ALLOWED_ORIGINS`: CORS allowed origins
