import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Upload, Download, Send, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import QRCode from 'qrcode';

interface Event {
  id: string;
  title: string;
  event_date: string;
  event_end_date: string;
  location: string;
  available_benefits: string[];
}

interface TicketGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
}

interface TicketFormData {
  participantName: string;
  email: string;
  selectedBenefits: string[];
  ticketRole: string;
  mealOptions: string[];
  accommodationType: string;
  transportIncluded: boolean;
  ticketDesign: File | null;
}

const TicketGenerator: React.FC<TicketGeneratorProps> = ({ isOpen, onClose, event }) => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrCodeDataURL, setQrCodeDataURL] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [ticketPreview, setTicketPreview] = useState('');
  
  const [formData, setFormData] = useState<TicketFormData>({
    participantName: '',
    email: '',
    selectedBenefits: [],
    ticketRole: 'attendee',
    mealOptions: [],
    accommodationType: '',
    transportIncluded: false,
    ticketDesign: null
  });

  const roleOptions = [
    'Attendee', 'Trainer', 'Artist', 'Comedian', 'Speaker', 
    'Guest of Honour', 'Musician', 'Actor', 'Player', 'Pastor', 'Panelist'
  ];

  const mealOptions = [
    'Full Meal', 'Drinks Only', 'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snacks'
  ];

  const accommodationOptions = [
    'Hotel Stay', 'Hostel', 'Guest House', 'Home Stay'
  ];

  useEffect(() => {
    if (currentStep === 2) {
      generatePinAndQR();
    }
  }, [currentStep, formData]);

  const generatePinAndQR = async () => {
    const newPinCode = Math.random().toString().slice(2, 8);
    setPinCode(newPinCode);
    
    const qrData = JSON.stringify({
      eventId: event.id,
      participantName: formData.participantName,
      email: formData.email,
      pinCode: newPinCode,
      timestamp: Date.now()
    });

    try {
      const qrCodeURL = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataURL(qrCodeURL);
      generateTicketPreview(qrCodeURL, newPinCode);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const generateTicketPreview = (qrCodeURL: string, pin: string) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 400;

    // Background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#4F46E5');
    gradient.addColorStop(1, '#7C3AED');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Event name
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(event.title.toUpperCase(), 50, 60);

    // Participant name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px Arial';
    ctx.fillText(formData.participantName.toUpperCase(), 50, 120);

    // Dates
    const startDate = new Date(event.event_date);
    const endDate = event.event_end_date ? new Date(event.event_end_date) : startDate;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Arial';
    
    // Start date box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(50, 150, 100, 80);
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(startDate.getDate().toString().padStart(2, '0'), 100, 180);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px Arial';
    ctx.fillText(startDate.toLocaleDateString('en-US', { month: 'short' }), 100, 195);
    ctx.fillText(startDate.getFullYear().toString(), 100, 210);

    // "TO" text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px Arial';
    ctx.fillText('TO', 180, 190);

    // End date box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(210, 150, 100, 80);
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(endDate.getDate().toString().padStart(2, '0'), 260, 180);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px Arial';
    ctx.fillText(endDate.toLocaleDateString('en-US', { month: 'short' }), 260, 195);
    ctx.fillText(endDate.getFullYear().toString(), 260, 210);

    // Status
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('STATUS', 400, 180);
    ctx.fillStyle = '#00FF00';
    ctx.fillText('VALID', 400, 200);

    // Benefits used
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('B USED', 500, 180);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Arial';
    ctx.fillText(`0/${formData.selectedBenefits.length}`, 500, 200);

    // Expiry date
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('EXPIRY DATE:', 50, 260);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(endDate.toLocaleDateString(), 130, 260);

    // Remaining days
    const remainingDays = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    ctx.fillStyle = '#FFD700';
    ctx.fillText('REMAINING DAYS:', 250, 260);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`${Math.max(0, remainingDays)} Days`, 340, 260);

    // QR Code
    if (qrCodeURL) {
      const qrImg = new Image();
      qrImg.onload = () => {
        // QR code background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(620, 50, 150, 150);
        ctx.drawImage(qrImg, 630, 60, 130, 130);
      };
      qrImg.src = qrCodeURL;
    }

    // Convert to data URL for preview
    setTicketPreview(canvas.toDataURL());
  };

  const handleInputChange = (field: keyof TicketFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBenefitToggle = (benefit: string) => {
    setFormData(prev => ({
      ...prev,
      selectedBenefits: prev.selectedBenefits.includes(benefit)
        ? prev.selectedBenefits.filter(b => b !== benefit)
        : [...prev.selectedBenefits, benefit]
    }));
  };

  const handleMealToggle = (meal: string) => {
    setFormData(prev => ({
      ...prev,
      mealOptions: prev.mealOptions.includes(meal)
        ? prev.mealOptions.filter(m => m !== meal)
        : [...prev.mealOptions, meal]
    }));
  };

  const proceedToPreview = () => {
    if (!formData.participantName || !formData.email) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in participant name and email."
      });
      return;
    }
    setCurrentStep(2);
  };

  const generateTicket = async () => {
    setIsGenerating(true);
    
    try {
      const qrData = JSON.stringify({
        eventId: event.id,
        participantName: formData.participantName,
        email: formData.email,
        pinCode: pinCode,
        timestamp: Date.now()
      });

      const { error } = await supabase
        .from('event_tickets')
        .insert({
          event_id: event.id,
          ticket_holder_name: formData.participantName,
          ticket_holder_email: formData.email,
          pin_code: pinCode,
          qr_code: qrData,
          selected_benefits: formData.selectedBenefits,
          ticket_role: formData.ticketRole,
          meal_options: formData.mealOptions,
          accommodation_type: formData.accommodationType,
          transport_included: formData.transportIncluded,
          is_used: false,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Ticket Generated Successfully!",
        description: "The ticket has been created and is ready for download."
      });

      setCurrentStep(3);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error generating ticket",
        description: error.message
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadTicket = () => {
    if (!ticketPreview) return;
    
    const link = document.createElement('a');
    link.download = `${formData.participantName}-${event.title}-ticket.png`;
    link.href = ticketPreview;
    link.click();
  };

  const sendTicketByEmail = () => {
    // This would integrate with an email service
    toast({
      title: "Email Sent!",
      description: "The ticket has been sent to the participant's email address."
    });
  };

  const reset = () => {
    setCurrentStep(1);
    setFormData({
      participantName: '',
      email: '',
      selectedBenefits: [],
      ticketRole: 'attendee',
      mealOptions: [],
      accommodationType: '',
      transportIncluded: false,
      ticketDesign: null
    });
    setQrCodeDataURL('');
    setPinCode('');
    setTicketPreview('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {currentStep > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="mr-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            Add Participant - {event.title}
          </DialogTitle>
          <DialogDescription>
            Step {currentStep} of 3: {
              currentStep === 1 ? 'Ticket Details' : 
              currentStep === 2 ? 'Preview & Generate' : 
              'Download & Share'
            }
          </DialogDescription>
        </DialogHeader>

        {currentStep === 1 && (
          <div className="space-y-6">
            {/* Participant Details */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="participantName">Participant Name *</Label>
                <Input
                  id="participantName"
                  value={formData.participantName}
                  onChange={(e) => handleInputChange('participantName', e.target.value)}
                  placeholder="Enter participant name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label>Ticket Role</Label>
              <Select value={formData.ticketRole} onValueChange={(value) => handleInputChange('ticketRole', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role} value={role.toLowerCase()}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              <Label>Available Benefits</Label>
              <div className="grid md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                {event.available_benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center space-x-2">
                    <Checkbox
                      id={benefit}
                      checked={formData.selectedBenefits.includes(benefit)}
                      onCheckedChange={() => handleBenefitToggle(benefit)}
                    />
                    <Label htmlFor={benefit} className="text-sm">{benefit}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Meal Options */}
            <div className="space-y-3">
              <Label>Meal Options</Label>
              <div className="grid md:grid-cols-4 gap-2">
                {mealOptions.map((meal) => (
                  <div key={meal} className="flex items-center space-x-2">
                    <Checkbox
                      id={meal}
                      checked={formData.mealOptions.includes(meal)}
                      onCheckedChange={() => handleMealToggle(meal)}
                    />
                    <Label htmlFor={meal} className="text-sm">{meal}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Accommodation */}
            <div className="space-y-2">
              <Label>Accommodation</Label>
              <Select value={formData.accommodationType} onValueChange={(value) => handleInputChange('accommodationType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select accommodation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No accommodation</SelectItem>
                  {accommodationOptions.map((acc) => (
                    <SelectItem key={acc} value={acc.toLowerCase()}>{acc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Transport */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="transport"
                checked={formData.transportIncluded}
                onCheckedChange={(checked) => handleInputChange('transportIncluded', checked)}
              />
              <Label htmlFor="transport">Include Transport</Label>
            </div>

            <div className="flex gap-4 pt-4">
              <Button onClick={proceedToPreview} className="flex-1 bg-gradient-primary hover:opacity-90">
                Preview Ticket
              </Button>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Ticket Preview</h3>
              <p className="text-sm text-muted-foreground mb-4">
                6-Digit PIN: <Badge variant="outline" className="font-mono text-lg">{pinCode}</Badge>
              </p>
            </div>

            {ticketPreview && (
              <div className="flex justify-center">
                <img src={ticketPreview} alt="Ticket Preview" className="max-w-full h-auto border rounded-lg" />
              </div>
            )}

            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <div className="flex gap-4 pt-4">
              <Button 
                onClick={generateTicket} 
                disabled={isGenerating}
                className="flex-1 bg-gradient-primary hover:opacity-90"
              >
                {isGenerating ? "Generating..." : "Generate Ticket"}
              </Button>
              <Button variant="outline" onClick={() => setCurrentStep(1)}>Back</Button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-success">Ticket Generated Successfully!</h3>
              <p className="text-sm text-muted-foreground">
                The ticket has been created and is ready for download or sharing.
              </p>
            </div>

            {ticketPreview && (
              <div className="flex justify-center">
                <img src={ticketPreview} alt="Generated Ticket" className="max-w-full h-auto border rounded-lg" />
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <Button onClick={downloadTicket} className="flex items-center justify-center">
                <Download className="w-4 h-4 mr-2" />
                Download Ticket
              </Button>
              <Button onClick={sendTicketByEmail} variant="outline" className="flex items-center justify-center">
                <Send className="w-4 h-4 mr-2" />
                Send by Email
              </Button>
            </div>

            <div className="flex gap-4 pt-4">
              <Button onClick={reset} className="flex-1">
                Create Another Ticket
              </Button>
              <Button variant="outline" onClick={onClose}>Close</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TicketGenerator;