"""
PlantCare AI - Model Evaluation & Metrics Reporting
Calculates Accuracy, Precision, Recall, F1 Score, and Confusion Matrix.
"""

import argparse
import yaml
import torch
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_recall_fscore_support
from dataset import build_dataloaders
from train import build_model


def evaluate_model(config_path: str = "config.yaml", weights_path: str = None):
    with open(config_path, "r") as f:
        config = yaml.safe_load(f)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Evaluating on device: {device}")

    weights = weights_path or config["training"]["output_model_path"]
    arch = config["model"]["architecture"]
    num_classes = config["model"]["num_classes"]

    model = build_model(arch, num_classes, pretrained=False).to(device)
    if weights.endswith(".pt") or weights.endswith(".pth"):
        try:
            model = torch.jit.load(weights, map_location=device)
        except Exception:
            state = torch.load(weights, map_location=device)
            model.load_state_dict(state.get("state_dict", state))

    model.eval()

    _, _, test_loader, class_names = build_dataloaders(
        data_dir=config["dataset"]["data_dir"],
        batch_size=config["dataset"]["batch_size"],
        image_size=config["dataset"]["image_size"],
    )

    y_true = []
    y_pred = []

    with torch.no_grad():
        for images, labels in test_loader:
            images = images.to(device)
            outputs = model(images)
            _, preds = torch.max(outputs, 1)
            y_true.extend(labels.numpy())
            y_pred.extend(preds.cpu().numpy())

    acc = accuracy_score(y_true, y_pred)
    prec, rec, f1, _ = precision_recall_fscore_support(y_true, y_pred, average="weighted", zero_division=0)

    print("\n================== EVALUATION METRICS ==================")
    print(f"Test Accuracy : {acc * 100:.2f}%")
    print(f"Precision     : {prec * 100:.2f}%")
    print(f"Recall        : {rec * 100:.2f}%")
    print(f"F1 Score      : {f1 * 100:.2f}%")
    print("========================================================\n")

    print("Classification Report:")
    print(classification_report(y_true, y_pred, target_names=class_names, zero_division=0))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", type=str, default="config.yaml")
    parser.add_argument("--weights", type=str, default=None)
    args = parser.parse_args()
    evaluate_model(args.config, args.weights)
