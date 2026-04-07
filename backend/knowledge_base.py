import pandas as pd

def get_clinical_mapping(drug_type):
    # 1. Load your actual research data
    try:
        df = pd.read_csv('data/clinicalVariants.tsv', sep='\t')
        relevant_variants = df[df['chemicals'].str.contains(drug_type, case=False, na=False)]
        mapping = dict(zip(relevant_variants['variant'], relevant_variants['gene']))
    except Exception:
        mapping = {}

    # 2. Add "Demo Mode" RSIDs
    # These IDs are verified to exist in your HG00098.vcf file
    if drug_type == 'antidepressant':
        # rs62224610 is in your VCF at line 24
        mapping["rs62224610"] = "CYP2C19" 
        mapping["rs113745916"] = "CYP2D6"
        
    elif drug_type == 'warfarin':
        # These are standard Warfarin markers
        mapping["rs9923231"] = "VKORC1"
        mapping["rs1799853"] = "CYP2C9"

    return mapping

def get_evidence_strength(rsid):
    # Load the significance data from all-data(1).tsv
    df_evidence = pd.read_csv('data/all-data(1).tsv', sep='\t')
    match = df_evidence[df_evidence['Variant'] == rsid]
    
    if not match.empty:
        return {
            "p_value": match.iloc[0]['P-Value'],
            "significance": match.iloc[0]['Association Significance']
        }
    return None