import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from models.warfarin import calculate_warfarin_dose
from werkzeug.utils import secure_filename
from vcf_parser import scan_vcf_for_warfarin

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIST = os.path.normpath(os.path.join(BASE_DIR, '..', 'frontend', 'dist'))

app = Flask(__name__, static_folder=FRONTEND_DIST, static_url_path='')
CORS(app)  # This allows your Vite frontend to talk to this API

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
        # Get age and weight from form data
        age = request.form.get('age')
        weight = request.form.get('weight')
        
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
        
        # Parse VCF to extract genotypes
        genotypes = scan_vcf_for_warfarin(filepath)
        
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
        
        return jsonify({
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
        })
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