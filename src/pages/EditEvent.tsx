import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Scan, 
  Plus,
  Download,
  Send,
  Edit,
  Trash2,
  Users,
  Ticket
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import TicketGenerator from '@/components/TicketGenerator';
import QRScanner from '@/components/QRScanner';

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_end_date: string;
  location: string;
  max_attendees: number;
  available_benefits: string[];
  sessions: string[];
  session_types: string[];
}

interface EventTicket {
  id: string;
  ticket_holder_name: string;
  ticket_holder_email: string;
  ticket_role: string;
  selected_benefits: string[];
  meal_options: string[];
  accommodation_type: string;
  transport_included: boolean;
  is_used: boolean;
  is_active: boolean;
  created_at: string;
}

const EditEvent = () => {
  const { eventId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [tickets, setTickets] = useState<EventTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTicketGenerator, setShowTicketGenerator] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    event_date: '',
    event_end_date: '',
    location: '',
    max_attendees: ''
  });

  useEffect(() => {
    if (user && eventId) {
      fetchEvent();
      fetchTickets();
    }
  }, [user, eventId]);

  const fetchEvent = async () => {
    if (!user || !eventId) return;
    
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .eq('organizer_id', user.id)
        .single();
      
      if (error) throw error;
      
      setEvent(data);
      setEditData({
        title: data.title,
        description: data.description || '',
        event_date: data.event_date,
        event_end_date: data.event_end_date || '',
        location: data.location || '',
        max_attendees: data.max_attendees?.toString() || ''
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading event",
        description: error.message
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    if (!user || !eventId) return;
    
    try {
      const { data, error } = await supabase
        .from('event_tickets')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTickets(data || []);
    } catch (error: any) {
      console.error('Error fetching tickets:', error);
    }
  };

  const handleUpdateEvent = async () => {
    if (!user || !eventId) return;
    
    try {
      const { error } = await supabase
        .from('events')
        .update({
          title: editData.title,
          description: editData.description,
          event_date: editData.event_date,
          event_end_date: editData.event_end_date || null,
          location: editData.location,
          max_attendees: editData.max_attendees ? parseInt(editData.max_attendees) : null
        })
        .eq('id', eventId)
        .eq('organizer_id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Event updated successfully!",
        description: "Your event details have been saved."
      });
      
      fetchEvent();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating event",
        description: error.message
      });
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    try {
      const { error } = await supabase
        .from('event_tickets')
        .delete()
        .eq('id', ticketId);
      
      if (error) throw error;
      
      toast({
        title: "Ticket deleted",
        description: "The ticket has been removed."
      });
      
      fetchTickets();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting ticket",
        description: error.message
      });
    }
  };

  const handleToggleTicketStatus = async (ticketId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('event_tickets')
        .update({ is_active: !currentStatus })
        .eq('id', ticketId);
      
      if (error) throw error;
      
      toast({
        title: `Ticket ${!currentStatus ? 'activated' : 'deactivated'}`,
        description: `The ticket has been ${!currentStatus ? 'activated' : 'deactivated'}.`
      });
      
      fetchTickets();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating ticket",
        description: error.message
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 pb-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 pb-16 text-center">
          <h1 className="text-2xl font-bold">Event not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center mb-8">
            <Link to="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground transition-colors mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>

          {/* Event Details Card */}
          <Card className="glass mb-8">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{event.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {formatDate(event.event_date)}
                    {event.event_end_date && ` - ${formatDate(event.event_end_date)}`}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setShowQRScanner(true)} className="bg-gradient-primary hover:opacity-90">
                    <Scan className="w-4 h-4 mr-2" />
                    Scan QR
                  </Button>
                  <Button onClick={() => setShowTicketGenerator(true)} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Participant
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Event Stats */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="text-center p-4">
                  <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{tickets.length}</div>
                  <div className="text-sm text-muted-foreground">Total Participants</div>
                </Card>
                <Card className="text-center p-4">
                  <Ticket className="w-6 h-6 mx-auto mb-2 text-success" />
                  <div className="text-2xl font-bold">{tickets.filter(t => t.is_active).length}</div>
                  <div className="text-sm text-muted-foreground">Active Tickets</div>
                </Card>
                <Card className="text-center p-4">
                  <Badge className="w-6 h-6 mx-auto mb-2 text-warning" />
                  <div className="text-2xl font-bold">{tickets.filter(t => t.is_used).length}</div>
                  <div className="text-sm text-muted-foreground">Used Tickets</div>
                </Card>
              </div>

              {/* Edit Event Form */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Event Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Name</Label>
                    <Input
                      id="title"
                      value={editData.title}
                      onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={editData.location}
                      onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editData.description}
                    onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="event_date">Start Date & Time</Label>
                    <Input
                      id="event_date"
                      type="datetime-local"
                      value={editData.event_date}
                      onChange={(e) => setEditData(prev => ({ ...prev, event_date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event_end_date">End Date & Time</Label>
                    <Input
                      id="event_end_date"
                      type="datetime-local"
                      value={editData.event_end_date}
                      onChange={(e) => setEditData(prev => ({ ...prev, event_end_date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_attendees">Max Attendees</Label>
                    <Input
                      id="max_attendees"
                      type="number"
                      value={editData.max_attendees}
                      onChange={(e) => setEditData(prev => ({ ...prev, max_attendees: e.target.value }))}
                    />
                  </div>
                </div>
                
                <Button onClick={handleUpdateEvent} className="bg-gradient-primary hover:opacity-90">
                  Update Event
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tickets List */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Event Tickets</CardTitle>
              <CardDescription>
                Manage tickets for this event
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tickets.length === 0 ? (
                <div className="text-center py-12">
                  <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tickets yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Add participants to generate tickets for this event
                  </p>
                  <Button onClick={() => setShowTicketGenerator(true)} className="bg-gradient-primary hover:opacity-90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Participant
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold">{ticket.ticket_holder_name}</h4>
                              <Badge variant={ticket.is_active ? "default" : "secondary"}>
                                {ticket.is_active ? "Active" : "Inactive"}
                              </Badge>
                              <Badge variant={ticket.is_used ? "destructive" : "outline"}>
                                {ticket.is_used ? "Used" : "Unused"}
                              </Badge>
                              <Badge variant="outline">{ticket.ticket_role}</Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2">{ticket.ticket_holder_email}</p>
                            
                            {ticket.selected_benefits.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {ticket.selected_benefits.slice(0, 3).map((benefit, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {benefit}
                                  </Badge>
                                ))}
                                {ticket.selected_benefits.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{ticket.selected_benefits.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleToggleTicketStatus(ticket.id, ticket.is_active)}
                            >
                              {ticket.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Send className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleDeleteTicket(ticket.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      {showTicketGenerator && (
        <TicketGenerator
          isOpen={showTicketGenerator}
          onClose={() => {
            setShowTicketGenerator(false);
            fetchTickets();
          }}
          event={event}
        />
      )}

      {showQRScanner && (
        <QRScanner
          isOpen={showQRScanner}
          onClose={() => setShowQRScanner(false)}
          eventId={event.id}
        />
      )}
    </div>
  );
};

export default EditEvent;