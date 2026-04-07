import React, { useState, useEffect } from 'react';
import { mockPatients, mockMedicines, mockAIOutput } from '../mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

const DoctorDashboard = () => {
  const [patients, setPatients] = useState(mockPatients);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedMedicine, setSelectedMedicine] = useState('');
  const [file, setFile] = useState(null);
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [hrsdScore, setHrsdScore] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState(null);
  const [privacyToggle, setPrivacyToggle] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState(mockPatients);
  const [addPatientMode, setAddPatientMode] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientHistory, setNewPatientHistory] = useState('');
  const [error, setError] = useState(null);
  const [doctorAdvice, setDoctorAdvice] = useState('');

  useEffect(() => {
    setFilteredPatients(
      patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, patients]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleAddPatient = () => {
    if (newPatientName.trim()) {
      const newPatient = {
        id: Math.max(...patients.map(p => p.id), 0) + 1,
        name: newPatientName,
        history: newPatientHistory || 'New patient',
        geneticData: 'To be determined'
      };
      setPatients([...patients, newPatient]);
      setSelectedPatient(newPatient);
      setNewPatientName('');
      setNewPatientHistory('');
      setAddPatientMode(false);
      setSearchTerm('');
    }
  };

  const handleGenerateDosage = async () => {
    setError(null);
    
    if (!selectedPatient) {
      setError('Please select a patient');
      return;
    }
    if (!selectedMedicine) {
      setError('Please select a medicine');
      return;
    }
    if (!age || !weight) {
      setError('Please enter age and weight');
      return;
    }
    if (selectedMedicine.toLowerCase() === 'antidepressant' && !hrsdScore) {
      setError('Please enter HRSD score for antidepressant prediction');
      return;
    }
    if (!file) {
      setError('Please upload a VCF file');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('age', age);
      formData.append('weight', weight);
      formData.append('medicine', selectedMedicine);
      formData.append('file', file);
      
      if (selectedMedicine.toLowerCase() === 'antidepressant') {
        formData.append('hrsd_score', hrsdScore || '15'); // Default to 15 if not provided
      }

      const response = await fetch('/calculate-dose', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to calculate dose');
      }

      const data = await response.json();
      
      if (selectedMedicine.toLowerCase() === 'antidepressant') {
        setAiOutput({
          dosage: data.dose_range,
          confidence: data.confidence,
          reasoning: `Patient metabolizer status: ${data.metabolizer_status}. Baseline severity: ${data.baseline_severity}. ${data.recommendation} ${data.warning}`,
          clinicalData: data.clinical_data,
          detectedGenotypes: data.detected_genotypes
        });
      } else {
        setAiOutput({
          dosage: `${data.recommended_dose} ${data.unit}`,
          confidence: data.confidence,
          reasoning: `Patient has ${data.detected_genotypes.vkorc1} and ${data.detected_genotypes.cyp2c9}. ${data.warning}`,
          clinicalData: data.clinical_data,
          detectedGenotypes: data.detected_genotypes
        });
      }
    } catch (err) {
      setError(err.message || 'Error calculating dose. Make sure the backend is running and the frontend is served from the same app.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-sidebar-background text-sidebar-foreground p-6">
        <h2 className="text-xl font-bold mb-6">GenieDose</h2>
        <nav className="space-y-4">
          <a href="#" className="block py-2 px-4 rounded hover:bg-blue-800">Dashboard</a>
          <a href="#" className="block py-2 px-4 rounded hover:bg-blue-800">Patients</a>
          <a href="#" className="block py-2 px-4 rounded hover:bg-blue-800">Reports</a>
          <a href="#" className="block py-2 px-4 rounded hover:bg-blue-800">Settings</a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Nav */}
        <div className="bg-card shadow-sm p-4 flex justify-between items-center border-b border-border">
          <h1 className="text-2xl font-bold text-foreground">Doctor Dashboard</h1>
          <div className="flex items-center space-x-2">
            <span className="text-green-400 animate-pulse">🟢</span>
            <span className="text-sm text-muted-foreground">Synced with Global GenieDose Model</span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Patient Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Patient & Search Row */}
              <div className="flex gap-4">
                <Button
                  onClick={() => setAddPatientMode(!addPatientMode)}
                  className="flex-shrink-0 bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {addPatientMode ? 'Cancel' : '+ Add Patient'}
                </Button>
                <Input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-muted text-foreground placeholder:text-muted-foreground border-border"
                />
              </div>

              {/* Add Patient Form */}
              {addPatientMode && (
                <div className="space-y-3 p-4 rounded-lg bg-accent/10 border border-accent/30">
                  <Input
                    type="text"
                    placeholder="Patient Name"
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    className="bg-muted text-foreground placeholder:text-muted-foreground border-border"
                  />
                  <Input
                    type="text"
                    placeholder="Patient History / Condition"
                    value={newPatientHistory}
                    onChange={(e) => setNewPatientHistory(e.target.value)}
                    className="bg-muted text-foreground placeholder:text-muted-foreground border-border"
                  />
                  <Button
                    onClick={handleAddPatient}
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    Save Patient
                  </Button>
                </div>
              )}

              {/* Selected Patient Display */}
              {selectedPatient && (
                <div className="p-3 rounded-lg bg-primary/20 border border-primary/40">
                  <p className="text-sm text-muted-foreground">Currently Selected</p>
                  <p className="text-lg font-bold text-primary">{selectedPatient.name}</p>
                </div>
              )}

              {/* Select Dropdown */}
              <Select
                value={selectedPatient?.id || ''}
                onValueChange={(value) => {
                  const patient = patients.find(p => p.id === parseInt(value));
                  setSelectedPatient(patient);
                  // Load existing doctor's advice for this patient
                  setDoctorAdvice(patient?.doctorAdvice || '');
                }}
              >
                <SelectTrigger className="bg-muted text-foreground border-primary/30">
                  <SelectValue placeholder="Choose a patient" />
                </SelectTrigger>
                <SelectContent className="bg-card border-primary/30">
                  {filteredPatients.map(patient => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>
                      {patient.name} - {patient.history}
                      {patient.doctorAdvice && (
                        <span className="text-xs text-blue-600 ml-2">📝 Has doctor's notes</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Genomic Input */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Genomic File</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="file"
                accept=".vcf,.csv"
                onChange={handleFileChange}
              />
              <p className="text-sm text-muted-foreground mt-2">Accepts .vcf or .csv files</p>
            </CardContent>
          </Card>

          {/* Clinical Data Input */}
          <Card>
            <CardHeader>
              <CardTitle>Clinical Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Age (years)</label>
                  <Input
                    type="number"
                    placeholder="e.g., 45"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="bg-muted text-foreground placeholder:text-muted-foreground border-border"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Weight (kg)</label>
                  <Input
                    type="number"
                    placeholder="e.g., 70"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="bg-muted text-foreground placeholder:text-muted-foreground border-border"
                  />
                </div>
              </div>
              {selectedMedicine.toLowerCase() === 'antidepressant' && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">HRSD Score (0-52)</label>
                  <Input
                    type="number"
                    placeholder="e.g., 18"
                    value={hrsdScore}
                    onChange={(e) => setHrsdScore(e.target.value)}
                    className="bg-muted text-foreground placeholder:text-muted-foreground border-border"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Hamilton Rating Scale for Depression score</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prescription Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Select Medicine</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedMedicine}
                onValueChange={setSelectedMedicine}
              >
                <SelectTrigger className="bg-muted text-foreground border-primary/30">
                  <SelectValue placeholder="Choose a medicine" />
                </SelectTrigger>
                <SelectContent className="bg-card border-primary/30">
                  {mockMedicines.map(medicine => (
                    <SelectItem key={medicine} value={medicine}>
                      {medicine}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Privacy Toggle */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={privacyToggle}
                  onCheckedChange={setPrivacyToggle}
                />
                <label className="text-sm">Anonymize and contribute to global GenieDose model</label>
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="border-destructive/50 bg-destructive/10">
              <CardContent className="pt-6">
                <p className="text-sm text-destructive">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Generate Dosage Button */}
          <Button
            onClick={handleGenerateDosage}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? 'Generating...' : 'Generate Dosage'}
          </Button>

          {/* AI Output Card */}
          {aiOutput && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-foreground">AI Dosage Recommendation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="font-semibold">Recommended Dosage:</span> {aiOutput.dosage}
                </div>
                <div>
                  <span className="font-semibold">Confidence Level:</span>
                  <Progress value={aiOutput.confidence} className="mt-1" />
                  <span className="text-sm text-muted-foreground">{aiOutput.confidence}%</span>
                </div>
                {aiOutput.detectedGenotypes && (
                  <div className="pt-2 border-t border-border">
                    <span className="font-semibold">Detected Genotypes:</span>
                    <div className="mt-2 space-y-1 text-sm">
                      {selectedMedicine.toLowerCase() === 'antidepressant' ? (
                        // For antidepressants, show CYP2D6/CYP2C19 variants
                        Object.entries(aiOutput.detectedGenotypes).map(([rsid, genotype]) => (
                          <p key={rsid} className="text-muted-foreground">
                            <span className="font-medium">{rsid}:</span> {genotype}
                          </p>
                        ))
                      ) : (
                        // For warfarin, show VKORC1 and CYP2C9
                        <>
                          <p className="text-muted-foreground">
                            <span className="font-medium">VKORC1:</span> {aiOutput.detectedGenotypes.vkorc1}
                          </p>
                          <p className="text-muted-foreground">
                            <span className="font-medium">CYP2C9:</span> {aiOutput.detectedGenotypes.cyp2c9}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}
                <div>
                  <span className="font-semibold">Reasoning:</span>
                  <p className="text-muted-foreground mt-1">{aiOutput.reasoning}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Doctor's Advice Section */}
          {aiOutput && (
            <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Doctor's Advice
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2 block">
                    Additional Clinical Notes & Alternative Recommendations
                  </label>
                  <Textarea
                    placeholder="Enter any additional clinical considerations, alternative dosing recommendations, or notes about patient-specific factors (e.g., drug interactions, comorbidities, patient preferences)..."
                    value={doctorAdvice}
                    onChange={(e) => setDoctorAdvice(e.target.value)}
                    className="min-h-[100px] bg-white dark:bg-gray-800 border-blue-300 dark:border-blue-600 text-black dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    rows={4}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button
                      onClick={() => {
                        // Save doctor's advice to patient data
                        if (selectedPatient && doctorAdvice.trim()) {
                          const updatedPatients = patients.map(patient =>
                            patient.id === selectedPatient.id
                              ? { ...patient, doctorAdvice: doctorAdvice.trim() }
                              : patient
                          );
                          setPatients(updatedPatients);
                          setSelectedPatient({ ...selectedPatient, doctorAdvice: doctorAdvice.trim() });
                          alert('Doctor\'s advice saved to patient record!');
                        }
                      }}
                      disabled={!selectedPatient || !doctorAdvice.trim()}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Save to Patient Record
                    </Button>
                    <Button
                      onClick={() => setDoctorAdvice('')}
                      variant="outline"
                      size="sm"
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
                {doctorAdvice.trim() && (
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                    <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-1">Clinical Notes:</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 whitespace-pre-wrap">{doctorAdvice}</p>
                  </div>
                )}
                <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 p-2 rounded">
                  <strong>Note:</strong> This section allows you to document clinical judgment, alternative dosing strategies, or additional considerations not captured by the AI model. Your expertise ensures the best patient care.
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;