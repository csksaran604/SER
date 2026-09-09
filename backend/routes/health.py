"""
Health Check API Route
"""

from flask import Blueprint, jsonify, current_app
from backend.extensions import db
from ai.accident_detection import AccidentDetector

health_bp = Blueprint('health', __name__)


@health_bp.route('/health', methods=['GET'])
def health_check():
    db_status = "ok"
    try:
        db.session.execute(db.text("SELECT 1"))
    except Exception as e:
        db_status = f"error: {str(e)}"

    model_path = current_app.config.get('ACCIDENT_MODEL_PATH')
    detector = AccidentDetector(model_path=model_path)
    model_info = detector.get_model_info()

    return jsonify({
        'status': 'healthy' if db_status == 'ok' else 'degraded',
        'database': {
            'status': db_status,
            'engine': current_app.config.get('DB_ENGINE_NAME', 'Unknown')
        },
        'ai_engine': {
            'model_configured': model_info['configured'],
            'model_version': model_info['model_version'],
            'status_message': model_info['status_message']
        },
        'version': '1.0.0'
    }), 200
