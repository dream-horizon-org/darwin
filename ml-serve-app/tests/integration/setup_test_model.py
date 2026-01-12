#!/usr/bin/env python3
"""
Setup script to log a test model to MLflow for integration tests.
Can be run standalone or imported as a module.
"""

import os
import pickle
import sys
import tempfile
import yaml
import mlflow
from sklearn.datasets import load_iris
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split


def _log_model_to_mlflow(
    model_name: str,
    run_name: str,
    model,
    accuracy: float,
    python_full_version: str,
    conda_python: str,
    verbose: bool,
) -> str | None:
    """
    Log a trained model to MLflow with the shared artifact layout.
    Returns the logged model URI on success, otherwise None.
    """
    try:
        with mlflow.start_run(run_name=run_name) as run:
            mlflow.log_param("n_estimators", 10)
            mlflow.log_metric("accuracy", accuracy)

            with tempfile.TemporaryDirectory() as tmpdir:
                model_dir = os.path.join(tmpdir, "model")
                os.makedirs(model_dir)

                model_path = os.path.join(model_dir, "model.pkl")
                with open(model_path, "wb") as f:
                    pickle.dump(model, f)

                mlmodel_content = {
                    "artifact_path": "model",
                    "flavors": {
                        "python_function": {
                            "model_path": "model.pkl",
                            "loader_module": "mlflow.sklearn",
                            "python_version": python_full_version,
                            "env": "conda.yaml",
                        },
                        "sklearn": {
                            "pickled_model": "model.pkl",
                            "serialization_format": "cloudpickle",
                            "sklearn_version": "1.3.2",
                        },
                    },
                    "model_uuid": run.info.run_id,
                    "utc_time_created": "2025-01-01 00:00:00.000000",
                }

                with open(os.path.join(model_dir, "MLmodel"), "w") as f:
                    yaml.dump(mlmodel_content, f)

                conda_content = {
                    "name": "mlflow-env",
                    "channels": ["defaults"],
                    "dependencies": [
                        f"python={conda_python}",
                        "pip",
                        {"pip": ["scikit-learn==1.3.2", "mlflow"]},
                    ],
                }
                with open(os.path.join(model_dir, "conda.yaml"), "w") as f:
                    yaml.dump(conda_content, f)

                mlflow.log_artifacts(model_dir, "model")

            uri = f"runs:/{run.info.run_id}/model"
            if verbose:
                print(f"✅ Model logged for {model_name}: {uri}")
            return uri
    except Exception as e:
        if verbose:
            print(f"⚠️  Could not log {model_name}: {e}")
        return None



def setup_mlflow_test_models(mlflow_uri: str = None, verbose: bool = True) -> bool:
    """
    Setup MLflow test models for integration tests.
    
    Args:
        mlflow_uri: MLflow tracking URI (defaults to env var or localhost)
        verbose: Whether to print progress messages
        
    Returns:
        True if setup successful, False otherwise
    """
    # Set MLflow tracking URI
    if mlflow_uri is None:
        mlflow_uri = os.environ.get("MLFLOW_URI", "http://localhost/mlflow-lib")
    
    mlflow.set_tracking_uri(mlflow_uri)
    
    if verbose:
        print(f"📊 Using MLflow at: {mlflow_uri}")

    python_full_version = ".".join(str(x) for x in sys.version_info[:3])
    conda_python = f"{sys.version_info.major}.{sys.version_info.minor}"

    try:
        # Load iris dataset
        if verbose:
            print("🌸 Loading iris dataset...")
        iris = load_iris()
        X_train, X_test, y_train, y_test = train_test_split(
            iris.data, iris.target, test_size=0.2, random_state=42
        )

        # Train a simple model
        if verbose:
            print("🤖 Training RandomForest model...")
        model = RandomForestClassifier(n_estimators=10, random_state=42)
        model.fit(X_train, y_train)
        accuracy = model.score(X_test, y_test)
        if verbose:
            print(f"   Accuracy: {accuracy:.2%}")

        # Initialize MLflow client
        client = mlflow.tracking.MlflowClient()

        # Delete existing models to ensure clean state (version will be 1)
        if verbose:
            print("🧹 Cleaning up existing test models...")
        for model_name in ["iris-test", "test-model"]:
            try:
                client.delete_registered_model(model_name)
                if verbose:
                    print(f"   Deleted existing model: {model_name}")
            except Exception:
                if verbose:
                    print(f"   No existing model: {model_name}")

        if verbose:
            print("\n📦 Logging models to MLflow...")
        
        logged_models = {}

        for model_name, run_name in [
            ("iris-test", "iris-test-model"),
            ("test-model", "test-model"),
        ]:
            uri = _log_model_to_mlflow(
                model_name=model_name,
                run_name=run_name,
                model=model,
                accuracy=accuracy,
                python_full_version=python_full_version,
                conda_python=conda_python,
                verbose=verbose,
            )
            if uri:
                logged_models[model_name] = uri

        # Check if at least one model was logged
        if len(logged_models) == 0:
            if verbose:
                print("\n❌ Failed to log any models")
            return False
        
        if verbose:
            print(f"\n✅ Setup complete! {len(logged_models)}/2 MLflow test models logged.")
            print("\n📝 Logged test models:")
            for name, uri in logged_models.items():
                print(f"   - {name}: {uri}")
            print("\n💡 Note: Tests will automatically discover these models.")
            print("\n🧪 You can now run integration tests:")
            print("   ./scripts/test-integration.sh")
        
        return True
        
    except Exception as e:
        if verbose:
            print(f"\n❌ Error: {e}")
        return False


if __name__ == "__main__":
    success = setup_mlflow_test_models(verbose=True)
    sys.exit(0 if success else 1)

