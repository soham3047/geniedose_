import math

def calculate_warfarin_dose(age, weight, height, vkorc1_genotype, cyp2c9_genotype, is_african_american, taking_amiodarone):
    # Base constant for the Gage Equation
    # Dose = exp(0.9751 - 0.0110*(age) - 0.4022*(VKORC1 AA) + ...)
    
    # 1. Age factor
    dose_log = 0.9751 - (0.0110 * age)
    
    # 2. Genetics: VKORC1 (G > A)
    # AA = -0.4022, GA = -0.1901, GG = 0
    if vkorc1_genotype == "AA":
        dose_log -= 0.4022
    elif vkorc1_genotype == "GA":
        dose_log -= 0.1901
        
    # 3. Genetics: CYP2C9
    # *1/*2 = -0.1888, *1/*3 = -0.4504, *2/*2 = -0.3691, *2/*3 = -0.6307, *3/*3 = -0.9230
    cyp_map = {
        "*1/*2": -0.1888, "*1/*3": -0.4504, 
        "*2/*2": -0.3691, "*2/*3": -0.6307, "*3/*3": -0.9230
    }
    dose_log += cyp_map.get(cyp2c9_genotype, 0) # Default to 0 for *1/*1
    
    # 4. Clinical factors
    if taking_amiodarone:
        dose_log -= 0.2066
    
    if is_african_american:
        # Note: African American patients often require different coefficients
        # This is a simplified version for the MVP
        dose_log += 0.0769
        
    # The result is the exponent of the log
    daily_dose = math.exp(dose_log)
    return round(daily_dose, 2)

