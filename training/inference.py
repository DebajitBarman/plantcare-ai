"""
PlantCare AI - Standalone CLI Inference Tool
"""

import argparse
import torch
from PIL import Image
import torchvision.transforms as transforms


def run_cli_inference(image_path: str, model_path: str = "../backend/models/disease_model.pt"):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Loading model from {model_path} on {device}...")

    model = torch.jit.load(model_path, map_location=device)
    model.eval()

    tf = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    image = Image.open(image_path).convert("RGB")
    tensor = tf(image).unsqueeze(0).to(device)

    with torch.no_grad():
        output = model(tensor)
        probabilities = torch.softmax(output, dim=1).squeeze().cpu().numpy()

    top_idx = int(probabilities.argmax())
    confidence = float(probabilities[top_idx])

    print(f"Image: {image_path}")
    print(f"Predicted Class Index: {top_idx}")
    print(f"Confidence: {confidence * 100:.2f}%")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", type=str, required=True, help="Path to leaf image")
    parser.add_argument("--model", type=str, default="../backend/models/disease_model.pt")
    args = parser.parse_args()
    run_cli_inference(args.image, args.model)
