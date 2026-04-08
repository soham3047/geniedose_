import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import QRCode from 'qrcode';
import { mockGeneticTranslations, mockPrivacyLogs } from '../mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';

const PatientDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sideEffect, setSideEffect] = useState('');
  const [loggedEffects, setLoggedEffects] = useState([]);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [doctorAdvice, setDoctorAdvice] = useState('');

  const patientId = 1; // Mock patient ID
  const qrValue = `geniedose://patient/${patientId}`;

  useEffect(() => {
    const generateQr = async () => {
      try {
        const url = await QRCode.toDataURL(qrValue, {
          errorCorrectionLevel: 'H',
          margin: 2,
          width: 240,
          color: {
            dark: '#ffffff',
            light: '#0f172a'
          }
        });
        setQrCodeUrl(url);
      } catch (error) {
        setQrCodeUrl('');
      }
    };

    const fetchAdvice = async () => {
      try {
        const response = await fetch(`/get-patient-advice/${patientId}`);
        if (response.ok) {
          const data = await response.json();
          setDoctorAdvice(data.advice);
        }
      } catch (error) {
        console.error('Error fetching advice:', error);
      }
    };

    generateQr();
    fetchAdvice();
  }, [qrValue, patientId]);

  const handleLogSideEffect = () => {
    if (sideEffect.trim()) {
      setLoggedEffects([...loggedEffects, { id: Date.now(), text: sideEffect, date: new Date().toLocaleDateString() }]);
      setSideEffect('');
      setIsModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Nav */}
        <div className="bg-card shadow-sm p-4 flex justify-between items-center border-b border-border">
          <h1 className="text-2xl font-bold text-foreground">Patient Dashboard</h1>
          <div className="flex items-center space-x-2">
            <span className="text-green-400 animate-pulse">🟢</span>
            <span className="text-sm text-muted-foreground">Connected to GenieDose Network</span>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Digital ID */}
              <Card>
                <CardHeader>
                  <CardTitle>Digital ID</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  {qrCodeUrl ? (
                    <img
                      src={qrCodeUrl}
                      alt={`Patient ${patientId} QR Code`}
                      className="mx-auto mb-2 rounded-lg border border-white/10 shadow-xl"
                    />
                  ) : (
                    <div className="mx-auto mb-2 h-48 w-48 rounded-lg bg-muted flex items-center justify-center text-sm text-muted-foreground">
                      Generating QR...
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">Scan this QR Code to grant Doctor access.</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">Patient ID: {patientId}</p>
                </CardContent>
              </Card>

              {/* Doctor's Advice */}
              <Card>
                <CardHeader>
                  <CardTitle>Doctor's Advice</CardTitle>
                </CardHeader>
                <CardContent>
                  {doctorAdvice ? (
                    <p className="text-sm text-foreground whitespace-pre-wrap">{doctorAdvice}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">No advice from doctor yet.</p>
                  )}
                </CardContent>
              </Card>

              {/* Genomic Translation Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Genomic Translation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{mockGeneticTranslations[patientId]}</p>
                </CardContent>
              </Card>

              {/* Adverse Reaction Logger */}
              <Card>
                <CardHeader>
                  <CardTitle>Adverse Reaction Logger</CardTitle>
                </CardHeader>
                <CardContent>
                  <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        Report Side Effects
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Report Side Effect</DialogTitle>
                      </DialogHeader>
                      <Textarea
                        value={sideEffect}
                        onChange={(e) => setSideEffect(e.target.value)}
                        placeholder="Describe the side effect..."
                        rows={4}
                      />
                      <DialogFooter>
                        <Button onClick={handleLogSideEffect}>Log</Button>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  {loggedEffects.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h3 className="font-semibold">Recent Reports:</h3>
                      {loggedEffects.map(effect => (
                        <div key={effect.id} className="bg-muted p-2 rounded">
                          <p className="text-sm">{effect.text}</p>
                          <p className="text-xs text-muted-foreground">{effect.date}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Data Privacy Center */}
              <Card>
                <CardHeader>
                  <CardTitle>Data Privacy Center</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">Federated nodes that utilized your anonymized data (last 30 days):</p>
                  <div className="space-y-2">
                    {mockPrivacyLogs.map((log, index) => (
                      <div key={index} className="flex justify-between items-center bg-muted p-2 rounded">
                        <div>
                          <p className="font-semibold text-sm">{log.node}</p>
                          <p className="text-xs text-muted-foreground">{log.purpose}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{log.date}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;