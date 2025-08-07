import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: 19,
      period: "month",
      description: "Perfect for small events and getting started",
      popular: false,
      features: [
        "Up to 100 tickets per event",
        "2 events per month",
        "Basic QR code security",
        "Email support",
        "Basic analytics",
        "Mobile app access",
        "Standard templates"
      ]
    },
    {
      name: "Professional",
      price: 49,
      period: "month",
      description: "Ideal for regular event organizers",
      popular: true,
      features: [
        "Up to 500 tickets per event",
        "Unlimited events",
        "Advanced QR code + PIN security",
        "Priority support",
        "Advanced analytics & reporting",
        "Custom branding",
        "Benefit tracking",
        "API access",
        "Team collaboration"
      ]
    },
    {
      name: "Enterprise",
      price: 149,
      period: "month",
      description: "For large organizations and agencies",
      popular: false,
      features: [
        "Unlimited tickets per event",
        "Unlimited events",
        "Enterprise security features",
        "24/7 dedicated support",
        "Custom integrations",
        "White-label solution",
        "Advanced benefit management",
        "Custom reporting",
        "Account manager",
        "SLA guarantee"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-background to-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Simple, Transparent
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              Pricing
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Choose the perfect plan for your event management needs. No hidden fees, 
            cancel anytime, and upgrade or downgrade as you grow.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`glass relative hover:shadow-lg transition-all duration-300 ${
                  plan.popular ? 'ring-2 ring-primary scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-primary">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {plan.description}
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-gradient-primary hover:opacity-90' 
                        : 'border border-primary text-primary hover:bg-primary hover:text-primary-foreground'
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                    asChild
                  >
                    <Link to="/auth">
                      Get Started
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to know about our pricing and plans.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and billing is prorated.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Is there a free trial?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes, all plans come with a 14-day free trial. No credit card required to get started.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                <p className="text-sm text-muted-foreground">
                  We accept all major credit cards, PayPal, and bank transfers for enterprise accounts.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">What happens if I exceed my limits?</h3>
                <p className="text-sm text-muted-foreground">
                  We'll notify you before you reach your limits and help you upgrade to accommodate your needs.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Do you offer custom plans?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes, we offer custom enterprise plans for large organizations with specific requirements.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Is my data secure?</h3>
                <p className="text-sm text-muted-foreground">
                  Absolutely. We use enterprise-grade security and encryption to protect all your data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;