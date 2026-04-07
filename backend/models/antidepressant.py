def predict_ssri_response(genotypes, hrsd_score):
    """
    genotypes: dict from VCF (e.g., {'rs1061235': '1/1'})
    hrsd_score: total score from the ISPC_phenotype Excel
    """
    # Determine metabolizer status based on CYP2D6 and CYP2C19 variants
    metabolizer_status = "Normal"
    dose_adjustment = "standard"

    # Check CYP2D6 variants (rs1061235, rs113745916)
    cyp2d6_poor = any(
        genotypes.get(rsid) in ["1/1", "1|1"] for rsid in ["rs1061235", "rs113745916"]
    )
    cyp2c19_poor = genotypes.get("rs62224610") in ["1/1", "1|1"]

    if cyp2d6_poor or cyp2c19_poor:
        metabolizer_status = "Poor Metabolizer"
        dose_adjustment = "reduce_50"
    elif genotypes.get("rs62224610") in ["0/0", "0|0"]:
        metabolizer_status = "Ultra-rapid Metabolizer"
        dose_adjustment = "increase_50"

    # Clinical Recommendation logic with dose guidance
    if metabolizer_status == "Poor Metabolizer":
        recommendation = "High risk of side effects. Start with 50% reduced dose (e.g., 5-10 mg/day for most SSRIs)."
        dose_range = "5-10 mg/day"
    elif metabolizer_status == "Ultra-rapid Metabolizer":
        recommendation = "May require higher doses for therapeutic effect. Consider 50% dose increase if no response."
        dose_range = "20-40 mg/day"
    elif hrsd_score > 20: # High depression baseline
        recommendation = "Severe symptoms detected. Start with standard dose and monitor closely for early response."
        dose_range = "10-20 mg/day"
    else:
        recommendation = "Standard starting dose recommended for most SSRIs."
        dose_range = "10-20 mg/day"

    return {
        "status": metabolizer_status,
        "recommendation": recommendation,
        "baseline_severity": "High" if hrsd_score > 20 else "Moderate",
        "dose_range": dose_range,
        "dose_adjustment": dose_adjustment
    }