import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from models.warfarin import calculate_warfarin_dose
from werkzeug.utils import secure_filename
from vcf_parser import scan_vcf_for_warfarin

app = Flask(__name__)
CORS(app) # This allows your Vite frontend to talk to this API

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

@app.route('/')
def home():
    return "GenieDose Backend is Up and Running!"



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

if __name__ == '__main__':
    app.run(debug=True, port=5000)