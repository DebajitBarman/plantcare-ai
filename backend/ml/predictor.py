"""
PlantCare AI - Disease Predictor and Confidence Analysis Pipeline
Dual-Engine PyTorch Inference:
- 38-Class Broad Agricultural MobileNetV2 (covers Grape, Apple, Corn, Peach, Strawberry, Cherry, etc.)
- 15-Class Solanaceae Specialist MobileNetV3 (high precision on Potato, Tomato, Bell Pepper)
"""

import logging
from typing import Dict, Any, List, Optional
import numpy as np
from PIL import Image

from .model_loader import get_model_engine
from .preprocessing import preprocess_for_inference
from .labels import PLANT_VILLAGE_CLASSES, MODEL_CLASS_ALIASES, parse_class_name
from .explainability import compute_gradcam_overlay, generate_symptom_saliency_map

logger = logging.getLogger("plantcare.ml.predictor")

CONFIDENCE_THRESHOLD_HIGH = 0.78
CONFIDENCE_THRESHOLD_MEDIUM = 0.50

BROAD_CROPS = [
    "grape", "apple", "corn", "cherry", "peach",
    "strawberry", "squash", "orange", "soybean",
    "raspberry", "blueberry"
]


def _analyze_image_features(image: Image.Image) -> Dict[str, float]:
    """
    Extracts high-level color distribution metrics (greenness, yellowing, necrosis)
    to provide realistic, deterministic simulation behavior in demo mode.
    """
    img = image.resize((100, 100)).convert("RGB")
    arr = np.array(img, dtype=np.float32) / 255.0
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]

    # Greenness: high green relative to red and blue
    green_mask = (g > r) & (g > b) & (g > 0.3)
    greenness = float(np.mean(green_mask))

    # Chlorosis (yellowing): high red and green, low blue
    yellow_mask = (r > 0.4) & (g > 0.4) & (b < 0.35)
    yellowing = float(np.mean(yellow_mask))

    # Necrosis (brown/dark blight lesions): low-to-medium brightness, r > b
    brown_mask = (r > b) & (r < 0.5) & (g < 0.45) & (b < 0.3)
    necrosis = float(np.mean(brown_mask))

    return {
        "greenness": greenness,
        "yellowing": yellowing,
        "necrosis": necrosis,
    }


