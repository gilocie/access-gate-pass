import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import TicketTemplateSelector from './TicketTemplateSelector';

interface TicketEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string;
  eventId: string;
  onTicketUpdated: () => void;
}

interface TicketData {
  id: string;
  ticket_holder_name: string;
  ticket_holder_email: string;
  selected_benefits: string[];
  meal_options: string[];
  accommodation_type: string;
  transport_included: boolean;
  ticket_role: string;
  pin_code: string;
}

interface EventData {
  id: string;
  title: string;
  available_benefits: string[];
}

const TicketEditorModal: React.FC<TicketEditorModalProps> = ({
  isOpen,
  onClose,
  ticketId,
  eventId,
  onTicketUpdated
}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [event, setEvent] = useState<EventData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    participantName: '',
    participantEmail: '',
    selectedBenefits: [] as string[],
    mealOptions: [] as string[],
    accommodationType: '',
    transportIncluded: false,
    role: 'attendee'
  });

  useEffect(() => {
    if (isOpen && ticketId && eventId) {
      fetchTicketAndEvent();
    }
  }, [isOpen, ticketId, eventId]);

  const fetchTicketAndEvent = async () => {
    try {
      // Fetch ticket data
      const { data: ticketData, error: ticketError } = await supabase
        .from('event_tickets')
        .select('*')
        .eq('id', ticketId)
        .single();

      if (ticketError) throw ticketError;

      // Fetch event data
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      setTicket(ticketData);
      setEvent(eventData);
      
      setFormData({
        participantName: ticketData.ticket_holder_name,
        participantEmail: ticketData.ticket_holder_email,
        selectedBenefits: ticketData.selected_benefits || [],
        mealOptions: ticketData.meal_options || [],
        accommodationType: ticketData.accommodation_type || '',
        transportIncluded: ticketData.transport_included || false,
        role: ticketData.ticket_role || 'attendee'
      });

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading ticket",
        description: error.message
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    setCurrentStep(2);
  };

  const handleBenefitToggle = (benefit: string) => {
    setFormData(prev => ({
      ...prev,
      selectedBenefits: prev.selectedBenefits.includes(benefit)
        ? prev.selectedBenefits.filter(b => b !== benefit)
        : [...prev.selectedBenefits, benefit]
    }));
  };

  const handleUpdateTicket = async () => {
    if (!ticket || !event) return;

    try {
      const { error } = await supabase
        .from('event_tickets')
        .update({
          ticket_holder_name: formData.participantName,
          ticket_holder_email: formData.participantEmail,
          selected_benefits: formData.selectedBenefits,
          meal_options: formData.mealOptions,
          accommodation_type: formData.accommodationType,
          transport_included: formData.transportIncluded,
          ticket_role: formData.role
        })
        .eq('id', ticketId);

      if (error) throw error;

      toast({
        title: "Ticket Updated!",
        description: "The ticket has been successfully updated."
      });

      onTicketUpdated();
      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating ticket",
        description: error.message
      });
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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
            Edit Ticket - {event?.title}
          </DialogTitle>
          <DialogDescription>
            Step {currentStep} of 3: {currentStep === 1 ? 'Select Template' : currentStep === 2 ? 'Participant Details' : 'Review & Update'}
          </DialogDescription>
        </DialogHeader>

        {currentStep === 1 && (
          <TicketTemplateSelector
            onTemplateSelect={handleTemplateSelect}
            onBack={onClose}
            eventCategory=""
          />
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="participantName">Participant Name *</Label>
                <Input
                  id="participantName"
                  value={formData.participantName}
                  onChange={(e) => setFormData(prev => ({ ...prev, participantName: e.target.value }))}
                  placeholder="Enter participant's full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="participantEmail">Email Address *</Label>
                <Input
                  id="participantEmail"
                  type="email"
                  value={formData.participantEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, participantEmail: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attendee">Attendee</SelectItem>
                  <SelectItem value="speaker">Speaker</SelectItem>
                  <SelectItem value="organizer">Organizer</SelectItem>
                  <SelectItem value="sponsor">Sponsor</SelectItem>
                  <SelectItem value="volunteer">Volunteer</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {event?.available_benefits && event.available_benefits.length > 0 && (
              <div className="space-y-2">
                <Label>Available Benefits</Label>
                <div className="grid grid-cols-2 gap-2">
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
            )}

            <div className="flex gap-4">
              <Button 
                onClick={() => setCurrentStep(3)}
                disabled={!formData.participantName || !formData.participantEmail}
                className="flex-1 bg-gradient-primary hover:opacity-90"
              >
                Continue to Review
              </Button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Ticket Summary</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Name:</strong> {formData.participantName}</p>
                <p><strong>Email:</strong> {formData.participantEmail}</p>
                <p><strong>Role:</strong> {formData.role}</p>
                <p><strong>PIN Code:</strong> {ticket?.pin_code}</p>
                {formData.selectedBenefits.length > 0 && (
                  <p><strong>Benefits:</strong> {formData.selectedBenefits.join(', ')}</p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={handleUpdateTicket}
                className="flex-1 bg-gradient-primary hover:opacity-90"
              >
                <Save className="w-4 h-4 mr-2" />
                Update Ticket
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TicketEditorModal;