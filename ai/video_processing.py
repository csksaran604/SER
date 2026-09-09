"""
AI Video Processing Service
Extracts frames from video clips at configurable intervals,
coordinates batch inference, and aggregates timeline metrics.
"""

import os
import cv2
from typing import List, Dict, Any

ALLOWED_VIDEO_EXTENSIONS = {'.mp4', '.avi', '.mov', '.mkv', '.webm'}


def validate_video_file(file_path: str) -> bool:
    """Validate video existence, extension, and decodability."""
    if not os.path.exists(file_path):
        return False
    ext = os.path.splitext(file_path)[1].lower()
    if ext not in ALLOWED_VIDEO_EXTENSIONS:
        return False
    cap = cv2.VideoCapture(file_path)
    if not cap.isOpened():
        return False
    ret, _ = cap.read()
    cap.release()
    return bool(ret)


def extract_video_frames(
    video_path: str,
    output_frames_dir: str,
    interval_seconds: float = 1.0,
    max_frames: int = 30
) -> List[Dict[str, Any]]:
    """
    Sample video frames at fixed time intervals (e.g. every 1.0 second).
    Saves sampled frames to output_frames_dir.
    Returns list of dicts: [{'frame_index': int, 'timestamp_sec': float, 'frame_path': str}]
    """
    os.makedirs(output_frames_dir, exist_ok=True)
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Could not open video at {video_path}")

    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0:
        fps = 25.0
    
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration_sec = total_frames / fps if total_frames > 0 else 0
    
    step_frames = max(1, int(fps * interval_seconds))
    extracted = []
    
    current_frame = 0
    saved_count = 0
    
    while cap.isOpened() and saved_count < max_frames:
        cap.set(cv2.CAP_PROP_POS_FRAMES, current_frame)
        ret, frame = cap.read()
        if not ret:
            break
            
        timestamp_sec = round(current_frame / fps, 2)
        frame_filename = f"frame_{saved_count:04d}_t{int(timestamp_sec*100):05d}.jpg"
        frame_path = os.path.join(output_frames_dir, frame_filename)
        
        cv2.imwrite(frame_path, frame, [int(cv2.IMWRITE_JPEG_QUALITY), 85])
        
        extracted.append({
            'frame_index': current_frame,
            'timestamp_sec': timestamp_sec,
            'frame_path': frame_path,
            'filename': frame_filename
        })
        
        saved_count += 1
        current_frame += step_frames
        if total_frames > 0 and current_frame >= total_frames:
            break
            
    cap.release()
    return extracted


def aggregate_video_results(frame_results: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Aggregates per-frame AI detections into a unified video incident summary.
    Computes peak confidence, peak severity, timestamp of highest confidence,
    and all detected vehicle/accident objects.
    """
    if not frame_results:
        return {
            'is_accident_detected': False,
            'confidence': 0.0,
            'severity': 'Low',
            'detected_objects': [],
            'peak_frame': None,
            'peak_timestamp_sec': 0.0,
            'accident_frames_count': 0,
            'total_frames_sampled': 0
        }

    severity_rank = {'Low': 1, 'Medium': 2, 'High': 3, 'Critical': 4}
    
    highest_conf = 0.0
    highest_severity = 'Low'
    peak_frame = None
    peak_timestamp = 0.0
    accident_frames = 0
    all_objects = set()

    for item in frame_results:
        det = item.get('detection', {})
        if det.get('is_accident_detected'):
            accident_frames += 1
            conf = det.get('confidence', 0.0)
            sev = det.get('severity', 'Medium')
            
            for obj in det.get('detected_objects', []):
                all_objects.add(obj)

            # Rank by severity first, then confidence
            if severity_rank.get(sev, 1) > severity_rank.get(highest_severity, 1) or \
               (severity_rank.get(sev, 1) == severity_rank.get(highest_severity, 1) and conf > highest_conf):
                highest_conf = conf
                highest_severity = sev
                peak_frame = item.get('frame_path')
                peak_timestamp = item.get('timestamp_sec', 0.0)

    is_accident = accident_frames > 0

    return {
        'is_accident_detected': is_accident,
        'confidence': round(highest_conf, 2) if is_accident else 0.0,
        'severity': highest_severity if is_accident else 'Low',
        'detected_objects': sorted(list(all_objects)),
        'peak_frame': peak_frame,
        'peak_timestamp_sec': peak_timestamp,
        'accident_frames_count': accident_frames,
        'total_frames_sampled': len(frame_results)
    }
