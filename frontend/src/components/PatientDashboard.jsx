import React, { useState } from 'react';
import { mockGeneticTranslations, mockPrivacyLogs } from '../mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';

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
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">GenieDose</h1>
          <p className="text-muted-foreground">Patient Portal</p>
        </div>

        {/* Digital ID */}
        <Card className="text-center">
          <CardHeader>
            <CardTitle>Digital ID</CardTitle>
          </CardHeader>
          <CardContent>
            <img
              src="https://via.placeholder.com/150?text=QR+Code"
              alt="QR Code"
              className="mx-auto mb-2"
            />
            <p className="text-sm text-muted-foreground">Scan to grant Doctor access</p>
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
  );
};

export default PatientDashboard;