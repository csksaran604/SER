"""
AI Vision API Routes
Handles image & video file uploads, validation, computer vision inference,
and returns structured detection and confidence metrics.
"""

import os
from werkzeug.utils import secure_filename
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from backend.models.accident_detection import AccidentDetection
from backend.services.ai_service import analyze_uploaded_image, analyze_uploaded_video, get_detector

ai_bp = Blueprint('ai', __name__)


def is_allowed_file(filename: str, allowed_set: set) -> bool:
    if '.' not in filename:
        return False
    ext = filename.rsplit('.', 1)[1].lower()
    return ext in allowed_set


@ai_bp.route('/status', methods=['GET'])
def get_ai_status():
    """Returns AI model runtime and configuration status."""
    detector = get_detector()
    return jsonify(detector.get_model_info()), 200


@ai_bp.route('/analyze-image', methods=['POST'])
@jwt_required()
def analyze_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No image file provided in request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400

    if not is_allowed_file(file.filename, current_app.config['ALLOWED_IMAGE_EXTENSIONS']):
        return jsonify({'error': f'Unsupported image format. Allowed: {list(current_app.config["ALLOWED_IMAGE_EXTENSIONS"])}'}), 400

    filename = secure_filename(file.filename)
    save_path = os.path.join(current_app.config['UPLOAD_IMAGES_DIR'], filename)
    
    # Save uploaded file
    file.save(save_path)

    try:
        detection, raw_inference = analyze_uploaded_image(save_path, filename)
        return jsonify({
            'message': 'Image analysis completed',
            'detection': detection.to_dict(),
            'inference_details': raw_inference
        }), 200
    except Exception as e:
        return jsonify({'error': f'AI processing failed: {str(e)}'}), 500


@ai_bp.route('/analyze-video', methods=['POST'])
@jwt_required()
def analyze_video():
    if 'file' not in request.files:
        return jsonify({'error': 'No video file provided in request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400

    if not is_allowed_file(file.filename, current_app.config['ALLOWED_VIDEO_EXTENSIONS']):
        return jsonify({'error': f'Unsupported video format. Allowed: {list(current_app.config["ALLOWED_VIDEO_EXTENSIONS"])}'}), 400

    filename = secure_filename(file.filename)
    save_path = os.path.join(current_app.config['UPLOAD_VIDEOS_DIR'], filename)
    file.save(save_path)

    try:
        detection, summary = analyze_uploaded_video(save_path, filename)
        return jsonify({
            'message': 'Video analysis completed',
            'detection': detection.to_dict(),
            'video_summary': summary
        }), 200
    except Exception as e:
        return jsonify({'error': f'Video processing failed: {str(e)}'}), 500


@ai_bp.route('/detections', methods=['GET'])
@jwt_required()
def get_detections():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    query = AccidentDetection.query.order_by(AccidentDetection.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'detections': [d.to_dict() for d in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200


@ai_bp.route('/detections/<int:id>', methods=['GET'])
@jwt_required()
def get_detection_detail(id):
    detection = AccidentDetection.query.get_or_404(id)
    return jsonify({'detection': detection.to_dict()}), 200
