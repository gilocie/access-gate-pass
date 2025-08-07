import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, Plus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';

interface EventBenefit {
  id: string;
  name: string;
  category: string;
  description: string;
}

const CreateEvent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [benefits, setBenefits] = useState<EventBenefit[]>([]);
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    eventEndDate: '',
    location: '',
    maxAttendees: '',
    ticketPrice: '',
    companyName: ''
  });

  useEffect(() => {
    fetchBenefits();
  }, []);

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
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleBenefitToggle = (benefitName: string) => {
    setSelectedBenefits(prev => 
      prev.includes(benefitName)
        ? prev.filter(b => b !== benefitName)
        : [...prev, benefitName]
    );
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
          title: formData.title,
          description: formData.description,
          event_date: formData.eventDate,
          event_end_date: formData.eventEndDate || null,
          location: formData.location,
          max_attendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null,
          ticket_price: formData.ticketPrice ? parseFloat(formData.ticketPrice) : 0,
          company_name: formData.companyName,
          available_benefits: selectedBenefits
        });
      
      if (error) throw error;
      
      toast({
        title: "Event created successfully!",
        description: "Your event has been created and is ready for attendees."
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

  const benefitsByCategory = benefits.reduce((acc, benefit) => {
    if (!acc[benefit.category]) {
      acc[benefit.category] = [];
    }
    acc[benefit.category].push(benefit);
    return acc;
  }, {} as Record<string, EventBenefit[]>);

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
                <Plus className="w-6 h-6 mr-2" />
                Create New Event
              </CardTitle>
              <CardDescription>
                Set up your event details and select available benefits for attendees
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Enter event title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      placeholder="Enter company name"
                      value={formData.companyName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your event"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="eventDate">Start Date & Time *</Label>
                    <Input
                      id="eventDate"
                      name="eventDate"
                      type="datetime-local"
                      value={formData.eventDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="eventEndDate">End Date & Time</Label>
                    <Input
                      id="eventEndDate"
                      name="eventEndDate"
                      type="datetime-local"
                      value={formData.eventEndDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="Enter event location"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="maxAttendees">Maximum Attendees</Label>
                    <Input
                      id="maxAttendees"
                      name="maxAttendees"
                      type="number"
                      placeholder="Enter max attendees"
                      value={formData.maxAttendees}
                      onChange={handleInputChange}
                      min="1"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ticketPrice">Ticket Price ($)</Label>
                    <Input
                      id="ticketPrice"
                      name="ticketPrice"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.ticketPrice}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Available Benefits</Label>
                  <p className="text-sm text-muted-foreground">
                    Select the benefits that will be available to attendees
                  </p>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(benefitsByCategory).map(([category, categoryBenefits]) => (
                      <Card key={category} className="p-4">
                        <h4 className="font-semibold mb-3 text-primary">{category}</h4>
                        <div className="space-y-2">
                          {categoryBenefits.map((benefit) => (
                            <div key={benefit.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={benefit.id}
                                checked={selectedBenefits.includes(benefit.name)}
                                onCheckedChange={() => handleBenefitToggle(benefit.name)}
                              />
                              <Label 
                                htmlFor={benefit.id} 
                                className="text-sm cursor-pointer"
                                title={benefit.description}
                              >
                                {benefit.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))}
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
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/dashboard')}
                  >
                    Cancel
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