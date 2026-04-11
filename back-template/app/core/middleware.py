from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

class ErrorMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            if response.status_code >= 400:
                return self.handle_error(response)
            return response
        except HTTPException as exc:
            return self.handle_http_exception(exc)
        except Exception as exc:
            logger.error(f"Unhandled exception: {exc}")
            return self.handle_unexpected_exception(exc)

    def handle_error(self, response):
        return JSONResponse(
            status_code=response.status_code,
            content={"detail": getattr(response, 'body', b'').decode() if hasattr(response, 'body') else str(response)},
        )

    def handle_http_exception(self, exc: HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
        )

    def handle_unexpected_exception(self, exc):
        return JSONResponse(
            status_code=500,
            content={"detail": "An unexpected error occurred."},
        )