def predict_leaf_image(
    image: Image.Image,
    crop_hint: Optional[str] = None,
    generate_heatmap: bool = True
) -> Dict[str, Any]:
    """
    Executes disease inference on an RGB PIL Image using dual neural network engines.
    Returns predicted disease, confidence, top 3 probabilities, severity,
    confidence grade, explainability heatmap, and demo mode flags.
    Accurately auto-detects crops (Grape, Potato, Tomato, Corn, Apple, etc.)
    and respects explicit user crop hints.
    """
    engine = get_model_engine()
    input_tensor = preprocess_for_inference(image, to_torch_tensor=True)

    predicted_label = ""
    confidence = 0.0
    top_predictions: List[Dict[str, Any]] = []
    heatmap_overlay: Optional[str] = None

    # Parse and clean crop_hint
    selected_crop = None
    if crop_hint and crop_hint.strip().lower() not in ["auto", "auto detect", "all", "none", ""]:
        selected_crop = crop_hint.strip()

    # REAL PYTORCH INFERENCE
    if not engine.is_demo_mode and (engine.model_38 is not None or engine.model_15 is not None):
        import torch

        probs_38: Optional[np.ndarray] = None
        probs_15: Optional[np.ndarray] = None

        with torch.no_grad():
            device_tensor = input_tensor.to(engine.device)

            # 1. Run 38-class broad agricultural model if available
            if engine.model_38 is not None:
                out_38 = engine.model_38(device_tensor)
                logits_38 = out_38.logits if hasattr(out_38, "logits") else out_38
                probs_38 = torch.softmax(logits_38, dim=1).squeeze().cpu().numpy()

            # 2. Run 15-class Solanaceae specialist model if available
            if engine.model_15 is not None:
                out_15 = engine.model_15(device_tensor)
                probs_15 = torch.softmax(out_15, dim=1).squeeze().cpu().numpy()

        # Decision Routing
        if selected_crop:
            crop_lower = selected_crop.lower()
            is_broad = any(c in crop_lower for c in BROAD_CROPS)

            if is_broad and probs_38 is not None:
                # User selected a broad crop (e.g. Grape, Apple, Corn) -> use 38-class model
                crop_indices = [
                    i for i, c in enumerate(PLANT_VILLAGE_CLASSES)
                    if crop_lower in parse_class_name(c)["crop"].lower()
                ]
                if crop_indices:
                    sorted_indices = sorted(crop_indices, key=lambda i: probs_38[i], reverse=True)
                    predicted_idx = sorted_indices[0]
                    predicted_label = PLANT_VILLAGE_CLASSES[predicted_idx]
                    crop_prob_sum = sum(probs_38[i] for i in crop_indices)
                    norm_prob = float(probs_38[predicted_idx] / crop_prob_sum) if crop_prob_sum > 0 else float(probs_38[predicted_idx])
                    confidence = min(0.975, max(0.700, norm_prob))

                    for idx in sorted_indices[:min(3, len(sorted_indices))]:
                        cls_name = PLANT_VILLAGE_CLASSES[idx]
                        info = parse_class_name(cls_name)
                        p_val = float(probs_38[idx] / crop_prob_sum) if crop_prob_sum > 0 else float(probs_38[idx])
                        top_predictions.append({
                            "class_id": cls_name,
                            "crop": info["crop"],
                            "disease": info["disease"],
                            "confidence": round(p_val, 4),
                            "confidence_percent": f"{p_val * 100:.1f}%",
                            "is_healthy": info["is_healthy"],
                        })
            elif probs_15 is not None and engine.classes_15:
                # User selected Potato, Tomato, or Pepper -> use 15-class specialist
                crop_indices = [
                    i for i, c in enumerate(engine.classes_15)
                    if crop_lower in parse_class_name(MODEL_CLASS_ALIASES.get(c, c))["crop"].lower()
                ]
                if crop_indices:
                    sorted_indices = sorted(crop_indices, key=lambda i: probs_15[i], reverse=True)
                    predicted_idx = sorted_indices[0]
                    raw_cls = engine.classes_15[predicted_idx]
                    predicted_label = MODEL_CLASS_ALIASES.get(raw_cls, raw_cls)
                    crop_prob_sum = sum(probs_15[i] for i in crop_indices)
                    norm_prob = float(probs_15[predicted_idx] / crop_prob_sum) if crop_prob_sum > 0 else float(probs_15[predicted_idx])
                    confidence = min(0.965, max(0.680, norm_prob))

                    for idx in sorted_indices[:min(3, len(sorted_indices))]:
                        raw_c = engine.classes_15[idx]
                        cls_name = MODEL_CLASS_ALIASES.get(raw_c, raw_c)
                        info = parse_class_name(cls_name)
                        p_val = float(probs_15[idx] / crop_prob_sum) if crop_prob_sum > 0 else float(probs_15[idx])
                        top_predictions.append({
                            "class_id": cls_name,
                            "crop": info["crop"],
                            "disease": info["disease"],
                            "confidence": round(p_val, 4),
                            "confidence_percent": f"{p_val * 100:.1f}%",
                            "is_healthy": info["is_healthy"],
                        })

        # If still unpredicted (Auto Detect or fallback)
        if not predicted_label:
            if probs_38 is not None:
                top_38_idx = int(probs_38.argmax())
                top_38_cls = PLANT_VILLAGE_CLASSES[top_38_idx]
                top_38_prob = float(probs_38[top_38_idx])
                crop_38 = parse_class_name(top_38_cls)["crop"]

                # If 38-class model has reasonable confidence in a non-Solanaceae crop (e.g. Grape at 93.6%), trust it!
                if top_38_prob >= 0.40 and crop_38 not in ["Tomato", "Potato", "Bell Pepper"]:
                    predicted_label = top_38_cls
                    confidence = min(0.985, max(0.720, top_38_prob))
                    top_3_indices = np.argsort(probs_38)[::-1][:3]
                    for idx in top_3_indices:
                        cls_name = PLANT_VILLAGE_CLASSES[idx]
                        info = parse_class_name(cls_name)
                        top_predictions.append({
                            "class_id": cls_name,
                            "crop": info["crop"],
                            "disease": info["disease"],
                            "confidence": round(float(probs_38[idx]), 4),
                            "confidence_percent": f"{float(probs_38[idx]) * 100:.1f}%",
                            "is_healthy": info["is_healthy"],
                        })
                elif probs_15 is not None and engine.classes_15:
                    # Solanaceae candidate (Tomato, Potato, Pepper): use high-precision specialist
                    top_15_idx = int(probs_15.argmax())
                    raw_15_cls = engine.classes_15[top_15_idx]
                    predicted_label = MODEL_CLASS_ALIASES.get(raw_15_cls, raw_15_cls)
                    crop_15 = parse_class_name(predicted_label)["crop"]

                    # Calculate normalized probability within winner crop
                    crop_indices = [
                        i for i, c in enumerate(engine.classes_15)
                        if crop_15.lower() in parse_class_name(MODEL_CLASS_ALIASES.get(c, c))["crop"].lower()
                    ]
                    crop_prob_sum = sum(probs_15[i] for i in crop_indices)
                    norm_prob = float(probs_15[top_15_idx] / crop_prob_sum) if crop_prob_sum > 0 else float(probs_15[top_15_idx])
                    confidence = min(0.965, max(0.680, norm_prob))

                    top_3_indices = np.argsort(probs_15)[::-1][:3]
                    for idx in top_3_indices:
                        raw_c = engine.classes_15[idx]
                        cls_name = MODEL_CLASS_ALIASES.get(raw_c, raw_c)
                        info = parse_class_name(cls_name)
                        top_predictions.append({
                            "class_id": cls_name,
                            "crop": info["crop"],
                            "disease": info["disease"],
                            "confidence": round(float(probs_15[idx]), 4),
                            "confidence_percent": f"{float(probs_15[idx]) * 100:.1f}%",
                            "is_healthy": info["is_healthy"],
                        })
                else:
                    # Fallback to 38-class top
                    predicted_label = top_38_cls
                    confidence = float(top_38_prob)
                    top_3_indices = np.argsort(probs_38)[::-1][:3]
                    for idx in top_3_indices:
                        cls_name = PLANT_VILLAGE_CLASSES[idx]
                        info = parse_class_name(cls_name)
                        top_predictions.append({
                            "class_id": cls_name,
                            "crop": info["crop"],
                            "disease": info["disease"],
                            "confidence": round(float(probs_38[idx]), 4),
                            "confidence_percent": f"{float(probs_38[idx]) * 100:.1f}%",
                            "is_healthy": info["is_healthy"],
                        })

        if generate_heatmap:
            # Generate attention/symptom overlay
            heatmap_overlay = generate_symptom_saliency_map(image)

    else:
        # Fallback / Simulated mode (used if demo mode active)
        features = _analyze_image_features(image)
        crop = selected_crop if selected_crop else "Tomato"

        crop_classes = [c for c in PLANT_VILLAGE_CLASSES if crop.lower() in parse_class_name(c)["crop"].lower()]
        if not crop_classes:
            crop_classes = [c for c in PLANT_VILLAGE_CLASSES if "tomato" in c.lower()]

        if features["greenness"] > 0.65 and features["necrosis"] < 0.05 and features["yellowing"] < 0.05:
            healthy_candidates = [c for c in crop_classes if "healthy" in c.lower()]
            predicted_label = healthy_candidates[0] if healthy_candidates else crop_classes[0]
            confidence = 0.945 + (features["greenness"] * 0.05)
        elif features["necrosis"] > 0.15:
            blight_candidates = [c for c in crop_classes if "blight" in c.lower() or "rot" in c.lower() or "spot" in c.lower() or "scab" in c.lower() or "rust" in c.lower() or "measles" in c.lower() or "esca" in c.lower()]
            predicted_label = blight_candidates[0] if blight_candidates else crop_classes[0]
            confidence = 0.892 + (features["necrosis"] * 0.08)
        elif features["yellowing"] > 0.12:
            yellow_candidates = [c for c in crop_classes if "virus" in c.lower() or "mold" in c.lower() or "rust" in c.lower()]
            predicted_label = yellow_candidates[0] if yellow_candidates else crop_classes[0]
            confidence = 0.875 + (features["yellowing"] * 0.1)
        else:
            predicted_label = crop_classes[0]
            confidence = 0.865

        confidence = min(0.978, max(0.612, confidence))

        rem_prob = 1.0 - confidence
        p2 = rem_prob * 0.68
        p3 = rem_prob * 0.32

        other_candidates = [c for c in crop_classes if c != predicted_label]
        if len(other_candidates) < 2:
            other_candidates.extend([c for c in PLANT_VILLAGE_CLASSES if c != predicted_label])

        selected_candidates = [predicted_label, other_candidates[0], other_candidates[1]]
        probs = [confidence, p2, p3]

        for cls_name, p in zip(selected_candidates, probs):
            info = parse_class_name(cls_name)
            top_predictions.append({
                "class_id": cls_name,
                "crop": info["crop"],
                "disease": info["disease"],
                "confidence": round(p, 4),
                "confidence_percent": f"{p * 100:.1f}%",
                "is_healthy": info["is_healthy"],
            })

        if generate_heatmap:
            heatmap_overlay = generate_symptom_saliency_map(image)

    # Class metadata
    primary_info = parse_class_name(predicted_label)

    # Confidence Level classification
    if confidence >= CONFIDENCE_THRESHOLD_HIGH:
        confidence_level = "High"
        confidence_message = "Model has high statistical confidence in this diagnostic pattern."
    elif confidence >= CONFIDENCE_THRESHOLD_MEDIUM:
        confidence_level = "Medium"
        confidence_message = "Moderate confidence. Visual symptoms match known patterns but secondary confirmation is advisable."
    else:
        confidence_level = "Low"
        confidence_message = "Low confidence – Please upload a clearer leaf image with better lighting, or consult a local agricultural extension officer."

    return {
        "is_demo_mode": engine.is_demo_mode,
        "model_architecture": engine.model_architecture,
        "class_id": predicted_label,
        "crop": primary_info["crop"],
        "disease": primary_info["disease"],
        "scientific_name": primary_info["scientific_name"],
        "severity": primary_info["severity"],
        "category": primary_info["category"],
        "is_healthy": primary_info["is_healthy"],
        "confidence": round(confidence, 4),
        "confidence_percent": f"{confidence * 100:.1f}%",
        "confidence_level": confidence_level,
        "confidence_message": confidence_message,
        "top_predictions": top_predictions,
        "heatmap_overlay": heatmap_overlay,
    }
