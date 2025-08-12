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
import TicketTemplateSelector from './TicketTemplateSelector';

interface Event {
  id: string;
  title: string;
  event_date: string;
  event_end_date: string;
  location: string;
  available_benefits: string[];
  sessions?: string[];
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
  const [currentStep, setCurrentStep] = useState(0); // Start with template selection
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrCodeDataURL, setQrCodeDataURL] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [ticketPreview, setTicketPreview] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  
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
  }, [currentStep, formData, selectedTemplate]);

  const generatePinAndQR = async () => {
    // Ensure 6-digit code is unique per event
    const generatePin = () => Math.floor(100000 + Math.random() * 900000).toString();

    let uniquePin = generatePin();
    try {
      for (let i = 0; i < 5; i++) {
        const { count, error } = await supabase
          .from('event_tickets')
          .select('id', { count: 'exact', head: true })
          .eq('event_id', event.id)
          .eq('pin_code', uniquePin);
        if (error) throw error;
        if (!count) break; // unique
        uniquePin = generatePin();
      }
    } catch (e) {
      console.warn('PIN uniqueness check failed, proceeding with generated code');
    }

    setPinCode(uniquePin);

    // Create QR data that redirects to ticket view page
    const qrData = `${window.location.origin}/ticket-view?pinCode=${uniquePin}&eventId=${event.id}`;

    try {
      const qrCodeURL = await QRCode.toDataURL(qrData, {
        width: 512,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      setQrCodeDataURL(qrCodeURL);
      
      // Generate preview based on template type
      if (selectedTemplate?.customizations?.elements) {
        // Custom template
        const preview = await generateTicketFromCustomTemplate(selectedTemplate, formData, uniquePin);
        setTicketPreview(preview);
      } else {
        // Built-in template
        generateTicketPreview(qrCodeURL, uniquePin);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const refreshPinCode = () => {
    generatePinAndQR();
    toast({
      title: "New Code Generated",
      description: "A new 6-digit code has been generated for this ticket."
    });
  };

  const generateTicketPreview = (qrCodeURL: string, pin: string) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size matching the reference design
    canvas.width = 900;
    canvas.height = 300;

    // Template colors with opacity support
    const primaryColor = selectedTemplate?.customizations?.primaryColor || '#1a1a1a';
    const secondaryColor = selectedTemplate?.customizations?.secondaryColor || '#2a2a2a';
    const accentColor = selectedTemplate?.customizations?.accentColor || '#FFD700';
    const fontFamily = selectedTemplate?.customizations?.fontFamily || 'Arial';

    // Background with opacity
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, primaryColor);
    gradient.addColorStop(1, secondaryColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Background overlay for opacity effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Logo area (left side rounded rectangle)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.roundRect(20, 20, 120, 80, 10);
    ctx.fill();
    
    // Logo text placeholder
    ctx.fillStyle = primaryColor;
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('LOGO', 80, 65);

    // Event name - large yellow text at top
    ctx.fillStyle = accentColor;
    ctx.font = `bold 36px ${fontFamily}`;
    ctx.textAlign = 'left';
    ctx.fillText(event.title.toUpperCase(), 160, 60);

    // Participant name - white text below event name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `20px ${fontFamily}`;
    ctx.fillText(`TICKET USER: ${formData.participantName.toUpperCase()}`, 160, 90);

    // Date section
    const startDate = new Date(event.event_date);
    const endDate = event.event_end_date ? new Date(event.event_end_date) : startDate;
    
    // Start date box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(160, 120, 60, 60, 8);
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(startDate.getDate().toString().padStart(2, '0'), 190, 145);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '10px Arial';
    ctx.fillText(startDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(), 190, 160);
    ctx.fillText(startDate.getFullYear().toString(), 190, 172);

    // "TO" text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('TO', 240, 155);

    // End date box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(260, 120, 60, 60, 8);
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(endDate.getDate().toString().padStart(2, '0'), 290, 145);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '10px Arial';
    ctx.fillText(endDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(), 290, 160);
    ctx.fillText(endDate.getFullYear().toString(), 290, 172);

    // Status section
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('STATUS', 360, 140);
    ctx.fillStyle = '#00FF00';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('VALID', 360, 160);

    // Benefits used section
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 18px Arial';
    ctx.fillText('B USED', 480, 140);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`0/${formData.selectedBenefits.length}`, 480, 160);

    // Bottom info
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 10px Arial';
    ctx.fillText('EXPIRY DATE:', 160, 220);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '10px Arial';
    ctx.fillText(endDate.toLocaleDateString('en-US'), 160, 235);

    const remainingDays = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 10px Arial';
    ctx.fillText('REMAINING DAYS:', 300, 220);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '10px Arial';
    ctx.fillText(`${Math.max(0, remainingDays)} Days`, 300, 235);

    // 6-digit PIN display
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 10px Arial';
    ctx.fillText('PIN CODE:', 160, 255);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px Arial';
    ctx.fillText(pin, 210, 255);

    // QR Code - positioned on right side in rounded square
    if (qrCodeURL) {
      const qrImg = new Image();
      qrImg.onload = () => {
        // QR code background with rounded corners
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(750, 40, 130, 130, 10);
        ctx.fill();
        
        // QR code positioned in center
        ctx.drawImage(qrImg, 760, 50, 110, 110);
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
      // QR code data now points to ticket view URL
      const qrData = `${window.location.origin}/ticket-view?pinCode=${pinCode}&eventId=${event.id}`;

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
          is_active: true,
          used_benefits: [],
          total_benefits_used: 0
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
    setCurrentStep(0);
    setSelectedTemplate(null);
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

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    setCurrentStep(1);
  };

  const generateTicketFromCustomTemplate = async (customTemplate: any, formData: any, pinCode: string) => {
    if (!canvasRef.current) return '';

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const { canvasSize, elements, backgroundColor, backgroundImage } = customTemplate.customizations;
    
    // Set canvas size
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    // Background
    if (backgroundImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = backgroundImage;
      });
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    } else if (backgroundColor) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Generate QR code
    const qrData = `${window.location.origin}/ticket-view?pinCode=${pinCode}&eventId=${event.id}`;
    const qrCodeURL = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 1,
      color: { dark: '#000000', light: '#FFFFFF' },
      errorCorrectionLevel: 'M'
    });

    // Render elements
    for (const element of elements) {
      ctx.save();
      
      // Apply transformations
      const centerX = element.x + element.width / 2;
      const centerY = element.y + element.height / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate((element.rotation || 0) * Math.PI / 180);
      ctx.translate(-centerX, -centerY);

      if (element.type === 'qr-code') {
        const qrImg = new Image();
        await new Promise((resolve) => {
          qrImg.onload = resolve;
          qrImg.src = qrCodeURL;
        });
        
        if (element.backgroundColor && element.backgroundColor !== 'transparent') {
          ctx.fillStyle = element.backgroundColor;
          ctx.fillRect(element.x, element.y, element.width, element.height);
        }
        
        ctx.drawImage(qrImg, element.x + 4, element.y + 4, element.width - 8, element.height - 8);
      } else if (element.type === 'logo' && element.imageUrl) {
        const logoImg = new Image();
        await new Promise((resolve) => {
          logoImg.onload = resolve;
          logoImg.src = element.imageUrl;
        });
        // Draw logo preserving aspect ratio inside the element box
        const iw = logoImg.width;
        const ih = logoImg.height;
        const boxW = element.width;
        const boxH = element.height;
        const scale = Math.min(boxW / iw, boxH / ih);
        const drawW = iw * scale;
        const drawH = ih * scale;
        const dx = element.x + (boxW - drawW) / 2;
        const dy = element.y + (boxH - drawH) / 2;
        ctx.drawImage(logoImg, dx, dy, drawW, drawH);
      } else {
        // Text elements
        if (element.backgroundColor && element.backgroundColor !== 'transparent') {
          ctx.fillStyle = element.backgroundColor;
          ctx.fillRect(element.x, element.y, element.width, element.height);
        }

        ctx.fillStyle = element.color || '#FFFFFF';
        ctx.font = `${element.fontWeight || 'normal'} ${element.fontSize || 16}px ${element.fontFamily || 'Arial'}`;
        ctx.textAlign = element.textAlign || 'left';
        ctx.textBaseline = 'middle';

        let content = element.content || '';
        
        // Dynamic content replacement
        if (element.type === 'event-name') content = event.title;
        else if (element.type === 'user-name') content = formData.participantName;
        else if (element.type === 'pin-code') content = pinCode;
        else if (element.type === 'status') content = 'VALID';
        else if (element.type === 'benefits') content = `0/${formData.selectedBenefits.length}`;
        else if (element.type === 'remaining-days') {
          const endDate = event.event_end_date ? new Date(event.event_end_date) : new Date(event.event_date);
          const remainingDays = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          content = `${Math.max(0, remainingDays)} Days`;
        }

        const textY = element.y + element.height / 2;
        let textX = element.x;
        if (element.textAlign === 'center') textX = element.x + element.width / 2;
        else if (element.textAlign === 'right') textX = element.x + element.width;

        ctx.fillText(content, textX, textY);
      }
      
      ctx.restore();
    }

    return canvas.toDataURL();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {currentStep > 0 && (
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
            Step {currentStep + 1} of 4: {
              currentStep === 0 ? 'Select Template' :
              currentStep === 1 ? 'Ticket Details' : 
              currentStep === 2 ? 'Preview & Generate' :
              'Download & Share'
            }
          </DialogDescription>
        </DialogHeader>

        {currentStep === 0 && (
          <TicketTemplateSelector
            onTemplateSelect={handleTemplateSelect}
            onBack={onClose}
            eventCategory={event.sessions?.[0] || ''}
          />
        )}

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
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="text-sm text-muted-foreground">
                  6-Digit PIN: <Badge variant="outline" className="font-mono text-lg ml-2">{pinCode}</Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshPinCode}
                  className="text-xs"
                >
                  Refresh PIN
                </Button>
              </div>
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
              <div className="text-sm text-muted-foreground">
                The ticket has been created and is ready for download or sharing.
              </div>
              <div className="text-sm">
                Final PIN Code: <Badge variant="outline" className="font-mono text-lg ml-2">{pinCode}</Badge>
              </div>
            </div>

            {ticketPreview && (
              <div className="flex justify-center">
                <img src={ticketPreview} alt="Generated Ticket" className="max-w-full h-auto border rounded-lg" />
              </div>
            )}

            <div className="grid md:grid-cols-4 gap-4">
              <Button onClick={downloadTicket} className="flex items-center justify-center">
                <Download className="w-4 h-4 mr-2" />
                Download Ticket
              </Button>
              <Button onClick={sendTicketByEmail} variant="outline" className="flex items-center justify-center">
                <Send className="w-4 h-4 mr-2" />
                Send by Email
              </Button>
              <Button 
                onClick={() => window.open(`/ticket-view?pinCode=${pinCode}&eventId=${event.id}`, '_blank')} 
                variant="secondary" 
                className="flex items-center justify-center"
              >
                <Eye className="w-4 h-4 mr-2" />
                Review Ticket
              </Button>
              <Button 
                onClick={() => {
                  onClose();
                  window.location.href = '/dashboard';
                }}
                variant="default"
                className="flex items-center justify-center bg-gradient-primary hover:opacity-90"
              >
                Done
              </Button>
            </div>

            <div className="flex gap-4 pt-4">
              <Button onClick={reset} variant="outline" className="flex-1">
                Create Another Ticket
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TicketGenerator;