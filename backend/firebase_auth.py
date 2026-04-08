import json
import os
from pathlib import Path

try:
    import firebase_admin
    from firebase_admin import credentials, db
    FIREBASE_PYTHON_AVAILABLE = True
except ImportError:
    firebase_admin = None
    credentials = None
    db = None
    FIREBASE_PYTHON_AVAILABLE = False

FIREBASE_ENABLED = False
LOCAL_CLIENTS_FILE = Path(__file__).parent / "authorized_clients.json"


def init_firebase():
    global FIREBASE_ENABLED

    if FIREBASE_ENABLED:
        return True

    if not FIREBASE_PYTHON_AVAILABLE:
        return False

    firebase_db_url = os.environ.get("FIREBASE_DATABASE_URL")
    firebase_cred_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")

    if not firebase_db_url or not firebase_cred_path:
        return False

    try:
        if not firebase_admin._apps:
            cred = credentials.Certificate(firebase_cred_path)
            firebase_admin.initialize_app(cred, {"databaseURL": firebase_db_url})
        FIREBASE_ENABLED = True
        return True
    except Exception:
        return False


def is_firebase_available():
    return init_firebase()


def _load_local_clients():
    if not LOCAL_CLIENTS_FILE.exists():
        return {}

    try:
        with LOCAL_CLIENTS_FILE.open("r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}


def _save_local_clients(clients):
    try:
        with LOCAL_CLIENTS_FILE.open("w", encoding="utf-8") as f:
            json.dump(clients, f, indent=2)
    except Exception:
        pass


def get_authorized_client_record(client_id: str):
    if init_firebase():
        ref = db.reference(f"authorized_clients/{client_id}")
        return ref.get()

    clients = _load_local_clients()
    return clients.get(client_id)


def register_client_record(client_id: str, token: str, allowed: bool = True, metadata=None):
    if init_firebase():
        ref = db.reference(f"authorized_clients/{client_id}")
        ref.set({
            "token": token,
            "allowed": bool(allowed),
            "metadata": metadata or {},
        })
        return ref.get()

    clients = _load_local_clients()
    clients[client_id] = {
        "token": token,
        "allowed": bool(allowed),
        "metadata": metadata or {},
    }
    _save_local_clients(clients)
    return clients[client_id]
