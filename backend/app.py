import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from models.warfarin import calculate_warfarin_dose
from models.antidepressant import predict_ssri_response
from models.fl_model import fl_model
from auth import require_authorization, register_client, get_authorized_client_record, is_firebase_available
from werkzeug.utils import secure_filename
from vcf_parser import scan_vcf_for_warfarin, scan_vcf_for_antidepressant

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIST = os.path.normpath(os.path.join(BASE_DIR, '..', 'frontend', 'dist'))

app = Flask(__name__, static_folder=FRONTEND_DIST, static_url_path='')
CORS(app)  # This allows your Vite frontend to talk to this API

AUTH_ADMIN_API_KEY = os.environ.get('AUTH_ADMIN_API_KEY')


@app.errorhandler(Exception)
def handle_all_exceptions(error):
    message = str(error)
    status_code = getattr(error, 'code', 500)
    return jsonify({"error": message}), status_code


def extract_genotype_features(genotypes, medicine):
    """Extract numerical features from genotypes for FL model"""
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


UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/upload-vcf', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)
    
    # Run our lightweight scanner
    genotypes = scan_vcf_for_warfarin(filepath)
    
    return jsonify({
        "message": "File analyzed successfully",
        "detected_genotypes": genotypes
    })


@app.route('/verify-client', methods=['GET'])
@require_authorization
def verify_client():
    return jsonify({
        "status": "authorized",
        "client_id": request.headers.get("X-Client-ID")
    })


@app.route('/login', methods=['POST'])
def login():
    payload = request.get_json(silent=True) or {}
    client_id = payload.get("client_id")
    auth_token = payload.get("auth_token")
    role = payload.get("role")

    if not client_id or not auth_token:
        return jsonify({"error": "client_id and auth_token are required."}), 400

    try:
        client_record = get_authorized_client_record(client_id)
    except Exception as exc:
        return jsonify({"error": f"Login failed: {str(exc)}"}), 500

    if not client_record:
        if not is_firebase_available():
            registered = register_client(
                client_id,
                auth_token,
                allowed=True,
                metadata={"auto_registered": True}
            )
            client_record = registered
        else:
            return jsonify({"error": "Client not registered."}), 401

    if not client_record.get("allowed", False):
        return jsonify({"error": "Client is not authorized."}), 403

    if client_record.get("token") != auth_token:
        return jsonify({"error": "Invalid authentication token."}), 401

    return jsonify({"status": "authorized", "client_id": client_id, "role": role}), 200


@app.route('/register-client', methods=['POST'])
def register_client_endpoint():
    if not AUTH_ADMIN_API_KEY:
        return jsonify({"error": "Admin registration is disabled."}), 403

    if request.headers.get("X-Admin-Key") != AUTH_ADMIN_API_KEY:
        return jsonify({"error": "Invalid admin key."}), 401

    payload = request.get_json(silent=True) or {}
    client_id = payload.get("client_id")
    token = payload.get("token")
    allowed = payload.get("allowed", True)
    metadata = payload.get("metadata", {})

    if not client_id or not token:
        return jsonify({"error": "client_id and token are required."}), 400

    registered = register_client(client_id, token, allowed=allowed, metadata=metadata)
    return jsonify({"message": "Client registered.", "client": registered})


@app.route('/update-patient-advice', methods=['POST'])
def update_patient_advice():
    payload = request.get_json(silent=True) or {}
    patient_id = payload.get("patient_id")
    advice = payload.get("advice")

    if not patient_id or advice is None:
        return jsonify({"error": "patient_id and advice are required."}), 400

    # In a real app, update database. For now, use a simple in-memory store or file.
    # Since we have mock data, we'll simulate updating.
    # For persistence, we could use a JSON file or database.
    # Here, we'll just return success for now.
    return jsonify({"message": "Patient advice updated successfully."}), 200


@app.route('/get-patient-advice/<int:patient_id>', methods=['GET'])
def get_patient_advice(patient_id):
    # Mock response; in real app, fetch from database.
    # For now, return a default or stored advice.
    advice = "Please consult your doctor for personalized advice."  # Default
    return jsonify({"advice": advice}), 200


