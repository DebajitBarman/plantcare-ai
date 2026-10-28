"""
PlantCare AI - Image Preprocessing and Validation Pipeline
"""

import io
from typing import Tuple, Union, Optional
from PIL import Image, ImageOps
import numpy as np

# Standard image sizing and normalization for CNN models (ResNet, MobileNet, EfficientNet)
DEFAULT_INPUT_SIZE: Tuple[int, int] = (224, 224)
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

# Maximum allowed file size: 10 Megabytes
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/octet-stream",
}


class ImageValidationError(Exception):
    """Raised when an uploaded file is invalid, corrupt, or exceeds limits."""
    pass


def validate_image_bytes(file_bytes: bytes, filename: str = "") -> None:
    """
    Validates file size, extension, and checks for corruption.
    """
    if not file_bytes:
        raise ImageValidationError("The uploaded file is empty. Please provide a valid leaf image.")

    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise ImageValidationError(
            f"Image file size ({len(file_bytes) / (1024 * 1024):.1f} MB) exceeds the maximum limit of 10 MB."
        )

    if filename:
        ext = filename.split(".")[-1].lower() if "." in filename else ""
        if ext not in ALLOWED_EXTENSIONS:
            raise ImageValidationError(
                f"Unsupported file format '.{ext}'. Supported formats: JPG, JPEG, PNG, WEBP."
            )

    try:
        # Verify Pillow can open and identify the image structure
        image = Image.open(io.BytesIO(file_bytes))
        image.verify()
    except Exception as e:
        raise ImageValidationError(f"Corrupted or unreadable image file: {str(e)}")


def load_image_rgb(file_bytes: bytes) -> Image.Image:
    """
    Loads raw bytes into a PIL Image and converts to RGB mode,
    handling orientation EXIF tags.
    """
    image = Image.open(io.BytesIO(file_bytes))
    # Correct orientation if EXIF present
    try:
        image = ImageOps.exif_transpose(image)
    except Exception:
        pass
    return image.convert("RGB")


def preprocess_for_inference(
    image: Image.Image,
    target_size: Tuple[int, int] = DEFAULT_INPUT_SIZE,
    to_torch_tensor: bool = True,
):
    """
    Resize, center crop / scale to target_size, normalize with ImageNet mean/std.
    Returns PyTorch tensor if torch is available, otherwise normalized NumPy array.
    """
    # Resize preserving details
    resized_image = image.resize(target_size, Image.Resampling.BILINEAR)
    
    # Convert to float numpy array [0, 1]
    img_array = np.array(resized_image, dtype=np.float32) / 255.0

    # Normalize (X - mean) / std
    mean = np.array(IMAGENET_MEAN, dtype=np.float32)
    std = np.array(IMAGENET_STD, dtype=np.float32)
    normalized_array = (img_array - mean) / std

    # Transpose HWC -> CHW
    chw_array = np.transpose(normalized_array, (2, 0, 1))
    
    # Add batch dimension: (1, 3, H, W)
    batch_array = np.expand_dims(chw_array, axis=0)

    if to_torch_tensor:
        try:
            import torch
            return torch.tensor(batch_array, dtype=torch.float32)
        except ImportError:
            pass

    return batch_array
