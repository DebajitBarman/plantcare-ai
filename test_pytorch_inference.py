import sys
from PIL import Image
import numpy as np

from backend.ml.model_loader import get_model_engine
from backend.ml.predictor import predict_leaf_image

def main():
    engine = get_model_engine()
    print("=" * 60)
    print("PLANTCARE AI - PYTORCH MODEL VERIFICATION")
    print("=" * 60)
    print(f"Is Demo Mode:      {engine.is_demo_mode}")
    print(f"Model Architecture:{engine.model_architecture}")
    print(f"Number of Classes: {engine.num_classes}")
    print(f"Compute Device:    {engine.device}")
    print(f"Classes Count:     {len(engine.classes)}")
    print("=" * 60)

    # Synthetic leaf image with green background and yellow lesion
    arr = np.zeros((300, 300, 3), dtype=np.uint8)
    arr[:, :] = [34, 139, 34]  # Forest green
    arr[80:160, 80:160] = [180, 140, 20]  # Blight / chlorosis spot
    test_img = Image.fromarray(arr)

    result = predict_leaf_image(test_img)
    print("PREDICTION RESULT:")
    print(f"  Demo Mode Flag:    {result['is_demo_mode']}")
    print(f"  Architecture:      {result['model_architecture']}")
    print(f"  Predicted Class:   {result['class_id']}")
    print(f"  Crop:              {result['crop']}")
    print(f"  Disease:           {result['disease']}")
    print(f"  Severity:          {result['severity']}")
    print(f"  Confidence:        {result['confidence_percent']}")
    print(f"  Confidence Level:  {result['confidence_level']}")
    print("  Top 3 Neural Network Probabilities:")
    for p in result['top_predictions']:
        print(f"    * {p['crop']} - {p['disease']}: {p['confidence_percent']}")

    assert engine.is_demo_mode is False, "Expected is_demo_mode to be False!"
    assert result['is_demo_mode'] is False, "Expected result['is_demo_mode'] to be False!"
    print("\n[SUCCESS] Trained PyTorch neural network inference verified successfully!")

if __name__ == "__main__":
    main()
