"""
PlantCare AI - Model Explainability & Attention Heatmaps (Grad-CAM)
Modular explainability for highlighting disease regions on leaf images.
"""

import io
import base64
from typing import Optional, Tuple
import numpy as np
from PIL import Image


def generate_symptom_saliency_map(
    pil_image: Image.Image,
    target_size: Tuple[int, int] = (224, 224)
) -> str:
    """
    Generates a localized saliency/heatmap highlighting necrotic and chlorotic
    lesions (yellow, brown, necrotic spots) on the leaf surface.
    Returns a base64 encoded PNG overlay.
    """
    img_resized = pil_image.resize(target_size).convert("RGB")
    rgb_arr = np.array(img_resized, dtype=np.float32) / 255.0
    r, g, b = rgb_arr[:, :, 0], rgb_arr[:, :, 1], rgb_arr[:, :, 2]

    # Chlorosis indicator: high red and green, low blue
    chlorosis = np.maximum(0.0, (r + g) / 2.0 - b)

    # Necrosis/Blight indicator: brown/dark spots (low brightness with reddish-brown tint)
    brightness = (r + g + b) / 3.0
    brown_tint = np.maximum(0.0, r - b)
    necrosis = brown_tint * (1.0 - brightness)

    # Combined saliency score
    saliency = chlorosis * 0.6 + necrosis * 0.8
    saliency = np.clip(saliency, 0.0, 1.0)
    
    # Normalize saliency map
    if saliency.max() > saliency.min():
        saliency = (saliency - saliency.min()) / (saliency.max() - saliency.min())
    else:
        saliency = np.zeros_like(saliency)

    # Apply pseudo-JET colormap (Blue -> Cyan -> Yellow -> Red)
    h, w = saliency.shape
    heatmap = np.zeros((h, w, 4), dtype=np.uint8)

    # Red channel
    heatmap[:, :, 0] = np.clip(np.sin(saliency * np.pi - np.pi / 2) * 127 + 128, 0, 255).astype(np.uint8)
    # Green channel
    heatmap[:, :, 1] = np.clip(np.sin(saliency * np.pi) * 255, 0, 255).astype(np.uint8)
    # Blue channel
    heatmap[:, :, 2] = np.clip(np.sin(saliency * np.pi + np.pi / 2) * 127 + 128, 0, 255).astype(np.uint8)
    # Alpha channel: transparent where saliency is low, opaque on focal spots
    alpha = np.clip(saliency * 180, 0, 180).astype(np.uint8)
    heatmap[:, :, 3] = alpha

    # Save to PNG base64
    overlay_img = Image.fromarray(heatmap, mode="RGBA")
    buffer = io.BytesIO()
    overlay_img.save(buffer, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buffer.getvalue()).decode("utf-8")


def compute_gradcam_overlay(model, input_tensor, target_class_idx: int) -> Optional[str]:
    """
    Computes true Grad-CAM if a PyTorch model with convolutional layers is active.
    Falls back gracefully if the layer architecture varies.
    """
    try:
        import torch
        import torch.nn.functional as F

        # Look for the last conv layer
        target_layer = None
        for module in reversed(list(model.modules())):
            if isinstance(module, torch.nn.Conv2d):
                target_layer = module
                break

        if target_layer is None:
            return None

        activations = []
        gradients = []

        def forward_hook(module, inp, out):
            activations.append(out)

        def backward_hook(module, grad_in, grad_out):
            gradients.append(grad_out[0])

        h1 = target_layer.register_forward_hook(forward_hook)
        h2 = target_layer.register_full_backward_hook(backward_hook)

        input_tensor.requires_grad = True
        output = model(input_tensor)
        score = output[0, target_class_idx]
        model.zero_grad()
        score.backward()

        h1.remove()
        h2.remove()

        if not activations or not gradients:
            return None

        act = activations[0].detach()
        grad = gradients[0].detach()
        weights = torch.mean(grad, dim=[2, 3], keepdim=True)
        cam = torch.sum(weights * act, dim=1, keepdim=True)
        cam = F.relu(cam)
        cam = F.interpolate(cam, size=(224, 224), mode='bilinear', align_corners=False)
        cam = cam.squeeze().cpu().numpy()
        cam = (cam - cam.min()) / (cam.max() - cam.min() + 1e-8)

        # Convert cam to RGBA heatmap
        h, w = cam.shape
        heatmap = np.zeros((h, w, 4), dtype=np.uint8)
        heatmap[:, :, 0] = (cam * 255).astype(np.uint8)
        heatmap[:, :, 1] = ((1.0 - cam) * 128).astype(np.uint8)
        heatmap[:, :, 2] = 0
        heatmap[:, :, 3] = (cam * 160).astype(np.uint8)

        overlay_img = Image.fromarray(heatmap, mode="RGBA")
        buffer = io.BytesIO()
        overlay_img.save(buffer, format="PNG")
        return "data:image/png;base64," + base64.b64encode(buffer.getvalue()).decode("utf-8")

    except Exception:
        return None
