import math

def calculate_warfarin_dose(age, weight, height, vkorc1_genotype, cyp2c9_genotype, is_african_american, taking_amiodarone):
    """
    Enhanced Gage et al. pharmacogenetic algorithm for warfarin dosing
    Based on: Gage BF et al. Genetics and clinical response to warfarin. NEJM 2008
    """

    # Base dose calculation using Gage equation
    # Dose = exp(0.9751 - 0.0110*age - 0.4022*VKORC1_AA + ...)

    # 1. Age factor (years)
    dose_log = 0.9751 - (0.0110 * age)

    # 2. Weight factor (kg) - not in original Gage but improves accuracy
    if weight < 60:
        dose_log -= 0.1  # Lower dose for low weight
    elif weight > 120:
        dose_log += 0.1  # Higher dose for high weight

    # 3. VKORC1 genotype (rs9923231: G>A)
    # AA (homozygous variant) = -0.4022
    # GA (heterozygous) = -0.1901
    # GG (wild type) = 0
    if vkorc1_genotype == "AA":
        dose_log -= 0.4022
    elif vkorc1_genotype == "GA":
        dose_log -= 0.1901
    # GG = 0 (no change)

    # 4. CYP2C9 genotype
    # *1/*1 (wild type) = 0
    # *1/*2 = -0.1888, *1/*3 = -0.4504
    # *2/*2 = -0.3691, *2/*3 = -0.6307, *3/*3 = -0.9230
    cyp_map = {
        "*1/*1": 0,        # Wild type
        "*1/*2": -0.1888,  # Heterozygous *2
        "*1/*3": -0.4504,  # Heterozygous *3
        "*2/*2": -0.3691,  # Homozygous *2
        "*2/*3": -0.6307,  # Compound heterozygous
        "*3/*3": -0.9230   # Homozygous *3
    }
    dose_log += cyp_map.get(cyp2c9_genotype, 0)

    # 5. Clinical factors
    if taking_amiodarone:
        dose_log -= 0.2066  # Reduces warfarin metabolism

    if is_african_american:
        # African Americans may require higher doses due to different VKORC1 distribution
        dose_log += 0.0769

    # 6. Height adjustment (optional, not in original Gage)
    # Taller patients may need slightly higher doses
    if height > 180:  # cm
        dose_log += 0.05
    elif height < 160:
        dose_log -= 0.05

    # Calculate final dose
    daily_dose = math.exp(dose_log)

    # Apply reasonable bounds (clinical safety)
    daily_dose = max(0.5, min(15.0, daily_dose))  # Between 0.5-15 mg/day

    return round(daily_dose, 2)

