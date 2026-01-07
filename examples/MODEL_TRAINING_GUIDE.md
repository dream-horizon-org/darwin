# Model Training Guide for Darwin One-Click Deployment

This guide explains how to write model training scripts that work seamlessly with Darwin's one-click deployment system. Follow these patterns to ensure your models integrate properly with the `/schema`, `/predict`, `/ready`, and `/healthcheck` API endpoints.

## Table of Contents

1. [Overview](#overview)
2. [Core Concepts](#core-concepts)
3. [Framework-Specific Guides](#framework-specific-guides)
4. [Signature Creation Patterns](#signature-creation-patterns)
5. [API Endpoint Behavior](#api-endpoint-behavior)
6. [Compatibility Checklist](#compatibility-checklist)
7. [Troubleshooting](#troubleshooting)
8. [Reference](#reference)

---

## Overview

### How One-Click Deployment Works

When you deploy a model using Darwin's one-click deployment:

1. **Model URI Detection**: The system parses your MLflow model URI (`mlflow-artifacts:/`, `runs:/`, or `models:/`)
2. **Flavor Detection**: Darwin reads the `MLmodel` file to detect the model flavor (sklearn, xgboost, pytorch, tensorflow, etc.)
3. **Image Selection**: Based on the flavor, the appropriate runtime image is selected:
   - `sklearn` → sklearn image (scikit-learn models)
   - `xgboost`, `lightgbm`, `catboost` → boosting image
   - `pytorch`, `torch` → pytorch image
   - `tensorflow`, `keras` → tensorflow image
4. **Deployment**: The model is deployed with endpoints for health checks, schema, and predictions

### Key Requirements

For proper integration with Darwin's serve runtime:

| Requirement | Purpose | Impact |
|-------------|---------|--------|
| **Model Signature** | Defines input/output schema | Required for `/schema` endpoint |
| **Input Example** | Provides sample data | Required for TensorSpec models, recommended for all |
| **Proper Artifact Logging** | Stores model with metadata | Required for model loading |
| **Named Output Columns** | Clear prediction format | Improves `/predict` response clarity |

---

## Core Concepts

### Model Signature

The model signature defines the expected input and output schema. MLflow supports two schema types:

#### ColSpec Schema (Traditional ML)

Used by: **sklearn**, **XGBoost**, **LightGBM**, **CatBoost**

ColSpec schemas define named columns with types:

```python
# Signature in MLmodel file looks like:
signature:
  inputs: '[{"name": "feature1", "type": "double"}, {"name": "feature2", "type": "double"}]'
  outputs: '[{"name": "prediction", "type": "double"}]'
```

**How to create:**

```python
from mlflow.models import infer_signature

# For regression
y_pred_df = pd.DataFrame(predictions, columns=["predicted_value"])
signature = infer_signature(X_train, y_pred_df)

# For classification (with probabilities)
y_pred_class = pd.DataFrame(model.predict(X_train), columns=["predicted_class"])
y_pred_proba = pd.DataFrame(model.predict_proba(X_train), columns=["prob_class_0", "prob_class_1"])
y_pred_combined = pd.concat([y_pred_class, y_pred_proba], axis=1)
signature = infer_signature(X_train, y_pred_combined)
```

#### TensorSpec Schema (Deep Learning)

Used by: **TensorFlow**, **Keras**, **PyTorch**

TensorSpec schemas define tensor shapes and dtypes:

```python
# Signature in MLmodel file looks like:
signature:
  inputs: '[{"name": "dense_input", "type": "tensor", "tensor-spec": {"dtype": "float64", "shape": [-1, 30]}}]'
  outputs: '[{"name": "predictions", "type": "tensor", "tensor-spec": {"dtype": "float32", "shape": [-1, 1]}}]'
```

**How to create:**

```python
from mlflow.models import ModelSignature
from mlflow.types import Schema, TensorSpec
import numpy as np

num_features = len(feature_names)
input_spec = TensorSpec(np.dtype(np.float64), (-1, num_features), name="dense_input")
output_spec = TensorSpec(np.dtype(np.float32), (-1, 1), name="predictions")
signature = ModelSignature(inputs=Schema([input_spec]), outputs=Schema([output_spec]))
```

### Input Example

The input example is crucial for TensorSpec models because **feature names come from the input_example columns, NOT from the signature**.

**Critical Rule**: Always use a **DataFrame** as input_example to preserve column names:

```python
# CORRECT: DataFrame preserves column names
input_example = X_test.head(1)  # DataFrame with named columns

# WRONG: numpy array loses column names
input_example = X_test.head(1).values  # DO NOT USE - loses feature names!
```

The runtime extracts feature names from the input_example artifact to:
1. Populate the `/schema` endpoint with meaningful feature names
2. Convert feature dicts to ordered arrays for `/predict`

### Artifact Logging Pattern

Always use this pattern to log model artifacts:

```python
import tempfile
import mlflow

with tempfile.TemporaryDirectory() as tmpdir:
    local_model_path = os.path.join(tmpdir, "model")
    
    mlflow.<flavor>.save_model(
        model,
        local_model_path,
        signature=signature,
        input_example=input_example  # Must be DataFrame!
    )
    
    mlflow.log_artifacts(local_model_path, artifact_path="model")
```

This creates the artifact structure expected by Darwin:
```
model/
├── MLmodel           # Contains signature and metadata
├── model.pkl         # Serialized model (varies by flavor)
├── input_example.json  # Input example data
└── requirements.txt  # Dependencies (optional)
```

---

## Framework-Specific Guides

### Scikit-learn Classifiers

**Image**: `serve-md-runtime:sklearn`

**Example**: [Iris Classification](iris-classification/train_iris_model.ipynb)

```python
import mlflow.sklearn
from mlflow.models import infer_signature

# Train your classifier
model = RandomForestClassifier(**hyperparams)
model.fit(X_train, y_train)

# Create output DataFrame with class AND probabilities
y_pred_class = pd.DataFrame(model.predict(X_train), columns=["predicted_class"])
y_pred_proba = pd.DataFrame(
    model.predict_proba(X_train), 
    columns=[f"prob_class_{i}" for i in range(model.n_classes_)]
)
y_pred_combined = pd.concat([y_pred_class, y_pred_proba], axis=1)

# Create signature
signature = infer_signature(X_train, y_pred_combined)
input_example = X_test.head(1)

# Log model
with tempfile.TemporaryDirectory() as tmpdir:
    mlflow.sklearn.save_model(
        model,
        os.path.join(tmpdir, "model"),
        signature=signature,
        input_example=input_example
    )
    mlflow.log_artifacts(os.path.join(tmpdir, "model"), artifact_path="model")
```

**Runtime Output Format**:
```json
{
  "predicted_class": [0],
  "probabilities": [[0.95, 0.03, 0.02]]
}
```

### Scikit-learn Regressors

**Image**: `serve-md-runtime:sklearn`

**Example**: [House Price Prediction](house-price-prediction/train_house_pricing_model.ipynb)

```python
# Train your regressor
model = RandomForestRegressor(**hyperparams)
model.fit(X_train, y_train)

# Create output DataFrame with named column
y_pred_df = pd.DataFrame(model.predict(X_train), columns=["predicted_price"])

# Create signature
signature = infer_signature(X_train, y_pred_df)
input_example = X_test.head(1)

# Log model (same pattern as classifiers)
```

**Runtime Output Format**:
```json
{
  "scores": [245678.50]
}
```

### XGBoost

**Image**: `serve-md-runtime:boosting`

**Example**: [Diabetes Regression](xgboost-diabetes-regression/train_xgboost_diabetes.ipynb)

```python
import xgboost as xgb
import mlflow.xgboost
from mlflow.models import infer_signature

# Create DMatrix and train
dtrain = xgb.DMatrix(X_train, label=y_train)
model = xgb.train(params=hyperparams, dtrain=dtrain, num_boost_round=100)

# IMPORTANT: Pass DataFrame to preserve feature names
y_pred_df = pd.DataFrame(
    model.predict(xgb.DMatrix(X_train[:1])), 
    columns=["predicted_progression"]
)

# Create signature with DataFrame input
signature = infer_signature(X_train, y_pred_df)  # X_train is DataFrame
input_example = X_test.head(1)  # DataFrame preserves feature names

# Log model
with tempfile.TemporaryDirectory() as tmpdir:
    mlflow.xgboost.save_model(
        model,
        os.path.join(tmpdir, "model"),
        signature=signature,
        input_example=input_example
    )
    mlflow.log_artifacts(os.path.join(tmpdir, "model"), artifact_path="model")
```

**Critical Note**: XGBoost DMatrix requires feature names to match. The runtime extracts feature names from the ColSpec schema to create the DMatrix correctly.

### LightGBM

**Image**: `serve-md-runtime:boosting`

**Example**: [Wine Classification](lightgbm-wine-classification/train_lightgbm_wine.ipynb)

```python
import lightgbm as lgb
import mlflow.lightgbm
from mlflow.models import infer_signature

# Train model
train_data = lgb.Dataset(X_train, label=y_train)
model = lgb.train(params=hyperparams, train_set=train_data, num_boost_round=100)

# For multi-class, output probabilities
predictions = model.predict(X_train[:1])
y_pred_df = pd.DataFrame(predictions, columns=["class_0_prob", "class_1_prob", "class_2_prob"])

# Create signature
signature = infer_signature(X_train, y_pred_df)
input_example = X_test.head(1)

# Log model
with tempfile.TemporaryDirectory() as tmpdir:
    mlflow.lightgbm.save_model(
        model,
        os.path.join(tmpdir, "model"),
        signature=signature,
        input_example=input_example
    )
    mlflow.log_artifacts(os.path.join(tmpdir, "model"), artifact_path="model")
```

### PyTorch

**Image**: `serve-md-runtime:pytorch`

**Example**: [MNIST Classification](pytorch-mnist-classification/train_pytorch_mnist.ipynb)

```python
import torch
import mlflow.pytorch
from mlflow.models.signature import infer_signature

# Define and train your model
class MNISTNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(784, 128)
        self.fc2 = nn.Linear(128, 64)
        self.fc3 = nn.Linear(64, 10)
    
    def forward(self, x):
        x = x.view(-1, 784)
        x = F.relu(self.fc1(x))
        x = F.relu(self.fc2(x))
        return self.fc3(x)  # Returns raw logits

model = MNISTNet()
# ... training code ...

# CRITICAL: Create input DataFrame with named columns
X_train_df = pd.DataFrame(X_train)
X_train_df.columns = [f"pixel_{i}" for i in range(784)]

# Create output DataFrame matching model's raw output (logits)
model.eval()
with torch.no_grad():
    logits = model(torch.tensor(X_train[:1], dtype=torch.float32)).numpy()
y_pred_df = pd.DataFrame(logits, columns=[f"digit_{i}_score" for i in range(10)])

# Create signature
signature = infer_signature(X_train_df, y_pred_df)
input_example = X_train_df.head(1)  # DataFrame with named columns!

# Log model
with tempfile.TemporaryDirectory() as tmpdir:
    mlflow.pytorch.save_model(
        model,
        os.path.join(tmpdir, "model"),
        signature=signature,
        input_example=input_example
    )
    mlflow.log_artifacts(os.path.join(tmpdir, "model"), artifact_path="model")
```

**Note**: PyTorch models return raw logits. Apply `softmax` for probabilities or `argmax` for class predictions.

### TensorFlow / Keras

**Image**: `serve-md-runtime:tensorflow`

**Example**: [Breast Cancer Classification](tensorflow-breast-cancer-classification/train_tensorflow_breast_cancer.ipynb)

**Requirements**:
- Python 3.10+
- TensorFlow 2.15.x (pinned for compatibility)

```python
import tensorflow as tf
from tensorflow import keras
import mlflow.tensorflow
from mlflow.models import ModelSignature
from mlflow.types import Schema, TensorSpec
import numpy as np

# Build and train model
model = keras.Sequential([
    keras.layers.Dense(32, activation='relu', input_shape=(num_features,)),
    keras.layers.Dense(1, activation='sigmoid')
])
model.compile(optimizer='adam', loss='binary_crossentropy')
model.fit(X_train, y_train, epochs=100)

# Create TensorSpec signature
# IMPORTANT: Input tensor name should match Keras layer name (typically "dense_input")
input_spec = TensorSpec(np.dtype(np.float64), (-1, num_features), name="dense_input")
output_spec = TensorSpec(np.dtype(np.float32), (-1, 1), name="predictions")
signature = ModelSignature(inputs=Schema([input_spec]), outputs=Schema([output_spec]))

# CRITICAL: Use DataFrame as input_example to preserve feature names!
# The runtime extracts feature names from this DataFrame
input_example = X_test.head(1)  # X_test is a DataFrame with named columns

# Log model
with tempfile.TemporaryDirectory() as tmpdir:
    mlflow.tensorflow.save_model(
        model,
        os.path.join(tmpdir, "model"),
        signature=signature,
        input_example=input_example  # DataFrame preserves feature names!
    )
    mlflow.log_artifacts(os.path.join(tmpdir, "model"), artifact_path="model")
```

**Critical Notes**:
1. Use DataFrame as input_example (not numpy array) to preserve feature names
2. The runtime reads feature names from the input_example for `/schema`
3. TensorFlow version must match between training and serving (2.15.x recommended)

---

## Signature Creation Patterns

### Quick Reference

| Model Type | Signature Method | Output Format |
|------------|------------------|---------------|
| sklearn classifier | `infer_signature(X, concat([class, proba]))` | `{predicted_class, probabilities}` |
| sklearn regressor | `infer_signature(X, DataFrame([pred], columns=["name"]))` | `{scores}` |
| XGBoost/LightGBM | `infer_signature(X, DataFrame(pred, columns=[...]))` | `{scores}` |
| PyTorch | `infer_signature(DataFrame(X), DataFrame(logits))` | Raw logits |
| TensorFlow | `ModelSignature(TensorSpec(...))` + DataFrame input_example | Raw predictions |

### ColSpec Pattern (Most ML Models)

```python
from mlflow.models import infer_signature
import pandas as pd

# Ensure X_train is a DataFrame with named columns
if not isinstance(X_train, pd.DataFrame):
    X_train = pd.DataFrame(X_train, columns=feature_names)

# Create named output
y_pred_df = pd.DataFrame(predictions, columns=["predicted_value"])

# Infer signature
signature = infer_signature(X_train, y_pred_df)
```

### TensorSpec Pattern (Deep Learning)

```python
from mlflow.models import ModelSignature
from mlflow.types import Schema, TensorSpec
import numpy as np

# Define input tensor spec
input_spec = TensorSpec(
    dtype=np.dtype(np.float64),
    shape=(-1, num_features),  # -1 for batch dimension
    name="input_tensor"  # Match Keras input layer name if applicable
)

# Define output tensor spec
output_spec = TensorSpec(
    dtype=np.dtype(np.float32),
    shape=(-1, num_classes),
    name="output_tensor"
)

# Create signature
signature = ModelSignature(
    inputs=Schema([input_spec]),
    outputs=Schema([output_spec])
)

# CRITICAL: Use DataFrame input_example
input_example = pd.DataFrame(X_test[:1], columns=feature_names)
```

---

## API Endpoint Behavior

| Endpoint | Method | Input | Output | Notes |
|----------|--------|-------|--------|-------|
| `/healthcheck` | GET | - | `{"status": "healthy"}` | Always available, checks app health |
| `/ready` | GET | - | `{"status": "ready"}` | Returns 503 until model is loaded |
| `/schema` | GET | - | `{inputs, outputs, sample_request, json_schema}` | Extracted from MLmodel, no model load required |
| `/predict` | POST | `{"features": {...}}` | `{"scores": [...]}` or `{"predicted_class": ..., "probabilities": [...]}` | Uses native loader for inference |

### Example `/schema` Response

```json
{
  "inputs": [
    {"name": "sepal_length", "type": "double", "required": true},
    {"name": "sepal_width", "type": "double", "required": true},
    {"name": "petal_length", "type": "double", "required": true},
    {"name": "petal_width", "type": "double", "required": true}
  ],
  "outputs": [
    {"name": "predicted_class", "type": "long", "required": true},
    {"name": "prob_class_0", "type": "double", "required": true},
    {"name": "prob_class_1", "type": "double", "required": true},
    {"name": "prob_class_2", "type": "double", "required": true}
  ],
  "sample_request": {
    "features": {
      "sepal_length": 5.1,
      "sepal_width": 3.5,
      "petal_length": 1.4,
      "petal_width": 0.2
    }
  },
  "json_schema": {
    "type": "object",
    "properties": {
      "sepal_length": {"type": "number"},
      "sepal_width": {"type": "number"},
      "petal_length": {"type": "number"},
      "petal_width": {"type": "number"}
    },
    "required": ["sepal_length", "sepal_width", "petal_length", "petal_width"]
  }
}
```

### Example `/predict` Request/Response

**Request:**
```bash
curl -X POST "http://localhost/my-model/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "features": {
      "sepal_length": 5.1,
      "sepal_width": 3.5,
      "petal_length": 1.4,
      "petal_width": 0.2
    }
  }'
```

**Response (Classifier):**
```json
{
  "predicted_class": [0],
  "probabilities": [[0.97, 0.02, 0.01]]
}
```

**Response (Regressor):**
```json
{
  "scores": [245678.50]
}
```

---

## Compatibility Checklist

Before deploying your model, verify these items:

### Required

- [ ] **Model signature created** - Use `infer_signature()` or `ModelSignature()`
- [ ] **Input example is DataFrame** - Preserves column names for `/schema`
- [ ] **Output columns named** - e.g., `predicted_class`, `predicted_price`
- [ ] **Artifacts logged correctly** - Use `mlflow.log_artifacts(path, artifact_path="model")`

### Framework-Specific

#### Scikit-learn Classifiers
- [ ] Include both class predictions AND probabilities in signature
- [ ] Use `predict_proba()` output for probability columns

#### XGBoost / LightGBM
- [ ] Input data is DataFrame (not numpy array) to preserve feature names
- [ ] Feature names match between training and prediction

#### PyTorch
- [ ] Input DataFrame has named columns (`pixel_0`, `feature_1`, etc.)
- [ ] Output DataFrame matches model's raw output shape

#### TensorFlow / Keras
- [ ] Python version is 3.10+
- [ ] TensorFlow version is 2.15.x
- [ ] Input example is DataFrame (not numpy array)
- [ ] TensorSpec input name matches Keras layer name (e.g., `dense_input`)

---

## Troubleshooting

### `/schema` Returns Empty or Generic Names

**Symptom**: Schema shows `tensor` or generic names instead of feature names

**Causes & Solutions**:

1. **Missing input_example**: Add `input_example=X_test.head(1)` when saving
2. **Numpy array instead of DataFrame**: Use `pd.DataFrame(X_test[:1], columns=feature_names)`
3. **Missing signature**: Use `infer_signature()` or create `ModelSignature()`

### Feature Order Errors (XGBoost)

**Symptom**: `training data did not have the following fields: feature1, feature2...`

**Solution**: Ensure you pass DataFrame (not numpy array) to preserve feature names:
```python
# CORRECT
signature = infer_signature(X_train_df, y_pred_df)  # X_train_df is DataFrame

# WRONG
signature = infer_signature(X_train.values, y_pred)  # numpy array loses names
```

### TensorFlow Import Errors

**Symptom**: `No module named 'keras.src.models.sharpness_aware_minimization'`

**Solution**: Pin TensorFlow and Keras versions:
```python
# In training script
%pip install 'tensorflow~=2.15.0'

# Verify versions match
import tensorflow as tf
print(f"TensorFlow: {tf.__version__}")  # Should be 2.15.x
```

### Model Not Loading (PyTorch)

**Symptom**: `WeightsUnpickler error: Unsupported global: cloudpickle`

**Solution**: The runtime handles this automatically with `weights_only=False`. If training locally:
```python
# When loading PyTorch models that were saved with cloudpickle
model = torch.load(path, weights_only=False)
```

### `/predict` Returns Wrong Shape

**Symptom**: Predictions have unexpected dimensions or format

**Causes & Solutions**:

1. **Signature mismatch**: Ensure output signature matches actual model output
2. **Post-processing needed**: Deep learning models return raw logits; apply softmax/argmax if needed
3. **Batch dimension**: Ensure input has batch dimension `(1, num_features)`

### TensorSpec Shows `dense_input` Instead of Features

**Symptom**: `/schema` shows single tensor name instead of feature columns

**Solution**: For TensorSpec models, the runtime expands tensor names using input_example:
```python
# The input_example DataFrame columns become the feature names
input_example = pd.DataFrame(X_test[:1], columns=feature_names)
```

---

## Reference

### Example Notebooks

| Framework | Example | Description |
|-----------|---------|-------------|
| sklearn (classifier) | [Iris Classification](iris-classification/train_iris_model.ipynb) | Multi-class classification |
| sklearn (regressor) | [House Price Prediction](house-price-prediction/train_house_pricing_model.ipynb) | Regression |
| XGBoost | [Diabetes Regression](xgboost-diabetes-regression/train_xgboost_diabetes.ipynb) | Gradient boosting regression |
| LightGBM | [Wine Classification](lightgbm-wine-classification/train_lightgbm_wine.ipynb) | Multi-class classification |
| PyTorch | [MNIST Classification](pytorch-mnist-classification/train_pytorch_mnist.ipynb) | Neural network image classification |
| TensorFlow | [Breast Cancer Classification](tensorflow-breast-cancer-classification/train_tensorflow_breast_cancer.ipynb) | Binary classification |

### Runtime Source Files

| File | Purpose |
|------|---------|
| [`schema_utils.py`](../ml-serve-app/runtime/darwin-serve-runtime/src/utils/schema_utils.py) | Schema extraction utilities |
| [`base_native_loader.py`](../ml-serve-app/runtime/darwin-serve-runtime/src/model/model_loader/native/base_native_loader.py) | Base class for native model loaders |
| [`sklearn_loader.py`](../ml-serve-app/runtime/darwin-serve-runtime/src/model/model_loader/native/sklearn_loader.py) | Scikit-learn loader |
| [`boosting_loader.py`](../ml-serve-app/runtime/darwin-serve-runtime/src/model/model_loader/native/boosting_loader.py) | XGBoost/LightGBM/CatBoost loader |
| [`pytorch_loader.py`](../ml-serve-app/runtime/darwin-serve-runtime/src/model/model_loader/native/pytorch_loader.py) | PyTorch loader |
| [`tensorflow_loader.py`](../ml-serve-app/runtime/darwin-serve-runtime/src/model/model_loader/native/tensorflow_loader.py) | TensorFlow/Keras loader |

### Deploy API Payload Template

```json
{
  "serve_name": "my-model-name",
  "model_uri": "mlflow-artifacts:/{experiment_id}/{run_id}/artifacts/model",
  "env": "local",
  "cores": 2,
  "memory": 4,
  "node_capacity": "spot",
  "min_replicas": 1,
  "max_replicas": 3
}
```

---

## Summary

To ensure your model works with Darwin's one-click deployment:

1. **Always create a signature** - Use `infer_signature()` or `ModelSignature()`
2. **Always use DataFrame for input_example** - This preserves feature names
3. **Name your output columns** - Makes predictions interpretable
4. **Use the standard artifact logging pattern** - Ensures proper MLmodel file structure
5. **Pin framework versions** - Especially TensorFlow (2.15.x with Python 3.10+)

For questions or issues, refer to the example notebooks in this directory or the runtime source files linked above.

