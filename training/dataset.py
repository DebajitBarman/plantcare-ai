"""
PlantCare AI - Dataset Loader and Augmentation Pipelines
"""

import os
from typing import Tuple, List
import torch
from torch.utils.data import Dataset, DataLoader, random_split
from torchvision import transforms, datasets
from PIL import Image


def get_transforms(image_size: int = 224):
    """Returns training and validation/test torchvision transformation pipelines."""
    train_transform = transforms.Compose([
        transforms.Resize((image_size, image_size)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomVerticalFlip(p=0.2),
        transforms.RandomRotation(degrees=25),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    val_test_transform = transforms.Compose([
        transforms.Resize((image_size, image_size)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    return train_transform, val_test_transform


def build_dataloaders(
    data_dir: str,
    batch_size: int = 32,
    image_size: int = 224,
    train_split: float = 0.70,
    val_split: float = 0.15,
    test_split: float = 0.15,
    num_workers: int = 2,
):
    """
    Creates train, val, and test DataLoader objects from an ImageFolder directory.
    """
    train_tf, val_tf = get_transforms(image_size)

    if not os.path.exists(data_dir):
        raise FileNotFoundError(f"Dataset directory '{data_dir}' does not exist.")

    full_dataset = datasets.ImageFolder(root=data_dir, transform=train_tf)
    total_samples = len(full_dataset)

    train_len = int(train_split * total_samples)
    val_len = int(val_split * total_samples)
    test_len = total_samples - train_len - val_len

    train_ds, val_ds, test_ds = random_split(
        full_dataset,
        [train_len, val_len, test_len],
        generator=torch.Generator().manual_seed(42),
    )

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=num_workers)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=num_workers)
    test_loader = DataLoader(test_ds, batch_size=batch_size, shuffle=False, num_workers=num_workers)

    return train_loader, val_loader, test_loader, full_dataset.classes
