import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

# Import your model logic
from models.warfarin import calculate_warfarin_dose
from models.antidepressant import predict_ssri_response
from knowledge_base import get_clinical_mapping
# Ensure vcf_parser.py has both of these functions defined
from vcf_parser import scan_vcf_for_warfarin, scan_vcf 

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Helper function to save files safely
def save_file(file):
    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)
    return file_path

# --- KEEPING YOUR EXISTING ROUTES ---

@app.route('/')
def home():
    return "GenieDose Backend is Up and Running!"

@app.route('/upload-vcf', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    filepath = save_file(file)
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

# --- UPDATED MULTI-PARAMETER ROUTE ---

@app.route('/calculate', methods=['POST'])
def handle_request():
    try:
        mode = request.form.get('mode')
        file = request.files.get('file')
        
        if not file:
            return jsonify({"error": "No file uploaded"}), 400

        # 1. Save and Parse VCF using your .tsv mapping logic
        filepath = save_file(file)
        target_rsids = get_clinical_mapping(mode)
        found_genotypes = scan_vcf(filepath, target_rsids.keys()) #
        
        # 2. Route Logic based on Mode
        if mode == 'antidepressant':
            # Uses HRSD score from your ISPC Phenotype data
            hrsd = int(request.form.get('hrsd', 0))
            result = predict_ssri_response(found_genotypes, hrsd)
            
        elif mode == 'warfarin':
            # Dynamic parsing for Warfarin mode
            age = int(request.form.get('age', 50))
            weight = float(request.form.get('weight', 70))
            height = float(request.form.get('height', 170))
            
            # Map VCF results to genotypes expected by the warfarin model
            result = calculate_warfarin_dose(
                age=age, weight=weight, height=height,
                vkorc1_genotype=found_genotypes.get('rs9923231', 'GG'),
                cyp2c9_genotype=found_genotypes.get('rs1799853', '*1/*1')
            )
        else:
            return jsonify({"error": "Invalid mode"}), 400
            
        return jsonify({
            "mode": mode,
            "genotypes_detected": found_genotypes,
            "clinical_report": result
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)