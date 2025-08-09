import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Ticket, 
  QrCode, 
  Shield, 
  Users, 
  BarChart3, 
  Smartphone, 
  Globe, 
  Zap,
  CheckCircle,
  Clock,
  Lock,
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Features = () => {
  const features = [
    {
      icon: Ticket,
      title: "Branded Tickets",
      description: "Create professional, customized tickets with your logo, colors, and branding. Stand out with beautiful designs that reflect your event's identity.",
      color: "bg-gradient-primary"
    },
    {
      icon: QrCode,
      title: "QR Code Security",
      description: "Each ticket comes with a unique, encrypted QR code that prevents counterfeiting and ensures secure entry to your events.",
      color: "bg-gradient-accent"
    },
    {
      icon: Shield,
      title: "PIN Protection",
      description: "6-digit PIN codes provide an additional layer of security, making it impossible for unauthorized users to access benefits.",
      color: "bg-warning"
    },
    {
      icon: Users,
      title: "Benefit Tracking",
      description: "Track and manage attendee benefits in real-time. Monitor meals, accommodations, sessions, and more with detailed analytics.",
      color: "bg-success"
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Get instant insights into ticket sales, attendee check-ins, and benefit utilization with comprehensive dashboard analytics.",
      color: "bg-destructive"
    },
    {
      icon: Smartphone,
      title: "Mobile-First Design",
      description: "Optimized for mobile devices, ensuring seamless experience for both organizers and attendees on any device.",
      color: "bg-primary"
    },
    {
      icon: Globe,
      title: "Global Access",
      description: "Cloud-based platform accessible from anywhere in the world, with multi-language support and international payment processing.",
      color: "bg-secondary"
    },
    {
      icon: Zap,
      title: "Instant Setup",
      description: "Create and launch your event in minutes. Our intuitive interface makes event management fast and effortless.",
      color: "bg-accent"
    }
  ];

  const benefits = [
    "Reduce fraud with secure QR codes and PIN protection",
    "Streamline check-in process with mobile scanning",
    "Track attendee engagement and benefit utilization",
    "Professional branding that enhances your event image",
    "Real-time reporting and analytics dashboard",
    "24/7 customer support and assistance"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-background to-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Powerful Features for
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              Modern Event Management
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Discover how GoPass revolutionizes event ticketing with cutting-edge security, 
            seamless user experience, and comprehensive management tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-primary hover:opacity-90" asChild>
              <Link to="/auth">Get Started Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Comprehensive event management features designed to make your events successful and secure.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="glass hover:shadow-lg transition-all duration-300 animate-fade-in">
                <CardHeader className="text-center">
                  <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Why Choose GoPass?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-3xl mx-auto">
              Join thousands of event organizers who trust GoPass to deliver 
              secure, professional, and efficient event management solutions.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              
              <div className="grid md:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-foreground text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <Button size="lg" className="bg-gradient-primary hover:opacity-90" asChild>
                  <Link to="/auth">Start Your Free Trial</Link>
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Card className="glass p-6 text-center">
                <Clock className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">5 Minutes</h3>
                <p className="text-sm text-muted-foreground">Average setup time</p>
              </Card>
              
              <Card className="glass p-6 text-center">
                <Lock className="w-8 h-8 text-success mx-auto mb-3" />
                <h3 className="font-semibold mb-2">99.9%</h3>
                <p className="text-sm text-muted-foreground">Security rate</p>
              </Card>
              
              <Card className="glass p-6 text-center">
                <Users className="w-8 h-8 text-warning mx-auto mb-3" />
                <h3 className="font-semibold mb-2">50K+</h3>
                <p className="text-sm text-muted-foreground">Events managed</p>
              </Card>
              
              <Card className="glass p-6 text-center">
                <Award className="w-8 h-8 text-accent mx-auto mb-3" />
                <h3 className="font-semibold mb-2">4.9/5</h3>
                <p className="text-sm text-muted-foreground">Customer rating</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Features;