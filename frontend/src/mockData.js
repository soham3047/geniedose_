// mockData.js
export const mockPatients = [
  {
    id: 1,
    name: "John Doe",
    history: "Hypertension, recent cardiac event",
    geneticData: "CYP2C9 *1/*3, VKORC1 -1639G>A",
  },
  {
    id: 2,
    name: "Jane Smith",
    history: "Diabetes, kidney issues",
    geneticData: "CYP2D6 *4/*4, SLCO1B1 *5/*15",
  },
  {
    id: 3,
    name: "Alice Johnson",
    history: "Cancer treatment",
    geneticData: "TPMT *1/*3C, DPYD *2A/*2A",
  },
];

export const mockGeneticTranslations = {
  1: "Your liver processes blood thinners slower than average. Your doctors have been alerted to prescribe lower doses.",
  2: "You may need adjusted doses for certain antidepressants due to slower metabolism.",
  3: "Your body breaks down chemotherapy drugs differently. Dosage adjustments have been made.",
};

export const mockPrivacyLogs = [
  {
    node: "Hospital A",
    date: "2023-10-01",
    purpose: "Cardiovascular model training",
  },
  {
    node: "Oncology Research Node",
    date: "2023-10-15",
    purpose: "Cancer treatment optimization",
  },
  {
    node: "Pharma Lab B",
    date: "2023-10-20",
    purpose: "Drug interaction studies",
  },
];

export const mockMedicines = [
  "Warfarin",
  "Clopidogrel",
  "5-Fluorouracil",
  "Codeine",
  "Tamoxifen",
  "Antidepressant",
];

export const mockAIOutput = {
  dosage: "15mg Weekly",
  confidence: 94,
  reasoning: "Patient possesses CYP2C9 *3 allele, indicating poor metabolism. VKORC1 variant suggests sensitivity to warfarin. Recommended lower dose to prevent bleeding complications.",
};