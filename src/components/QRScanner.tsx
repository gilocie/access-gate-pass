import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera, X, CheckCircle, AlertCircle } from 'lucide-react';
import QrScanner from 'qr-scanner';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
}

interface TicketData {
  id: string;
  pin_code: string;
  ticket_holder_name: string;
  ticket_holder_email: string;
  selected_benefits: string[];
  is_used: boolean;
  ticket_role: string;
  meal_options: string[];
  accommodation_type: string;
  transport_included: boolean;
}

const QRScanner: React.FC<QRScannerProps> = ({ isOpen, onClose, eventId }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [showTicketDetails, setShowTicketDetails] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      startScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isOpen]);

  const startScanning = async () => {
    if (!videoRef.current) return;

    try {
      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => handleScanResult(result.data),
        {
          onDecodeError: (error) => {
            console.log('QR decode error:', error);
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      await scannerRef.current.start();
      setIsScanning(true);
    } catch (error) {
      console.error('Error starting scanner:', error);
      toast({
        variant: "destructive",
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions."
      });
    }
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleScanResult = async (qrData: string) => {
    stopScanning();
    
    try {
      // Fetch ticket data using QR code
      const { data, error } = await supabase
        .from('event_tickets')
        .select('*')
        .eq('qr_code', qrData)
        .eq('event_id', eventId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({
          variant: "destructive",
          title: "Invalid QR Code",
          description: "This QR code is not valid for this event."
        });
        startScanning(); // Resume scanning
        return;
      }

      setTicketData(data);
      setShowTicketDetails(true);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error scanning ticket",
        description: error.message
      });
      startScanning(); // Resume scanning
    }
  };

  const verifyPin = async () => {
    if (!ticketData || !pinInput) return;

    setIsVerifying(true);

    try {
      if (pinInput !== ticketData.pin_code) {
        toast({
          variant: "destructive",
          title: "Invalid PIN",
          description: "The entered PIN does not match the ticket."
        });
        return;
      }

      toast({
        title: "Ticket Verified",
        description: "PIN verified successfully. Ticket details are now available."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification Error",
        description: error.message
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const updateTicketStatus = async (benefitIndex: number, isActive: boolean) => {
    if (!ticketData) return;

    try {
      const updatedBenefits = [...ticketData.selected_benefits];
      // This is a simplified implementation - you might want to track individual benefit usage
      
      const { error } = await supabase
        .from('event_tickets')
        .update({
          is_used: !isActive, // Simplified: mark ticket as used if deactivating benefits
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketData.id);

      if (error) throw error;

      toast({
        title: isActive ? "Benefit Activated" : "Benefit Deactivated",
        description: `Benefit has been ${isActive ? 'activated' : 'deactivated'} successfully.`
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating ticket",
        description: error.message
      });
    }
  };

  const resetScanner = () => {
    setTicketData(null);
    setPinInput('');
    setShowTicketDetails(false);
    startScanning();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Camera className="w-5 h-5 mr-2" />
            QR Code Scanner
          </DialogTitle>
          <DialogDescription>
            Scan a ticket QR code to verify and manage attendee benefits
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!showTicketDetails ? (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="relative">
                    <video
                      ref={videoRef}
                      className="w-full rounded-lg bg-muted"
                      style={{ maxHeight: '300px' }}
                    />
                    {!isScanning && (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted/80 rounded-lg">
                        <Button onClick={startScanning}>
                          <Camera className="w-4 h-4 mr-2" />
                          Start Scanning
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {!pinInput || pinInput !== ticketData?.pin_code ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">PIN Verification Required</CardTitle>
                    <CardDescription>
                      Enter the 6-digit PIN to access ticket details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="pin">6-Digit PIN</Label>
                      <Input
                        id="pin"
                        type="text"
                        maxLength={6}
                        placeholder="Enter PIN"
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                        className="text-center text-lg font-mono"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={verifyPin} 
                        disabled={pinInput.length !== 6 || isVerifying}
                        className="flex-1"
                      >
                        {isVerifying ? "Verifying..." : "Verify PIN"}
                      </Button>
                      <Button variant="outline" onClick={resetScanner}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2 text-success" />
                      Ticket Verified
                    </CardTitle>
                    <CardDescription>
                      Ticket holder details and available benefits
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Ticket Holder</Label>
                        <p className="text-sm">{ticketData?.ticket_holder_name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Email</Label>
                        <p className="text-sm">{ticketData?.ticket_holder_email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Role</Label>
                        <Badge variant="outline">{ticketData?.ticket_role}</Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <Badge variant={ticketData?.is_used ? "destructive" : "default"}>
                          {ticketData?.is_used ? "Used" : "Active"}
                        </Badge>
                      </div>
                    </div>

                    {ticketData?.selected_benefits && ticketData.selected_benefits.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Benefits Management</Label>
                        <div className="space-y-2">
                          {ticketData.selected_benefits.map((benefit, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded">
                              <span className="text-sm font-medium">{benefit}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateTicketStatus(index, true)}
                              >
                                Mark as Used
                              </Button>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          PIN code is hidden for security. Staff can mark benefits as used without seeing the PIN.
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button onClick={resetScanner} className="flex-1">
                        Scan Another Ticket
                      </Button>
                      <Button variant="outline" onClick={onClose}>
                        Close
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRScanner;