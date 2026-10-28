"""
PlantCare AI - PyTorch Model Training Loop with Checkpointing & Transfer Learning
"""

import os
import time
import argparse
import yaml
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import models

from dataset import build_dataloaders


def build_model(architecture: str, num_classes: int, pretrained: bool = True):
    """Instantiates and adapts transfer learning backbone."""
    arch = architecture.lower()

    if "mobilenet" in arch:
        weights = models.MobileNet_V3_Large_Weights.DEFAULT if pretrained else None
        model = models.mobilenet_v3_large(weights=weights)
        in_features = model.classifier[3].in_features
        model.classifier[3] = nn.Linear(in_features, num_classes)

    elif "resnet50" in arch:
        weights = models.ResNet50_Weights.DEFAULT if pretrained else None
        model = models.resnet50(weights=weights)
        in_features = model.fc.in_features
        model.fc = nn.Linear(in_features, num_classes)

    elif "efficientnet" in arch:
        weights = models.EfficientNet_B0_Weights.DEFAULT if pretrained else None
        model = models.efficientnet_b0(weights=weights)
        in_features = model.classifier[1].in_features
        model.classifier[1] = nn.Linear(in_features, num_classes)

    else:
        raise ValueError(f"Unsupported architecture: {architecture}")

    return model


def train_model(config_path: str = "config.yaml"):
    with open(config_path, "r") as f:
        config = yaml.safe_load(f)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Training on device: {device}")

    # Build model
    arch = config["model"]["architecture"]
    num_classes = config["model"]["num_classes"]
    pretrained = config["model"]["pretrained"]
    model = build_model(arch, num_classes, pretrained).to(device)

    # Dataloaders
    train_loader, val_loader, _, class_names = build_dataloaders(
        data_dir=config["dataset"]["data_dir"],
        batch_size=config["dataset"]["batch_size"],
        image_size=config["dataset"]["image_size"],
    )

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=config["training"]["learning_rate"], weight_decay=config["training"]["weight_decay"])
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=config["training"]["epochs"])

    best_val_acc = 0.0
    checkpoint_dir = config["training"]["checkpoint_dir"]
    os.makedirs(checkpoint_dir, exist_ok=True)
    out_path = config["training"]["output_model_path"]
    os.makedirs(os.path.dirname(out_path), exist_ok=True)

    epochs = config["training"]["epochs"]
    for epoch in range(epochs):
        model.train()
        train_loss = 0.0
        correct = 0
        total = 0

        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            train_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs, 1)
            correct += torch.sum(preds == labels.data).item()
            total += labels.size(0)

        train_acc = correct / total
        scheduler.step()

        # Validation
        model.eval()
        val_loss = 0.0
        val_correct = 0
        val_total = 0
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)

                val_loss += loss.item() * images.size(0)
                _, preds = torch.max(outputs, 1)
                val_correct += torch.sum(preds == labels.data).item()
                val_total += labels.size(0)

        val_acc = val_correct / val_total
        print(f"Epoch [{epoch+1}/{epochs}] Train Loss: {train_loss/total:.4f} Acc: {train_acc:.4f} | Val Loss: {val_loss/val_total:.4f} Acc: {val_acc:.4f}")

        # Checkpoint
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), os.path.join(checkpoint_dir, "best_checkpoint.pth"))
            # Save TorchScript or full pt for deployment
            scripted = torch.jit.script(model)
            scripted.save(out_path)
            print(f"Saved new best model ({val_acc*100:.2f}%) to {out_path}")

    print(f"Training completed. Best validation accuracy: {best_val_acc*100:.2f}%")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", type=str, default="config.yaml", help="Path to config.yaml")
    args = parser.parse_args()
    train_model(args.config)
