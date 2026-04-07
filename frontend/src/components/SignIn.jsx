import React from 'react';
import { useNavigate } from 'react-router-dom';
import DNAHelix from './DNAHelix';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <div className="relative min-h-screen bg-background overflow-hidden flex items-center justify-center px-4 py-8">
      <DNAHelix />
      <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/80 to-background/90" />
      <div className="relative z-10 w-full max-w-lg">
        <Card className="bg-card/90 backdrop-blur-lg border-border/50 mx-auto px-6 py-8">
          <CardHeader className="text-center">
            <CardTitle className="text-5xl md:text-6xl font-black tracking-tight text-foreground mb-2">
              GenieDose
            </CardTitle>
            <p className="text-sm uppercase tracking-[0.4em] text-primary/80 mb-6">
              Pharmacogenomics Platform
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                onClick={() => handleSignIn('doctor')}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                size="lg"
              >
                Sign in as Doctor
              </Button>
              <Button
                onClick={() => handleSignIn('patient')}
                variant="outline"
                className="w-full border-primary/50 bg-transparent text-white hover:bg-transparent"
                size="lg"
              >
                Sign in as Patient
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignIn;