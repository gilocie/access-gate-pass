import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  MapPin, 
  Users, 
  ArrowLeft, 
  Plus,
  X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';

interface Benefit {
  id: string;
  name: string;
  description: string;
  category: string;
}

const CreateEvent = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [customBenefit, setCustomBenefit] = useState('');
  
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    event_date: '',
    event_end_date: '',
    location: '',
    max_attendees: '',
    available_benefits: [] as string[],
    sessions: [] as string[],
    session_types: [] as string[]
  });

  const sessionOptions = ['Morning Session', 'Afternoon Session', 'Evening Session', 'Night Session'];
  const sessionTypeOptions = ['Training', 'Watching', 'Playing', 'Panel Discussion', 'Workshop', 'Performance'];

  useEffect(() => {
    if (user) {
      fetchBenefits();
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('company_name')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      setUserProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchBenefits = async () => {
    try {
      const { data, error } = await supabase
        .from('event_benefits')
        .select('*')
        .order('category', { ascending: true });
      
      if (error) throw error;
      setBenefits(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading benefits",
        description: error.message
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEventData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleBenefitToggle = (benefitName: string) => {
    setEventData(prev => ({
      ...prev,
      available_benefits: prev.available_benefits.includes(benefitName)
        ? prev.available_benefits.filter(b => b !== benefitName)
        : [...prev.available_benefits, benefitName]
    }));
  };

  const handleSessionToggle = (session: string) => {
    setEventData(prev => ({
      ...prev,
      sessions: prev.sessions.includes(session)
        ? prev.sessions.filter(s => s !== session)
        : [...prev.sessions, session]
    }));
  };

  const handleSessionTypeToggle = (sessionType: string) => {
    setEventData(prev => ({
      ...prev,
      session_types: prev.session_types.includes(sessionType)
        ? prev.session_types.filter(st => st !== sessionType)
        : [...prev.session_types, sessionType]
    }));
  };

  const addCustomBenefit = () => {
    if (customBenefit.trim()) {
      handleBenefitToggle(customBenefit.trim());
      setCustomBenefit('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('events')
        .insert({
          organizer_id: user.id,
          title: eventData.title,
          description: eventData.description,
          event_date: eventData.event_date,
          event_end_date: eventData.event_end_date || null,
          location: eventData.location,
          max_attendees: eventData.max_attendees ? parseInt(eventData.max_attendees) : null,
          available_benefits: eventData.available_benefits,
          sessions: eventData.sessions,
          session_types: eventData.session_types,
          company_name: userProfile?.company_name || null
        });
      
      if (error) throw error;
      
      toast({
        title: "Event created successfully!",
        description: "Your event has been created and is ready for ticket generation."
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating event",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const groupedBenefits = benefits.reduce((acc, benefit) => {
    if (!acc[benefit.category]) {
      acc[benefit.category] = [];
    }
    acc[benefit.category].push(benefit);
    return acc;
  }, {} as Record<string, Benefit[]>);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center mb-8">
            <Link to="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground transition-colors mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
          
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Calendar className="w-6 h-6 mr-2" />
                Create New Event
              </CardTitle>
              <CardDescription>
                Set up your event details and configure available benefits for attendees
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Event Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Event Details</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Event Name *</Label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="Enter event name"
                        value={eventData.title}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="location"
                          name="location"
                          placeholder="Event location"
                          value={eventData.location}
                          onChange={handleInputChange}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe your event"
                      value={eventData.description}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="event_date">Start Date & Time *</Label>
                      <Input
                        id="event_date"
                        name="event_date"
                        type="datetime-local"
                        value={eventData.event_date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="event_end_date">End Date & Time</Label>
                      <Input
                        id="event_end_date"
                        name="event_end_date"
                        type="datetime-local"
                        value={eventData.event_end_date}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="max_attendees">Max Attendees</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="max_attendees"
                          name="max_attendees"
                          type="number"
                          placeholder="Optional"
                          value={eventData.max_attendees}
                          onChange={handleInputChange}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sessions */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Sessions</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Session Times</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {sessionOptions.map((session) => (
                          <div key={session} className="flex items-center space-x-2">
                            <Checkbox
                              id={`session-${session}`}
                              checked={eventData.sessions.includes(session)}
                              onCheckedChange={() => handleSessionToggle(session)}
                            />
                            <Label htmlFor={`session-${session}`} className="text-sm">
                              {session}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Session Types</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {sessionTypeOptions.map((sessionType) => (
                          <div key={sessionType} className="flex items-center space-x-2">
                            <Checkbox
                              id={`sessiontype-${sessionType}`}
                              checked={eventData.session_types.includes(sessionType)}
                              onCheckedChange={() => handleSessionTypeToggle(sessionType)}
                            />
                            <Label htmlFor={`sessiontype-${sessionType}`} className="text-sm">
                              {sessionType}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>


                <div className="flex gap-4 pt-6">
                  <Button 
                    type="submit" 
                    className="bg-gradient-primary hover:opacity-90 flex-1" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Event..." : "Create Event"}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link to="/dashboard">Cancel</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;