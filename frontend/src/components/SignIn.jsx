import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DNAHelix from './DNAHelix';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const SignIn = () => {
  const navigate = useNavigate();

  const [clientId, setClientId] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async (role) => {
    setAuthError('');

    if (!clientId || !authToken) {
      setAuthError('Please enter both client ID and auth token.');
      return;
    }

    setIsSigningIn(true);

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: clientId,
          auth_token: authToken,
          role
        })
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text || 'Login failed: invalid response from server');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      navigate(role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard');
    } catch (err) {
      setAuthError(err.message || 'Login failed.');
    } finally {
      setIsSigningIn(false);
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
              <div className="space-y-3">
                <Input
                  type="text"
                  placeholder="Client ID"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="bg-muted text-foreground placeholder:text-muted-foreground border-border"
                />
                <Input
                  type="password"
                  placeholder="Auth Token"
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  className="bg-muted text-foreground placeholder:text-muted-foreground border-border"
                />
              </div>

              {authError && (
                <div className="text-sm text-destructive">{authError}</div>
              )}

              <Button
                onClick={() => handleSignIn('doctor')}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                size="lg"
                disabled={isSigningIn}
              >
                {isSigningIn ? 'Signing in…' : 'Sign in as Doctor'}
              </Button>
              <Button
                onClick={() => handleSignIn('patient')}
                variant="outline"
                className="w-full border-primary/50 bg-transparent text-white hover:bg-transparent"
                size="lg"
                disabled={isSigningIn}
              >
                {isSigningIn ? 'Signing in…' : 'Sign in as Patient'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignIn;