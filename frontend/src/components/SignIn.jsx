import React from 'react';
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
  const navigate = useNavigate();

  const handleSignIn = (role) => {
    // Mock login logic
    console.log(`Signing in as ${role}`);
    if (role === 'doctor') {
      navigate('/doctor-dashboard');
    } else if (role === 'patient') {
      navigate('/patient-dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">GenieDose</h1>
          <p className="text-gray-600">Pharmacogenomics Platform</p>
        </div>
        <div className="space-y-4">
          <button
            onClick={() => handleSignIn('doctor')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 shadow-lg hover:shadow-xl"
          >
            Sign in as Doctor
          </button>
          <button
            onClick={() => handleSignIn('patient')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 shadow-lg hover:shadow-xl"
          >
            Sign in as Patient
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignIn;