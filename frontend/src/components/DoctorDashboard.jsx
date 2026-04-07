import React, { useState, useEffect } from 'react';
import { mockPatients, mockMedicines, mockAIOutput } from '../mockData';

const DoctorDashboard = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedMedicine, setSelectedMedicine] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState(null);
  const [privacyToggle, setPrivacyToggle] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState(mockPatients);

  useEffect(() => {
    setFilteredPatients(
      mockPatients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleGenerateDosage = () => {
    if (!selectedPatient || !selectedMedicine || !file) {
      alert('Please select a patient, medicine, and upload a file.');
      return;
    }
    setIsLoading(true);
    // Mock API call
    setTimeout(() => {
      setAiOutput(mockAIOutput);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-blue-900 text-white p-6">
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
        <div className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-900">Doctor Dashboard</h1>
          <div className="flex items-center space-x-2">
            <span className="text-green-600 animate-pulse">🟢</span>
            <span className="text-sm text-gray-600">Synced with Global GenieDose Model</span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Patient Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Patient</label>
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md mb-2"
            />
            <select
              value={selectedPatient?.id || ''}
              onChange={(e) => setSelectedPatient(mockPatients.find(p => p.id === parseInt(e.target.value)))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Choose a patient</option>
              {filteredPatients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} - {patient.history}
                </option>
              ))}
            </select>
          </div>

          {/* Genomic Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Genomic File (.vcf or .csv)</label>
            <input
              type="file"
              accept=".vcf,.csv"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Prescription Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Medicine</label>
            <select
              value={selectedMedicine}
              onChange={(e) => setSelectedMedicine(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Choose a medicine</option>
              {mockMedicines.map(medicine => (
                <option key={medicine} value={medicine}>{medicine}</option>
              ))}
            </select>
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={privacyToggle}
              onChange={(e) => setPrivacyToggle(e.target.checked)}
              className="rounded"
            />
            <label className="text-sm text-gray-700">Anonymize and contribute to global GenieDose model</label>
          </div>

          {/* Generate Dosage Button */}
          <button
            onClick={handleGenerateDosage}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50"
          >
            {isLoading ? 'Generating...' : 'Generate Dosage'}
          </button>

          {/* AI Output Card */}
          {aiOutput && (
            <div className="bg-white p-6 rounded-lg shadow-lg border border-blue-200">
              <h3 className="text-lg font-bold text-blue-900 mb-4">AI Dosage Recommendation</h3>
              <div className="space-y-4">
                <div>
                  <span className="font-semibold">Recommended Dosage:</span> {aiOutput.dosage}
                </div>
                <div>
                  <span className="font-semibold">Confidence Level:</span>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${aiOutput.confidence}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{aiOutput.confidence}%</span>
                </div>
                <div>
                  <span className="font-semibold">Reasoning:</span>
                  <p className="text-gray-700 mt-1">{aiOutput.reasoning}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;