
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Shield, Ticket, QrCode, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="pt-24 pb-16 bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
            <Shield className="w-4 h-4 mr-2" />
            Secure Event Ticketing & Access Control
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance animate-slide-up">
            Professional Event
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              Ticketing Made Simple
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed animate-slide-up">
            Create secure, branded tickets with QR codes. Track attendee benefits in real-time. 
            Eliminate fraud with PIN-protected access. Perfect for conferences, events, and gatherings.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in">
            <Button size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity text-lg px-8 py-3" asChild>
              <Link to="/auth">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3" asChild>
              <Link to="/features">
                Watch Demo
              </Link>
            </Button>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="glass p-6 text-center hover:shadow-lg transition-all duration-300 animate-fade-in">
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Branded Tickets</h3>
            <p className="text-sm text-muted-foreground">Custom designs with your logo and colors</p>
          </Card>
          
          <Card className="glass p-6 text-center hover:shadow-lg transition-all duration-300 animate-fade-in">
            <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">QR Code Security</h3>
            <p className="text-sm text-muted-foreground">Unique encrypted codes for each attendee</p>
          </Card>
          
          <Card className="glass p-6 text-center hover:shadow-lg transition-all duration-300 animate-fade-in">
            <div className="w-12 h-12 bg-success rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Benefit Tracking</h3>
            <p className="text-sm text-muted-foreground">Track meals, sessions, and accommodations</p>
          </Card>
          
          <Card className="glass p-6 text-center hover:shadow-lg transition-all duration-300 animate-fade-in">
            <div className="w-12 h-12 bg-warning rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">PIN Protection</h3>
            <p className="text-sm text-muted-foreground">Secure access with personal PINs</p>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="inline-block p-8 glass rounded-2xl animate-scale-in">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-6">Join thousands of event organizers who trust GoPass</p>
            <Button size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity animate-pulse-glow">
              Create Your First Event
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
