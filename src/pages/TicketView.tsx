import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Shield, CheckCircle, XCircle } from 'lucide-react';

interface TicketData {
  id: string;
  event_id: string;
  ticket_holder_name: string;
  ticket_holder_email: string;
  pin_code: string;
  selected_benefits: string[];
  ticket_role: string;
  is_active: boolean;
  is_used: boolean;
  used_benefits: string[];
  total_benefits_used: number;
}

interface EventData {
  id: string;
  title: string;
  event_date: string;
  event_end_date: string;
  location: string;
  available_benefits: string[];
}

const TicketView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifyPin, setVerifyPin] = useState('');
  const [showPinVerification, setShowPinVerification] = useState(false);
  const [selectedBenefit, setSelectedBenefit] = useState<string>('');
  const [usedBenefits, setUsedBenefits] = useState<string[]>([]);

  const pinCode = searchParams.get('pinCode');
  const eventId = searchParams.get('eventId');

  useEffect(() => {
    if (pinCode && eventId) {
      fetchTicketData();
    }
  }, [pinCode, eventId]);

  const fetchTicketData = async () => {
    try {
      // Fetch ticket data
      const { data: ticketData, error: ticketError } = await supabase
        .from('event_tickets')
        .select('*')
        .eq('pin_code', pinCode)
        .eq('event_id', eventId)
        .maybeSingle();

      if (ticketError) throw ticketError;

      if (!ticketData) {
        toast({
          variant: "destructive",
          title: "Ticket Not Found",
          description: "The ticket with the provided PIN code was not found."
        });
        return;
      }

      setTicket({
        ...ticketData,
        used_benefits: ticketData.used_benefits || [],
        total_benefits_used: ticketData.total_benefits_used || 0
      });
      setUsedBenefits(ticketData.used_benefits || []);

      // Fetch event data
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;
      setEvent(eventData);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error Loading Ticket",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const deactivateTicket = async () => {
    if (!ticket) return;

    try {
      const { error } = await supabase
        .from('event_tickets')
        .update({ is_active: false })
        .eq('id', ticket.id);

      if (error) throw error;

      setTicket(prev => prev ? { ...prev, is_active: false } : null);
      toast({
        title: "Ticket Deactivated",
        description: "The ticket has been successfully deactivated."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  };

  const markBenefitAsUsed = async () => {
    if (!ticket || !selectedBenefit || verifyPin !== ticket.pin_code) {
      toast({
        variant: "destructive",
        title: "Invalid PIN",
        description: "Please enter the correct 6-digit PIN code."
      });
      return;
    }

    if (usedBenefits.includes(selectedBenefit)) {
      toast({
        variant: "destructive",
        title: "Already Used",
        description: "This benefit has already been marked as used."
      });
      return;
    }

    const newUsedBenefits = [...usedBenefits, selectedBenefit];
    const totalBenefitsUsed = newUsedBenefits.length;
    const allBenefitsUsed = totalBenefitsUsed === ticket.selected_benefits.length;

    try {
      const { error } = await supabase
        .from('event_tickets')
        .update({ 
          used_benefits: newUsedBenefits,
          total_benefits_used: totalBenefitsUsed,
          is_used: allBenefitsUsed
        })
        .eq('id', ticket.id);

      if (error) throw error;

      setUsedBenefits(newUsedBenefits);
      setTicket(prev => prev ? { 
        ...prev, 
        used_benefits: newUsedBenefits,
        total_benefits_used: totalBenefitsUsed,
        is_used: allBenefitsUsed
      } : null);
      
      setShowPinVerification(false);
      setVerifyPin('');
      setSelectedBenefit('');

      toast({
        title: "Benefit Marked as Used",
        description: `${selectedBenefit} has been successfully marked as used.`
      });

      if (allBenefitsUsed) {
        toast({
          title: "All Benefits Used",
          description: "All benefits for this ticket have been used. PIN code is now unusable."
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  };

  const handleBenefitSelection = (benefit: string) => {
    setSelectedBenefit(benefit);
    setShowPinVerification(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading ticket data...</p>
        </div>
      </div>
    );
  }

  if (!ticket || !event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Ticket Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">The ticket could not be found or the QR code is invalid.</p>
            <Button onClick={() => navigate('/')}>Return Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const benefitsUsedCount = usedBenefits.length;
  const totalBenefits = ticket.selected_benefits.length;
  const isPinUsable = benefitsUsedCount < totalBenefits;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Ticket Management</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Ticket Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Ticket Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Event</Label>
                <p className="text-lg font-semibold">{event.title}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Participant</Label>
                <p>{ticket.ticket_holder_name}</p>
                <p className="text-sm text-muted-foreground">{ticket.ticket_holder_email}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Role</Label>
                <Badge variant="secondary" className="capitalize">{ticket.ticket_role}</Badge>
              </div>

              <div>
                <Label className="text-sm font-medium">PIN Code</Label>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg">{ticket.pin_code}</span>
                  {!isPinUsable && (
                    <Badge variant="destructive">Unusable</Badge>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Status</Label>
                <div className="flex gap-2">
                  <Badge variant={ticket.is_active ? "default" : "destructive"}>
                    {ticket.is_active ? "Active" : "Deactivated"}
                  </Badge>
                  <Badge variant={benefitsUsedCount === totalBenefits ? "secondary" : "default"}>
                    Benefits: {benefitsUsedCount}/{totalBenefits}
                  </Badge>
                </div>
              </div>

              {ticket.is_active && (
                <Button
                  variant="destructive"
                  onClick={deactivateTicket}
                  className="w-full"
                >
                  Deactivate Ticket
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Benefits Management */}
          <Card>
            <CardHeader>
              <CardTitle>Benefits Management</CardTitle>
              <CardDescription>
                Mark benefits as used. Once all benefits are used, the PIN becomes unusable.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticket.selected_benefits.length === 0 ? (
                <p className="text-muted-foreground">No benefits selected for this ticket.</p>
              ) : (
                <div className="space-y-3">
                  {ticket.selected_benefits.map((benefit) => {
                    const isUsed = usedBenefits.includes(benefit);
                    return (
                      <div key={benefit} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {isUsed ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-gray-400" />
                          )}
                          <span className={isUsed ? "line-through text-muted-foreground" : ""}>
                            {benefit}
                          </span>
                        </div>
                        {!isUsed && isPinUsable && (
                          <Button
                            size="sm"
                            onClick={() => handleBenefitSelection(benefit)}
                          >
                            Mark as Used
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {!isPinUsable && (
                <Alert>
                  <AlertDescription>
                    All benefits have been used. The 6-digit PIN code is now unusable.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* PIN Verification Dialog */}
        {showPinVerification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Confirm Action</CardTitle>
                <CardDescription>
                  Enter the 6-digit PIN code to mark "{selectedBenefit}" as used.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="verify-pin">6-Digit PIN Code</Label>
                  <Input
                    id="verify-pin"
                    type="text"
                    maxLength={6}
                    value={verifyPin}
                    onChange={(e) => setVerifyPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit PIN"
                    className="font-mono text-center text-lg"
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={markBenefitAsUsed}
                    disabled={verifyPin.length !== 6}
                    className="flex-1"
                  >
                    Confirm
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPinVerification(false);
                      setVerifyPin('');
                      setSelectedBenefit('');
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketView;