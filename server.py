import flwr as fl
import numpy as np
import torch
from flwr.server.strategy import FedProx
from flwr.common import Parameters, ndarrays_to_parameters


class SavingFedProx(FedProx):
    def aggregate_fit(
        self,
        server_round: int,
        results,
        failures,
    ):
        aggregated_parameters, aggregated_metrics = super().aggregate_fit(
            server_round, results, failures
        )
        if aggregated_parameters is not None:
            # Save the aggregated parameters
            np.savez("shared/global_model.npz", *aggregated_parameters.tensors)
            print(f"Global model saved after round {server_round}")
        return aggregated_parameters, aggregated_metrics


def main() -> None:
    """Start a Flower server with the FedProx strategy."""

    # Initial parameters for the model (random weights)
    initial_parameters = [
        np.random.randn(32, 16).astype(np.float32),  # net.0.weight: Linear(16,32) -> (32,16)
        np.zeros(32, dtype=np.float32),  # net.0.bias
        np.random.randn(16, 32).astype(np.float32),  # net.2.weight: Linear(32,16) -> (16,32)
        np.zeros(16, dtype=np.float32),  # net.2.bias
        np.random.randn(1, 16).astype(np.float32),  # net.4.weight: Linear(16,1) -> (1,16)
        np.zeros(1, dtype=np.float32),  # net.4.bias
    ]

    strategy = SavingFedProx(
        fraction_fit=1.0,
        fraction_evaluate=1.0,
        min_fit_clients=3,
        min_evaluate_clients=3,
        min_available_clients=3,
        proximal_mu=0.1,
        initial_parameters=fl.common.ndarrays_to_parameters(initial_parameters),
    )

    print("Starting Flower server on 0.0.0.0:8080 with FedProx strategy (mu=0.1)...")

    config = fl.server.ServerConfig(num_rounds=3)

    fl.server.start_server(
        server_address="0.0.0.0:8080",
        strategy=strategy,
        config=config,
    )


if __name__ == "__main__":
    main()
