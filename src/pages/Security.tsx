import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Lock, 
  Key, 
  Server, 
  Eye, 
  FileCheck, 
  UserCheck, 
  AlertTriangle,
  CheckCircle,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Security = () => {
  const securityFeatures = [
    {
      icon: Lock,
      title: "End-to-End Encryption",
      description: "All data is encrypted in transit and at rest using AES-256 encryption standards.",
      color: "bg-gradient-primary"
    },
    {
      icon: Key,
      title: "Unique QR Codes",
      description: "Each ticket generates a unique, encrypted QR code that cannot be duplicated or counterfeited.",
      color: "bg-gradient-accent"
    },
    {
      icon: Shield,
      title: "PIN Protection",
      description: "6-digit PIN codes provide additional security layer for benefit access and verification.",
      color: "bg-success"
    },
    {
      icon: UserCheck,
      title: "Identity Verification",
      description: "Multi-factor authentication and identity verification to prevent unauthorized access.",
      color: "bg-warning"
    },
    {
      icon: Server,
      title: "Secure Infrastructure",
      description: "Hosted on enterprise-grade cloud infrastructure with 99.9% uptime guarantee.",
      color: "bg-destructive"
    },
    {
      icon: Eye,
      title: "Real-time Monitoring",
      description: "24/7 security monitoring and threat detection to prevent fraud and abuse.",
      color: "bg-primary"
    }
  ];

  const certifications = [
    {
      name: "SOC 2 Type II",
      description: "Security, availability, and confidentiality compliance"
    },
    {
      name: "GDPR Compliant",
      description: "European data protection regulation compliance"
    },
    {
      name: "ISO 27001",
      description: "International security management standard"
    },
    {
      name: "PCI DSS",
      description: "Payment card industry data security standard"
    }
  ];

  const threatProtection = [
    "Fraud detection and prevention",
    "DDoS attack protection",
    "SQL injection prevention",
    "Cross-site scripting (XSS) protection",
    "Brute force attack detection",
    "Automated threat response"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-background to-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-success/10 text-success text-sm font-medium mb-6">
            <Shield className="w-4 h-4 mr-2" />
            Enterprise-Grade Security
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Security You Can
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              Trust
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Your events and attendee data are protected by industry-leading security measures, 
            ensuring complete privacy and fraud prevention.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-primary hover:opacity-90" asChild>
              <Link to="/auth">Get Started Securely</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/features">View All Features</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Advanced Security Features</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Multi-layered security architecture designed to protect your events from fraud and cyber threats.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityFeatures.map((feature, index) => (
              <Card key={index} className="glass hover:shadow-lg transition-all duration-300">
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

      {/* Threat Protection */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 flex items-center">
                <AlertTriangle className="w-8 h-8 text-warning mr-3" />
                Threat Protection
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Our security system actively monitors and protects against various types of 
                cyber threats and fraudulent activities in real-time.
              </p>
              
              <div className="space-y-4">
                {threatProtection.map((threat, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{threat}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <Card className="glass p-8">
              <div className="text-center mb-6">
                <Zap className="w-12 h-12 text-warning mx-auto mb-4" />
                <h3 className="text-xl font-bold">Real-time Protection</h3>
                <p className="text-muted-foreground">Active monitoring and response</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 rounded-lg bg-background/50">
                  <div className="text-2xl font-bold text-success">99.9%</div>
                  <div className="text-sm text-muted-foreground">Threat Detection</div>
                </div>
                
                <div className="p-4 rounded-lg bg-background/50">
                  <div className="text-2xl font-bold text-warning">&lt; 1s</div>
                  <div className="text-sm text-muted-foreground">Response Time</div>
                </div>
                
                <div className="p-4 rounded-lg bg-background/50">
                  <div className="text-2xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-muted-foreground">Monitoring</div>
                </div>
                
                <div className="p-4 rounded-lg bg-background/50">
                  <div className="text-2xl font-bold text-accent">0</div>
                  <div className="text-sm text-muted-foreground">Data Breaches</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Compliance & Certifications */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center">
              <FileCheck className="w-8 h-8 text-primary mr-3" />
              Compliance & Certifications
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We meet and exceed industry standards for security, privacy, and compliance.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {certifications.map((cert, index) => (
              <Card key={index} className="glass text-center p-6 hover:shadow-lg transition-all duration-300">
                <Badge variant="outline" className="mb-4">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Certified
                </Badge>
                <h3 className="font-semibold mb-2">{cert.name}</h3>
                <p className="text-sm text-muted-foreground">{cert.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Secure Your Events?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Join thousands of event organizers who trust GoPass with their most important events.
            </p>
            <Button size="lg" className="bg-gradient-primary hover:opacity-90" asChild>
              <Link to="/auth">Start Free Trial</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Security;