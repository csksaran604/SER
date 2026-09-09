"""
AI Image Processing Service
Handles image validation, resizing, aspect-ratio preservation,
bounding box rendering, and result annotation.
"""

import os
import cv2
import numpy as np
from PIL import Image

ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.bmp', '.webp'}
MAX_IMAGE_SIZE = (1280, 1280)


def validate_image_file(file_path: str) -> bool:
    """Validate image exists, has valid extension, and is readable."""
    if not os.path.exists(file_path):
        return False
    ext = os.path.splitext(file_path)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return False
    try:
        with Image.open(file_path) as img:
            img.verify()
        return True
    except Exception:
        return False


def load_and_preprocess_image(file_path: str, max_size=MAX_IMAGE_SIZE):
    """Load image, handle color space, and optionally downscale large images."""
    image = cv2.imread(file_path)
    if image is None:
        raise ValueError(f"Failed to read image at {file_path}")
    
    h, w = image.shape[:2]
    max_w, max_h = max_size
    if w > max_w or h > max_h:
        scale = min(max_w / w, max_h / h)
        new_w, new_h = int(w * scale), int(h * scale)
        image = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)
        
    return image


def draw_bounding_boxes(image: np.ndarray, detections: list, title: str = "AI Detection Result") -> np.ndarray:
    """
    Draw clean, professional bounding boxes, labels, and status banner on the image.
    detections: list of dicts with keys: 'box' [x1, y1, x2, y2], 'label', 'confidence', 'severity'
    """
    annotated = image.copy()
    h, w = annotated.shape[:2]
    
    # Draw top banner for emergency operations
    banner_height = 42
    overlay = annotated.copy()
    cv2.rectangle(overlay, (0, 0), (w, banner_height), (15, 23, 42), -1)  # Dark slate
    cv2.addWeighted(overlay, 0.85, annotated, 0.15, 0, annotated)
    
    cv2.putText(
        annotated,
        f"[AI ACCIDENT DETECTION] {title}",
        (16, 28),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.65,
        (241, 245, 249),
        2,
        cv2.LINE_AA
    )

    # Color map for severity/labels
    severity_colors = {
        'Critical': (0, 0, 230),    # Red (BGR)
        'High': (0, 100, 240),      # Orange-red
        'Medium': (0, 191, 255),    # Deep sky blue / amber
        'Low': (50, 205, 50),       # Lime green
    }

    for det in detections:
        box = det.get('box')
        if not box or len(box) != 4:
            continue
        
        x1, y1, x2, y2 = [int(v) for v in box]
        x1, y1 = max(0, x1), max(banner_height, y1)
        x2, y2 = min(w - 1, x2), min(h - 1, y2)
        
        severity = det.get('severity', 'Medium')
        color = severity_colors.get(severity, (0, 140, 255))
        
        # Bounding box with rounded look / thick border
        cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)
        
        # Label tag
        label = det.get('label', 'Incident')
        conf = det.get('confidence', 0.0)
        label_text = f"{label} {int(conf * 100)}%" if conf > 0 else label
        
        (label_w, label_h), baseline = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
        tag_y1 = max(banner_height + 2, y1 - label_h - 8)
        tag_y2 = tag_y1 + label_h + 8
        tag_x2 = min(w - 1, x1 + label_w + 10)
        
        cv2.rectangle(annotated, (x1, tag_y1), (tag_x2, tag_y2), color, -1)
        cv2.putText(
            annotated,
            label_text,
            (x1 + 5, tag_y2 - 5),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            (255, 255, 255),
            1,
            cv2.LINE_AA
        )

    return annotated


def save_annotated_image(image: np.ndarray, output_path: str) -> str:
    """Save processed image to output path, creating directories if needed."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    cv2.imwrite(output_path, image, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
    return output_path
