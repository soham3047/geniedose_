def scan_vcf_for_warfarin(vcf_path):
    # These are the specific IDs for Warfarin-related mutations
    target_rsids = {
        "rs9923231": "vkorc1",
        "rs1799853": "cyp2c9*2",
        "rs1057910": "cyp2c9*3"
    }
    
    found_genotypes = {"vkorc1": "GG", "cyp2c9": "*1/*1"} # Defaults
    
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
                        elif gene == "cyp2c9*2" and (genotype_info == "0/1" or genotype_info == "1/1"):
                            found_genotypes["cyp2c9"] = "*1/*2" if genotype_info == "0/1" else "*2/*2"
                        elif gene == "cyp2c9*3" and (genotype_info == "0/1" or genotype_info == "1/1"):
                            found_genotypes["cyp2c9"] = "*1/*3" if genotype_info == "0/1" else "*3/*3"
                except (IndexError, ValueError):
                    # Skip malformed lines
                    continue
    except FileNotFoundError:
        return {"error": "VCF file not found"}
    except Exception as e:
        return {"error": f"Error parsing VCF: {str(e)}"}

    return found_genotypes