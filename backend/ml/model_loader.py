"""
PlantCare AI - PyTorch Model Loader & Architecture Adapter
Loads trained PyTorch models (38-Class Broad Agricultural MobileNetV2 + 15-Class Solanaceae Specialist)
once at startup, or initializes the transparent demo mode if weights are missing.
"""

import os
import glob
import json
import logging
from typing import Optional, Dict, Any, List, Tuple
import numpy as np

from .labels import PLANT_VILLAGE_CLASSES, CLASS_DETAILS, parse_class_name

logger = logging.getLogger("plantcare.ml.model_loader")
logger.setLevel(logging.INFO)

DEFAULT_MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")


class PlantCareModelEngine:
    """
    Manages the PyTorch inference models:
    - 38-class MobileNetV2 for broad crop pathology (Grape, Apple, Corn, Peach, etc.)
    - 15-class MobileNetV3 TorchScript specialist for high-precision Solanaceae diagnosis (Potato, Tomato, Pepper)
    Loaded once at server startup and cached.
    """

    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path
        self.model_38 = None
        self.model_15 = None
        self.model = None  # Primary model reference
        self.device = "cpu"
        self.is_demo_mode = False
        self.num_classes = len(PLANT_VILLAGE_CLASSES)
        self.model_architecture = "Unknown"
        self.classes = PLANT_VILLAGE_CLASSES
        self.classes_38 = PLANT_VILLAGE_CLASSES
        self.classes_15: List[str] = []
        self._initialize()

    def _initialize(self):
        try:
            import torch
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
            logger.info(f"Using compute device: {self.device}")

            # 1. Load 15-class Solanaceae specialist classes
            class_file = os.path.join(DEFAULT_MODEL_DIR, "class_names.json")
            if os.path.exists(class_file):
                try:
                    with open(class_file, "r", encoding="utf-8") as f:
                        loaded_classes = json.load(f)
                        if isinstance(loaded_classes, list) and len(loaded_classes) > 0:
                            self.classes_15 = loaded_classes
                            logger.info(f"Loaded {len(self.classes_15)} classes for 15-class specialist model")
                except Exception as e:
                    logger.warning(f"Failed to load class_names.json: {e}")

            # 2. Load 15-class TorchScript specialist model (disease_model.pt)
            torchscript_file = os.path.join(DEFAULT_MODEL_DIR, "disease_model.pt")
            if os.path.exists(torchscript_file):
                try:
                    self.model_15 = torch.jit.load(torchscript_file, map_location=self.device)
                    self.model_15.eval()
                    logger.info("Successfully loaded 15-class Solanaceae specialist (disease_model.pt).")
                except Exception as jit_err:
                    logger.warning(f"Could not load 15-class TorchScript model: {jit_err}")

            # 3. Load 38-class MobileNetV2 model
            local_38_dir = os.path.join(DEFAULT_MODEL_DIR, "mobilenetv2_38class")
            try:
                from transformers import MobileNetV2ForImageClassification
                if os.path.exists(local_38_dir) and os.path.exists(os.path.join(local_38_dir, "model.safetensors")):
                    logger.info(f"Loading 38-class MobileNetV2 from local weights: {local_38_dir}")
                    self.model_38 = MobileNetV2ForImageClassification.from_pretrained(local_38_dir)
                else:
                    logger.info("Local 38-class weights not found, downloading from linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification...")
                    self.model_38 = MobileNetV2ForImageClassification.from_pretrained(
                        "linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification"
                    )
                self.model_38.to(self.device).eval()
                self.model = self.model_38
                self.classes = self.classes_38
                self.num_classes = len(self.classes_38)
                logger.info(f"Successfully loaded 38-class MobileNetV2 model with {self.num_classes} classes.")
            except Exception as hf_err:
                logger.warning(f"Could not load 38-class MobileNetV2: {hf_err}")

            # Determine operational mode
            if self.model_38 is not None and self.model_15 is not None:
                self.is_demo_mode = False
                self.model_architecture = "Dual-Engine: MobileNetV2 (38 Classes) + MobileNetV3 (15 Solanaceae Specialist)"
            elif self.model_38 is not None:
                self.is_demo_mode = False
                self.model_architecture = "MobileNetV2 (38 Classes - PlantVillage Standard)"
            elif self.model_15 is not None:
                self.is_demo_mode = False
                self.model = self.model_15
                self.classes = self.classes_15
                self.num_classes = len(self.classes_15)
                self.model_architecture = "MobileNetV3 (15 Classes - Solanaceae Specialist)"
            else:
                logger.warning("No PyTorch models loaded. Activating PlantCare Demo/Simulation Inference Mode.")
                self.is_demo_mode = True
                self.model_architecture = "PlantCare Simulated Classifier (Demo Mode)"

        except Exception as e:
            logger.warning(f"PyTorch loading issue: {e}. Falling back to transparent Demo Mode.")
            self.is_demo_mode = True
            self.model_architecture = "PlantCare Simulated Classifier (Demo Mode)"

    def get_status(self) -> Dict[str, Any]:
        return {
            "is_demo_mode": self.is_demo_mode,
            "architecture": self.model_architecture,
            "device": self.device,
            "num_classes": self.num_classes,
            "model_38_loaded": self.model_38 is not None,
            "model_15_loaded": self.model_15 is not None,
            "model_loaded": (self.model_38 is not None or self.model_15 is not None),
        }


# Global singleton instance
_engine_instance: Optional[PlantCareModelEngine] = None


def get_model_engine() -> PlantCareModelEngine:
    global _engine_instance
    if _engine_instance is None:
        _engine_instance = PlantCareModelEngine()
    return _engine_instance
