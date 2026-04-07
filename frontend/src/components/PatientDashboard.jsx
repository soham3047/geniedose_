import React, { useState } from 'react';
import { mockGeneticTranslations, mockPrivacyLogs } from '../mockData';

const PatientDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sideEffect, setSideEffect] = useState('');
  const [loggedEffects, setLoggedEffects] = useState([]);

  const patientId = 1; // Mock patient ID

  const handleLogSideEffect = () => {
    if (sideEffect.trim()) {
      setLoggedEffects([...loggedEffects, { id: Date.now(), text: sideEffect, date: new Date().toLocaleDateString() }]);
      setSideEffect('');
      setIsModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-900">GenieDose</h1>
          <p className="text-gray-600">Patient Portal</p>
        </div>

        {/* Digital ID */}
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">Digital ID</h2>
          <img
            src="https://via.placeholder.com/150?text=QR+Code"
            alt="QR Code"
            className="mx-auto mb-2"
          />
          <p className="text-sm text-gray-600">Scan to grant Doctor access</p>
        </div>

        {/* Genomic Translation Card */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">Genomic Translation</h2>
          <p className="text-gray-700">{mockGeneticTranslations[patientId]}</p>
        </div>

        {/* Adverse Reaction Logger */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">Adverse Reaction Logger</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-300"
          >
            Report Side Effects
          </button>
          {loggedEffects.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="font-semibold text-gray-800">Recent Reports:</h3>
              {loggedEffects.map(effect => (
                <div key={effect.id} className="bg-gray-100 p-2 rounded">
                  <p className="text-sm">{effect.text}</p>
                  <p className="text-xs text-gray-500">{effect.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Data Privacy Center */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">Data Privacy Center</h2>
          <p className="text-sm text-gray-600 mb-4">Federated nodes that utilized your anonymized data (last 30 days):</p>
          <div className="space-y-2">
            {mockPrivacyLogs.map((log, index) => (
              <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <div>
                  <p className="font-semibold text-sm">{log.node}</p>
                  <p className="text-xs text-gray-500">{log.purpose}</p>
                </div>
                <span className="text-xs text-gray-500">{log.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Report Side Effect</h3>
            <textarea
              value={sideEffect}
              onChange={(e) => setSideEffect(e.target.value)}
              placeholder="Describe the side effect..."
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
              rows="4"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleLogSideEffect}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
              >
                Log
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;