@app.route('/predict-warfarin', methods=['POST'])
def predict():
    data = request.json
    try:
        dose = calculate_warfarin_dose(
            age=data['age'],
            weight=data['weight'],
            height=data['height'],
            vkorc1_genotype=data['vkorc1'],
            cyp2c9_genotype=data['cyp2c9'],
            is_african_american=data.get('is_african_american', False),
            taking_amiodarone=data.get('taking_amiodarone', False)
        )
        return jsonify({"recommended_dose": dose, "unit": "mg/day"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/calculate-dose', methods=['POST'])
def calculate_dose():
    """Combined endpoint: upload VCF, parse genotypes, and calculate dose"""
    try:
        # Get form data
        age = request.form.get('age')
        weight = request.form.get('weight')
        medicine = request.form.get('medicine', 'warfarin')  # Default to warfarin
        use_fl = request.form.get('use_fl', 'false').lower() == 'true'
        
        # Get the VCF file
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Save the file temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        # Parse VCF based on medicine type
        if medicine.lower() == 'antidepressant':
            genotypes = scan_vcf_for_antidepressant(filepath)
        else:
            genotypes = scan_vcf_for_warfarin(filepath)
        
        # Calculate based on medicine type
        if use_fl:
            # Use Federated Learning model
            # Extract features from genotypes (simplified)
            genotype_features = extract_genotype_features(genotypes, medicine)
            fl_result = fl_model.predict_dose(genotype_features, int(age), int(weight))
            
            response_data = {
                "clinical_data": {
                    "age": int(age),
                    "weight": int(weight)
                },
                "detected_genotypes": genotypes,
                "recommended_dose": fl_result["predicted_dose"],
                "confidence": fl_result["confidence"],
                "unit": "mg/day",
                "method": fl_result["method"],
                "warning": "FL model prediction - consult healthcare professional."
            }
        elif medicine.lower() == 'antidepressant':
            # For antidepressants, we need HRSD score (default to 15 if not provided)
            hrsd_score = int(request.form.get('hrsd_score', 15))
            result = predict_ssri_response(genotypes, hrsd_score)
            
            # Calculate confidence for antidepressants
            confidence = 85 if genotypes else 60  # Simplified confidence calculation
            
            response_data = {
                "clinical_data": {
                    "hrsd_score": hrsd_score
                },
                "detected_genotypes": genotypes,
                "recommendation": result["recommendation"],
                "metabolizer_status": result["status"],
                "baseline_severity": result["baseline_severity"],
                "dose_range": result["dose_range"],
                "confidence": confidence,
                "unit": "recommendation",
                "warning": "Please consult a healthcare professional before starting antidepressant therapy."
            }
        else:
            # Warfarin calculation
            # Extract genotypes from the parsed data
            vkorc1 = genotypes.get('vkorc1', '-1639G>A (unknown)')
            cyp2c9 = genotypes.get('cyp2c9', '*1/*1 (unknown)')
            
            # Calculate confidence based on genotype knowledge
            if '(unknown)' not in vkorc1 and '(unknown)' not in cyp2c9:
                confidence = 92  # Both genotypes known
            elif '(unknown)' not in vkorc1 or '(unknown)' not in cyp2c9:
                confidence = 75  # One genotype known
            else:
                confidence = 60  # Both genotypes unknown
            
            # Calculate dose using the warfarin model
            recommended_dose = calculate_warfarin_dose(
                age=int(age),
                weight=int(weight),
                height=170,  # Default height, can be added to form later
                vkorc1_genotype=vkorc1,
                cyp2c9_genotype=cyp2c9,
                is_african_american=False,
                taking_amiodarone=False
            )
            
            response_data = {
                "clinical_data": {
                    "age": int(age),
                    "weight": int(weight)
                },
                "detected_genotypes": {
                    "vkorc1": vkorc1,
                    "cyp2c9": cyp2c9
                },
                "recommended_dose": recommended_dose,
                "confidence": confidence,
                "unit": "mg/day",
                "warning": "Please consult a healthcare professional before using this dose."
            }
        
        return jsonify(response_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    # Serve frontend files if they exist, otherwise return index.html for SPA routing
    if path != '' and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')


if __name__ == '__main__':
    app.run(debug=True, port=5000)