def predict_ssri_response(genotypes, hrsd_score):
    """
    genotypes: dict from VCF (e.g., {'rs1061235': '1/1'})
    hrsd_score: total score from the ISPC_phenotype Excel
    """
    # Logic for CYP2D6 (common in antidepressants)
    # 1/1 often indicates a "Poor Metabolizer" depending on the RSID
    metabolizer_status = "Normal"
    if "rs1061235" in genotypes and genotypes["rs1061235"] == "1/1":
        metabolizer_status = "Poor Metabolizer"

    # Clinical Recommendation logic
    if metabolizer_status == "Poor Metabolizer":
        recommendation = "High risk of side effects. Suggest 50% dose reduction."
    elif hrsd_score > 20: # High depression baseline
        recommendation = "Severe symptoms detected. Monitor closely for early response."
    else:
        recommendation = "Standard starting dose recommended."

    return {
        "status": metabolizer_status,
        "recommendation": recommendation,
        "baseline_severity": "High" if hrsd_score > 20 else "Moderate"
    }