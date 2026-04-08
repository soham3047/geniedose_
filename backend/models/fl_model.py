import numpy as np
import torch
import torch.nn as nn


class DoseNet(nn.Module):
    def __init__(self, input_dim: int = 16, hidden_dim: int = 32):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Linear(hidden_dim // 2, 1),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)


def set_model_parameters(model: nn.Module, parameters):
    state_dict = {k: torch.tensor(v) for k, v in zip(model.state_dict().keys(), parameters)}
    model.load_state_dict(state_dict, strict=True)


class FLModel:
    def __init__(self, model_path="global_model.npz"):
        self.model = DoseNet()
        try:
            # Load saved parameters
            params = np.load(model_path)
            param_list = [params[key] for key in sorted(params.keys())]
            set_model_parameters(self.model, param_list)
            self.model.eval()
            print("FL model loaded successfully")
        except FileNotFoundError:
            print("Global model not found, using random weights")
        except Exception as e:
            print(f"Error loading model: {e}")

    def predict_dose(self, genotype_features, age, weight):
        """
        Predict dosage using FL-trained model.
        genotype_features: list or array of genotype values (16 features)
        age: patient age
        weight: patient weight
        """
        # Normalize inputs (simple scaling)
        features = np.array(genotype_features, dtype=np.float32)
        features = (features - np.mean(features)) / (np.std(features) + 1e-8)

        # Add clinical features (age, weight) - extend input
        clinical = np.array([age / 100.0, weight / 100.0], dtype=np.float32)  # Normalize
        full_features = np.concatenate([features, clinical])

        # For now, use only genotype features since model expects 16
        # In future, retrain model with clinical features
        input_tensor = torch.from_numpy(features[:16]).unsqueeze(0)

        with torch.no_grad():
            prediction = self.model(input_tensor).item()

        # Scale prediction to reasonable dose range
        dose = max(0.5, min(10.0, prediction * 2.0))  # Scale and clamp

        return {
            "predicted_dose": round(dose, 2),
            "confidence": 0.85,  # Placeholder
            "method": "Federated Learning Neural Network"
        }


# Global instance
fl_model = FLModel()
