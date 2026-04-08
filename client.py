import os
import socket
import time
import sys

import flwr as fl
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset

# Add backend to path for imports
sys.path.append('./backend')
from vcf_parser import scan_vcf_for_warfarin, scan_vcf_for_antidepressant


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


def load_mock_vcf_genotype_dataset(num_samples: int = 128, input_dim: int = 16):
    """Load a mocked local VCF genotype dataset for training."""
    # Try to load real VCF data first
    vcf_files = [f for f in os.listdir('./backend/uploads') if f.endswith('.vcf')]
    if vcf_files:
        # Use the first VCF file found
        vcf_path = os.path.join('./backend/uploads', vcf_files[0])
        try:
            # Parse VCF (assume warfarin for now)
            genotypes = scan_vcf_for_warfarin(vcf_path)
            # Extract features
            features = extract_genotype_features(genotypes, 'warfarin')
            # Create synthetic dataset with some variation
            rng = np.random.default_rng(seed=42)
            X = rng.normal(size=(num_samples, input_dim)).astype(np.float32)
            # Mix in real features
            for i in range(min(len(features), input_dim)):
                X[:, i] = features[i] + rng.normal(scale=0.1, size=num_samples)
            
            # Mock dosage labels
            weights = rng.normal(size=(input_dim, 1)).astype(np.float32)
            y = X @ weights + rng.normal(scale=0.25, size=(num_samples, 1)).astype(np.float32)
            y = y.reshape(-1, 1)
            print(f"Loaded real VCF data from {vcf_path}")
            return X, y
        except Exception as e:
            print(f"Error loading VCF: {e}, falling back to mock data")
    
    # Fallback to mock data
    rng = np.random.default_rng(seed=42)
    X = rng.normal(size=(num_samples, input_dim)).astype(np.float32)

    # Mock dosage labels: a simple linear combination with noise.
    weights = rng.normal(size=(input_dim, 1)).astype(np.float32)
    y = X @ weights + rng.normal(scale=0.25, size=(num_samples, 1)).astype(np.float32)
    y = y.reshape(-1, 1)
    return X, y


def extract_genotype_features(genotypes, medicine):
    """Extract numerical features from genotypes"""
    features = []
    
    if medicine.lower() == 'antidepressant':
        # CYP2D6 and CYP2C19 variants
        rsids = ['rs1061235', 'rs113745916', 'rs62224610']
        for rsid in rsids:
            gt = genotypes.get(rsid, '0/0')
            if gt in ['1/1', '1|1']:
                features.append(2.0)
            elif gt in ['0/1', '1/0', '0|1', '1|0']:
                features.append(1.0)
            else:
                features.append(0.0)
    else:  # warfarin
        # VKORC1 and CYP2C9
        vkorc1 = genotypes.get('vkorc1', '-1639G>A (unknown)')
        cyp2c9 = genotypes.get('cyp2c9', '*1/*1 (unknown)')
        
        # VKORC1 encoding
        if 'AA' in vkorc1:
            features.append(2.0)
        elif 'GA' in vkorc1:
            features.append(1.0)
        else:
            features.append(0.0)
            
        # CYP2C9 encoding (simplified)
        if '*3/*3' in cyp2c9 or '*2/*3' in cyp2c9:
            features.append(2.0)
        elif '*1/*2' in cyp2c9 or '*1/*3' in cyp2c9:
            features.append(1.0)
        else:
            features.append(0.0)
    
    # Pad to 16 features with zeros
    while len(features) < 16:
        features.append(0.0)
    
    return features[:16]


def create_data_loaders(batch_size: int = 16):
    X, y = load_mock_vcf_genotype_dataset()
    dataset = TensorDataset(torch.from_numpy(X), torch.from_numpy(y))
    train_size = int(len(dataset) * 0.8)
    train_dataset, val_dataset = torch.utils.data.random_split(dataset, [train_size, len(dataset) - train_size])
    return (
        DataLoader(train_dataset, batch_size=batch_size, shuffle=True),
        DataLoader(val_dataset, batch_size=batch_size),
    )


def get_model_parameters(model: nn.Module):
    return [val.cpu().numpy() for val in model.state_dict().values()]


def set_model_parameters(model: nn.Module, parameters):
    state_dict = {k: torch.tensor(v) for k, v in zip(model.state_dict().keys(), parameters)}
    model.load_state_dict(state_dict, strict=True)


def train(model: nn.Module, train_loader: DataLoader, epochs: int = 2, lr: float = 0.01):
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=lr)

    model.train()
    for _ in range(epochs):
        for X_batch, y_batch in train_loader:
            optimizer.zero_grad()
            predictions = model(X_batch)
            loss = criterion(predictions, y_batch)
            loss.backward()
            optimizer.step()

    return model


def evaluate(model: nn.Module, val_loader: DataLoader):
    criterion = nn.MSELoss()
    model.eval()

    loss_sum = 0.0
    num_samples = 0
    with torch.no_grad():
        for X_batch, y_batch in val_loader:
            predictions = model(X_batch)
            loss = criterion(predictions, y_batch)
            loss_sum += loss.item() * len(X_batch)
            num_samples += len(X_batch)

    return float(loss_sum / num_samples if num_samples else 0.0)


class VCFClient(fl.client.NumPyClient):
    def __init__(self, model: nn.Module, train_loader: DataLoader, val_loader: DataLoader):
        self.model = model
        self.train_loader = train_loader
        self.val_loader = val_loader

    def get_parameters(self):
        return get_model_parameters(self.model)

    def fit(self, parameters, config):
        set_model_parameters(self.model, parameters)
        self.model = train(self.model, self.train_loader, epochs=int(config.get("epochs", 2)))
        return get_model_parameters(self.model), len(self.train_loader.dataset), {}

    def evaluate(self, parameters, config):
        set_model_parameters(self.model, parameters)
        loss = evaluate(self.model, self.val_loader)
        return float(loss), len(self.val_loader.dataset), {"mse": float(loss)}


def wait_for_server(host: str, port: int, timeout: int = 60):
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            with socket.create_connection((host, port), timeout=5):
                print(f"Connected to server at {host}:{port}")
                return
        except OSError:
            print(f"Waiting for server at {host}:{port}...")
            time.sleep(3)
    raise ConnectionError(f"Unable to connect to server at {host}:{port} after {timeout} seconds")


if __name__ == "__main__":
    server_address = os.getenv("SERVER_ADDRESS", "server:8080")
    client_id = os.getenv("CLIENT_ID", "client")

    server_host, server_port_str = server_address.split(":")
    server_port = int(server_port_str)

    print(f"Starting Flower NumPy client {client_id} connecting to {server_address}")
    wait_for_server(server_host, server_port, timeout=120)

    model = DoseNet()
    train_loader, val_loader = create_data_loaders()
    client = VCFClient(model=model, train_loader=train_loader, val_loader=val_loader)

    fl.client.start_numpy_client(server_address=server_address, client=client)
