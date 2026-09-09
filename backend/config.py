"""
Backend Configuration Module
Handles environment variable loading, database URI resolution
with seamless MySQL support and automatic SQLite fallback,
JWT settings, and upload directory preparation.
"""

import os
from datetime import timedelta
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))


class Config:
    # Security & JWT
    SECRET_KEY = os.environ.get('SECRET_KEY', 'smart-ser-system-secret-2026-very-secure-key')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-super-secret-key-ser-sys-99-production-grade-key-2026')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

    # Database Configuration
    MYSQL_HOST = os.environ.get('MYSQL_HOST')
    MYSQL_PORT = os.environ.get('MYSQL_PORT', '3306')
    MYSQL_DATABASE = os.environ.get('MYSQL_DATABASE', 'smart_emergency_db')
    MYSQL_USER = os.environ.get('MYSQL_USER')
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD')

    # If explicit MySQL credentials are provided, use MySQL
    if MYSQL_HOST and MYSQL_USER and MYSQL_PASSWORD:
        SQLALCHEMY_DATABASE_URI = (
            f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}"
        )
        DB_ENGINE_NAME = "MySQL"
    else:
        # Default local database fallback for instant execution
        sqlite_path = os.path.join(basedir, 'smart_emergency.db')
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{sqlite_path}"
        DB_ENGINE_NAME = "SQLite (Local Fallback)"

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_recycle': 280,
        'pool_pre_ping': True
    } if DB_ENGINE_NAME == "MySQL" else {}

    # Uploads & File Management
    UPLOAD_FOLDER = os.path.join(basedir, 'uploads')
    UPLOAD_IMAGES_DIR = os.path.join(UPLOAD_FOLDER, 'images')
    UPLOAD_VIDEOS_DIR = os.path.join(UPLOAD_FOLDER, 'videos')
    UPLOAD_RESULTS_DIR = os.path.join(UPLOAD_FOLDER, 'results')
    MAX_CONTENT_LENGTH = 32 * 1024 * 1024  # 32MB max
    ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'bmp'}
    ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv', 'webm'}

    # AI Model Path
    ACCIDENT_MODEL_PATH = os.environ.get(
        'ACCIDENT_MODEL_PATH',
        os.path.abspath(os.path.join(basedir, '..', 'ai', 'models', 'accident_model.pt'))
    )

    @classmethod
    def init_directories(cls):
        """Ensure all required upload directories exist."""
        for path in [cls.UPLOAD_FOLDER, cls.UPLOAD_IMAGES_DIR, cls.UPLOAD_VIDEOS_DIR, cls.UPLOAD_RESULTS_DIR]:
            os.makedirs(path, exist_ok=True)
