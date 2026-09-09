"""
AI Service
Connects Flask backend with the computer vision accident detection engine.
Handles file paths, result annotations, and detection database persistence.
"""

import os
import uuid
from flask import current_app
from ai.accident_detection import AccidentDetector
from ai.video_processing import extract_video_frames, aggregate_video_results
from backend.extensions import db
from backend.models.accident_detection import AccidentDetection
from backend.services.notification_service import create_notification


# Singleton detector instance
_detector = None

def get_detector():
    global _detector
    if _detector is None:
        model_path = current_app.config.get('ACCIDENT_MODEL_PATH')
        _detector = AccidentDetector(model_path=model_path)
    return _detector


def analyze_uploaded_image(file_path: str, filename: str) -> AccidentDetection:
    """
    Runs computer vision inference on an uploaded image,
    annotates bounding boxes, and persists the detection record.
    """
    detector = get_detector()
    result_filename = f"result_{uuid.uuid4().hex[:8]}_{filename}"
    result_path = os.path.join(current_app.config['UPLOAD_RESULTS_DIR'], result_filename)

    inference_result = detector.detect_image(
        image_path=file_path,
        output_result_path=result_path
    )

    # Relative paths for frontend serving
    rel_media_path = f"uploads/images/{filename}"
    rel_result_path = f"uploads/results/{result_filename}"

    detection = AccidentDetection(
        detection_uuid=f"det-{uuid.uuid4().hex[:12]}",
        media_type='image',
        media_filename=filename,
        media_path=rel_media_path,
        result_media_path=rel_result_path,
        is_accident_detected=inference_result['is_accident_detected'],
        confidence_score=inference_result['confidence'] * 100.0,
        severity=inference_result['severity'],
        detected_objects_raw=str(inference_result.get('detected_objects', [])).replace("'", '"'),
        model_version=inference_result.get('model_version', 'v1.0.0'),
        inference_time_ms=inference_result.get('inference_time_ms', 0)
    )

    db.session.add(detection)
    db.session.commit()

    if detection.is_accident_detected:
        sev = 'critical' if detection.severity == 'Critical' else 'warning'
        create_notification(
            title=f"AI Alert: Potential {detection.severity} Accident Detected",
            message=f"Vision model detected potential incident with {int(detection.confidence_score)}% confidence. Pending human operator verification.",
            notification_type='detection',
            severity=sev
        )

    return detection, inference_result


def analyze_uploaded_video(file_path: str, filename: str, interval_seconds: float = 1.0) -> AccidentDetection:
    """
    Extracts frames from video, runs batch inference, and aggregates timeline metrics.
    """
    detector = get_detector()
    frames_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'video_frames', uuid.uuid4().hex[:8])
    extracted_frames = extract_video_frames(file_path, frames_dir, interval_seconds=interval_seconds, max_frames=20)

    frame_results = []
    for frame_info in extracted_frames:
        frame_res = detector.detect_image(
            image_path=frame_info['frame_path'],
            output_result_path=None
        )
        frame_results.append({
            'frame_path': frame_info['frame_path'],
            'timestamp_sec': frame_info['timestamp_sec'],
            'detection': frame_res
        })

    summary = aggregate_video_results(frame_results)

    # Save peak frame as result preview
    result_filename = f"peak_{uuid.uuid4().hex[:8]}_{os.path.splitext(filename)[0]}.jpg"
    result_path = os.path.join(current_app.config['UPLOAD_RESULTS_DIR'], result_filename)

    if summary['peak_frame'] and os.path.exists(summary['peak_frame']):
        # Annotate peak frame
        detector.detect_image(
            image_path=summary['peak_frame'],
            output_result_path=result_path
        )
    else:
        # Fallback to first frame if available
        if extracted_frames:
            detector.detect_image(
                image_path=extracted_frames[0]['frame_path'],
                output_result_path=result_path
            )

    rel_media_path = f"uploads/videos/{filename}"
    rel_result_path = f"uploads/results/{result_filename}"

    detection = AccidentDetection(
        detection_uuid=f"det-vid-{uuid.uuid4().hex[:12]}",
        media_type='video',
        media_filename=filename,
        media_path=rel_media_path,
        result_media_path=rel_result_path,
        is_accident_detected=summary['is_accident_detected'],
        confidence_score=summary['confidence'] * 100.0,
        severity=summary['severity'],
        detected_objects_raw=str(summary.get('detected_objects', [])).replace("'", '"'),
        model_version=detector.model_version,
        inference_time_ms=len(extracted_frames) * 120
    )

    db.session.add(detection)
    db.session.commit()

    if detection.is_accident_detected:
        sev = 'critical' if detection.severity == 'Critical' else 'warning'
        create_notification(
            title=f"Video Analysis: {detection.severity} Incident Detected",
            message=f"Analyzed {summary['total_frames_sampled']} frames. Peak confidence: {int(detection.confidence_score)}%. Requires human verification.",
            notification_type='detection',
            severity=sev
        )

    return detection, summary
