from functools import wraps
from flask import request, jsonify

from firebase_auth import get_authorized_client_record, register_client_record, is_firebase_available as _is_firebase_available


def require_authorization(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        client_id = request.headers.get("X-Client-ID")
        auth_token = request.headers.get("X-Auth-Token")

        if not client_id or not auth_token:
            return jsonify({"error": "Missing authentication headers."}), 401

        client_record = get_authorized_client_record(client_id)
        if not client_record:
            return jsonify({"error": "Client not registered."}), 401

        if not client_record.get("allowed", False):
            return jsonify({"error": "Client is not authorized."}), 403

        if client_record.get("token") != auth_token:
            return jsonify({"error": "Invalid authentication token."}), 401

        return func(*args, **kwargs)

    return wrapper


def register_client(client_id: str, token: str, allowed: bool = True, metadata=None):
    return register_client_record(client_id, token, allowed=allowed, metadata=metadata)


def is_firebase_available():
    return _is_firebase_available()
