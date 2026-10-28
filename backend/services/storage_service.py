"""
PlantCare AI - Storage Service
Modular image storage abstraction (Local Filesystem with S3/Cloudinary ready interface).
"""

import os
import uuid
from typing import Tuple
from PIL import Image

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


class StorageService:
    """Handles image persistence and URL generation."""

    def __init__(self, base_upload_dir: str = UPLOAD_DIR):
        self.upload_dir = base_upload_dir
        os.makedirs(self.upload_dir, exist_ok=True)

    def save_image(self, image: Image.Image, original_filename: str = "") -> Tuple[str, str, str]:
        """
        Saves PIL Image as an optimized JPEG.
        Returns (relative_url_path, local_filesystem_path, generated_filename).
        """
        ext = "jpg"
        unique_id = uuid.uuid4().hex[:12]
        generated_filename = f"scan_{unique_id}.{ext}"
        local_path = os.path.join(self.upload_dir, generated_filename)

        # Save with quality optimization
        image.convert("RGB").save(local_path, format="JPEG", quality=90, optimize=True)

        url_path = f"/uploads/{generated_filename}"
        return url_path, local_path, generated_filename

    def get_local_path(self, filename: str) -> str:
        return os.path.join(self.upload_dir, filename)


# Singleton
storage_service = StorageService()
