import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Calendar, 
  Users, 
  Ticket, 
  BarChart3, 
  Settings,
  MapPin,
  Clock,
  CheckCircle,
  Scan,
  Edit,
  Trash2,
  Crown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import QRScanner from '@/components/QRScanner';
import TicketGenerator from '@/components/TicketGenerator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_end_date: string;
  location: string;
  max_attendees: number;
  company_name: string;
  available_benefits: string[];
  sessions: string[];
  session_types: string[];
  created_at: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalTickets: 0,
    usedTickets: 0
  });
  const [selectedEventStats, setSelectedEventStats] = useState({
    totalTickets: 0,
    usedTickets: 0
  });
  const [showTicketGenerator, setShowTicketGenerator] = useState(false);

  useEffect(() => {
    if (user) {
      fetchEvents();
      fetchStats();
    }
  }, [user]);

  const fetchEvents = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading events",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!user) return;
    
    try {
      // Get total events
      const { count: eventCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('organizer_id', user.id);

      // Get total tickets and used tickets
      const { data: ticketsData } = await supabase
        .from('event_tickets')
        .select('event_id, is_used')
        .in('event_id', events.map(e => e.id));

      const usedTicketsCount = ticketsData?.filter(t => t.is_used).length || 0;

      setStats({
        totalEvents: eventCount || 0,
        totalTickets: ticketsData?.length || 0,
        usedTickets: usedTicketsCount
      });
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchEventStats = async (eventId: string) => {
    try {
      const { data: ticketsData } = await supabase
        .from('event_tickets')
        .select('is_used')
        .eq('event_id', eventId);

      const usedTicketsCount = ticketsData?.filter(t => t.is_used).length || 0;

      setSelectedEventStats({
        totalTickets: ticketsData?.length || 0,
        usedTickets: usedTicketsCount
      });
    } catch (error: any) {
      console.error('Error fetching event stats:', error);
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

  const calculateRemainingDays = (eventDate: string) => {
    const now = new Date();
    const event = new Date(eventDate);
    const diffTime = event.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      // First delete all tickets for this event
      const { error: ticketsError } = await supabase
        .from('event_tickets')
        .delete()
        .eq('event_id', eventId);

      if (ticketsError) throw ticketsError;

      // Then delete the event
      const { error: eventError } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .eq('organizer_id', user?.id);

      if (eventError) throw eventError;

      toast({
        title: "Event deleted successfully",
        description: "The event and all associated tickets have been removed."
      });

      fetchEvents();
      fetchStats();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting event",
        description: error.message
      });
    }
  };

  const handleScanQR = (eventId: string) => {
    setSelectedEventId(eventId);
    setShowQRScanner(true);
  };

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
    fetchEventStats(event.id);
  };

  const handleAddParticipant = () => {
    if (selectedEvent) {
      setShowTicketGenerator(true);
    }
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

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Welcome back, {user?.email?.split('@')[0]}!
              </h1>
              <p className="text-muted-foreground text-lg">
                Manage your events and track performance from your dashboard.
              </p>
            </div>
            <Button size="lg" className="bg-gradient-primary hover:opacity-90 mt-4 md:mt-0" asChild>
              <Link to="/create-event">
                <Plus className="w-5 h-5 mr-2" />
                Create Event
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {/* Current Plan Card */}
            <Link to="/plans">
              <Card className="glass cursor-pointer hover:shadow-lg transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
                  <Crown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Basic</div>
                  <p className="text-xs text-muted-foreground">
                    Click to upgrade
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Card className="glass">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalEvents}</div>
                <p className="text-xs text-muted-foreground">
                  Events created
                </p>
              </CardContent>
            </Card>
            
            <Card className="glass">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {selectedEvent ? `${selectedEvent.title} - Total Tickets` : 'Total Tickets'}
                </CardTitle>
                <Ticket className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {selectedEvent ? selectedEventStats.totalTickets : stats.totalTickets}
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedEvent ? 'Created for this event' : 'Tickets created'}
                </p>
              </CardContent>
            </Card>
            
            <Card className="glass">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Used Tickets</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {selectedEvent ? selectedEventStats.usedTickets : stats.usedTickets}
                </div>
                <p className="text-xs text-muted-foreground">
                  Tickets checked in
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Events Section */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Your Events
              </CardTitle>
              <CardDescription>
                Manage and monitor your upcoming and past events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No events yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first event to get started with GoPass
                  </p>
                  <Button className="bg-gradient-primary hover:opacity-90" asChild>
                    <Link to="/create-event">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Event
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {events.map((event) => (
                    <Card 
                      key={event.id} 
                      className={`cursor-pointer transition-all hover:shadow-lg overflow-hidden ${
                        selectedEvent?.id === event.id 
                          ? 'bg-gradient-primary text-white ring-2 ring-primary-dark' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => handleEventSelect(event)}
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <h3 className={`text-lg font-semibold mr-3 ${
                                selectedEvent?.id === event.id ? 'text-white' : ''
                              }`}>
                                {event.title}
                              </h3>
                              {event.company_name && (
                                <Badge variant={selectedEvent?.id === event.id ? "secondary" : "outline"}>
                                  {event.company_name}
                                </Badge>
                              )}
                            </div>
                            
                            <div className={`grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm ${
                              selectedEvent?.id === event.id ? 'text-white/80' : 'text-muted-foreground'
                            }`}>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-2" />
                                {formatDate(event.event_date)}
                              </div>
                              
                              {event.location && (
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-2" />
                                  {event.location}
                                </div>
                              )}
                              
                              {event.max_attendees && (
                                <div className="flex items-center">
                                  <Users className="w-4 h-4 mr-2" />
                                  Max {event.max_attendees} attendees
                                </div>
                              )}
                              
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                {calculateRemainingDays(event.event_date) > 0 ? 
                                  `${calculateRemainingDays(event.event_date)} days remaining` : 
                                  'Event ended'
                                }
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 mt-4 md:mt-0">
                            {selectedEvent?.id === event.id && (
                              <Button 
                                variant="secondary" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddParticipant();
                                }}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Participant
                              </Button>
                            )}
                            <Button 
                              variant={selectedEvent?.id === event.id ? "secondary" : "outline"}
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleScanQR(event.id);
                              }}
                            >
                              <Scan className="w-4 h-4 mr-2" />
                              Scan QR
                            </Button>
                            <Button 
                              variant={selectedEvent?.id === event.id ? "secondary" : "outline"}
                              size="sm" 
                              asChild
                            >
                              <Link 
                                to={`/edit-event/${event.id}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                View
                              </Link>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant={selectedEvent?.id === event.id ? "secondary" : "outline"}
                                  size="sm"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Event</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{event.title}"? This will permanently remove the event and all associated tickets. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteEvent(event.id)}>
                                    Delete Event
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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

      {/* QR Scanner Dialog */}
      {showQRScanner && (
        <QRScanner
          isOpen={showQRScanner}
          onClose={() => setShowQRScanner(false)}
          eventId={selectedEventId}
        />
      )}

      {/* Ticket Generator Dialog */}
      {showTicketGenerator && selectedEvent && (
        <TicketGenerator
          isOpen={showTicketGenerator}
          onClose={() => {
            setShowTicketGenerator(false);
            fetchEventStats(selectedEvent.id);
            fetchStats();
          }}
          event={selectedEvent}
        />
      )}
    </div>
  );
};

export default Dashboard;