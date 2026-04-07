def scan_vcf_for_warfarin(vcf_path):
    # These are the specific IDs for Warfarin-related mutations
    target_rsids = {
        "rs9923231": "vkorc1",
        "rs1799853": "cyp2c9*2",
        "rs1057910": "cyp2c9*3"
    }
    
    found_genotypes = {"vkorc1": "GG", "cyp2c9": "*1/*1"} # Defaults
    
    # Track if we found any warfarin variants
    found_vkorc1 = False
    found_cyp2c9 = False
    
    try:
        with open(vcf_path, 'r') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#'): 
                    continue # Skip empty lines and headers
                
                columns = line.split('\t')
                
                # Check if we have enough columns (standard VCF has at least 10)
                if len(columns) < 10:
                    continue
                
                try:
                    rsid = columns[2] # Column 3 is the RSID
                    genotype_info = columns[9].split(':')[0] # Column 10 is the genotype
                    
                    if rsid in target_rsids:
                        gene = target_rsids[rsid]
                        # Mapping 0/1 or 1/1 to medical terms
                        if gene == "vkorc1":
                            found_genotypes["vkorc1"] = "AA" if genotype_info == "1/1" else "GA" if genotype_info == "0/1" else "GG"
                            found_vkorc1 = True
                        elif gene == "cyp2c9*2" and (genotype_info == "0/1" or genotype_info == "1/1"):
                            found_genotypes["cyp2c9"] = "*1/*2" if genotype_info == "0/1" else "*2/*2"
                            found_cyp2c9 = True
                        elif gene == "cyp2c9*3" and (genotype_info == "0/1" or genotype_info == "1/1"):
                            found_genotypes["cyp2c9"] = "*1/*3" if genotype_info == "0/1" else "*3/*3"
                            found_cyp2c9 = True
                except (IndexError, ValueError):
                    # Skip malformed lines
                    continue
    except FileNotFoundError:
        return {"error": "VCF file not found"}
    except Exception as e:
        return {"error": f"Error parsing VCF: {str(e)}"}

    # If warfarin variants were not found in the VCF, mark as unknown
    if not found_vkorc1:
        found_genotypes["vkorc1"] = "GG (unknown)"
    if not found_cyp2c9:
        found_genotypes["cyp2c9"] = "*1/*1 (unknown)"

    return found_genotypes

def scan_vcf(vcf_path, target_rsids):
    """
    Generic VCF scanner that finds genotypes for a list of RSIDs.
    Used for Antidepressant mode and other future drug modules.
    """
    found_genotypes = {}
    
    # Standard VCFs like HG00098.vcf are tab-separated
    with open(vcf_path, 'r') as f:
        for line in f:
            # Skip header lines starting with '#'
            if line.startswith('#'):
                continue
            
            columns = line.split('\t')
            
            # In your file, Column 3 (index 2) is the RSID (e.g., rs62224610)
            rsid = columns[2]
            
            # Check if this RSID is one we need for the current mode (e.g., Antidepressant)
            if rsid in target_rsids:
                # Column 10 (index 9) contains the Genotype (GT)
                # Format is usually '0/1:23:56', so we split by ':' to get '0/1'
                genotype_info = columns[9].split(':')[0]
                found_genotypes[rsid] = genotype_info

    return found_genotypes

def scan_vcf_for_antidepressant(vcf_path):
    """
    Scan VCF file for antidepressant-related genetic variants.
    Focuses on CYP2D6 and CYP2C19 genes which affect SSRI metabolism.
    """
    target_rsids = {
        "rs62224610": "cyp2c19",
        "rs113745916": "cyp2d6",
        "rs1061235": "cyp2d6"  # Additional CYP2D6 variant used in model
    }
    
    found_genotypes = {}
    
    try:
        with open(vcf_path, 'r') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#'): 
                    continue
                
                columns = line.split('\t')
                
                if len(columns) < 10:
                    continue
                
                try:
                    rsid = columns[2]
                    genotype_info = columns[9].split(':')[0]
                    
                    if rsid in target_rsids:
                        gene = target_rsids[rsid]
                        found_genotypes[rsid] = genotype_info
                        
                except (IndexError, ValueError):
                    continue
                    
    except FileNotFoundError:
        return {"error": "VCF file not found"}
    except Exception as e:
        return {"error": f"Error parsing VCF: {str(e)}"}
    
    return found_genotypes