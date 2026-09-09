from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS

db = SQLAlchemy()
jwt = JWTManager()
cors = CORS()


def utc_now():
    """Timezone-aware UTC timestamp generator."""
    return datetime.now(timezone.utc)


def to_iso_utc(dt):
    """
    Serializes a naive or aware datetime to an explicit ISO 8601 UTC string with 'Z' suffix.
    Guarantees that frontend browsers correctly convert UTC timestamps to user local time (e.g. IST).
    """
    if not dt:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc).isoformat().replace('+00:00', 'Z')
    return dt.astimezone(timezone.utc).isoformat().replace('+00:00', 'Z')

