# PlantCare AI - Deep Learning Model Training Pipeline

This directory contains the training, evaluation, and inference pipeline for PlantCare AI using PyTorch and Torchvision.

## Supported Architectures
- `mobilenet_v3_large` (Fast, lightweight, mobile/edge optimized)
- `resnet50` (Deep residual network, high capacity)
- `efficientnet_b0` (Compound scaling architecture)

## Quick Start Guide

### 1. Prepare Dataset
Place the PlantVillage or agricultural dataset in an ImageFolder format:
```
data/
  plantvillage/
    Apple___Apple_scab/
      img1.jpg
      ...
    Tomato___Early_blight/
      ...
```

### 2. Configure Hyperparameters
Edit `config.yaml` to specify batch size, learning rate, and target architecture.

### 3. Run Training
```bash
python train.py --config config.yaml
```
The best checkpoint will be exported directly as a TorchScript model to `../backend/models/disease_model.pt`.

### 4. Evaluate Model
```bash
python evaluate.py --config config.yaml
```
This produces Accuracy, Precision, Recall, F1 Score, and per-class classification matrices.

### 5. CLI Inference Test
```bash
python inference.py --image path/to/leaf.jpg
```
