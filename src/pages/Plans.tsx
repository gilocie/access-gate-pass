import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, Zap, Crown, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';

const Plans = () => {
  const plans = [
    {
      name: 'Basic',
      price: '$9',
      period: '/month',
      description: 'Perfect for small events and getting started',
      features: [
        'Up to 5 events per month',
        '100 tickets per event',
        'Basic QR code scanning',
        'Email support',
        'Standard templates'
      ],
      current: true,
      icon: <Zap className="w-6 h-6" />
    },
    {
      name: 'Pro',
      price: '$29',
      period: '/month',
      description: 'Great for growing businesses and regular events',
      features: [
        'Up to 25 events per month',
        '1,000 tickets per event',
        'Advanced QR code features',
        'Priority email support',
        'Custom templates',
        'Analytics dashboard',
        'Bulk ticket generation'
      ],
      recommended: true,
      icon: <Crown className="w-6 h-6" />
    },
    {
      name: 'Enterprise',
      price: '$99',
      period: '/month',
      description: 'For large organizations with complex needs',
      features: [
        'Unlimited events',
        'Unlimited tickets',
        'White-label solution',
        '24/7 phone support',
        'Custom integrations',
        'Advanced analytics',
        'Multi-user accounts',
        'API access'
      ],
      icon: <Star className="w-6 h-6" />
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-8">
            <Link to="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground transition-colors mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
          
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Select the perfect plan for your event management needs. Upgrade or downgrade anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative glass ${plan.recommended ? 'ring-2 ring-primary' : ''}`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-primary text-white px-4 py-1">
                      Recommended
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-full ${plan.recommended ? 'bg-gradient-primary text-white' : 'bg-muted'}`}>
                      {plan.icon}
                    </div>
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-4xl font-bold">
                    {plan.price}
                    <span className="text-lg font-normal text-muted-foreground">
                      {plan.period}
                    </span>
                  </div>
                  <CardDescription className="text-center">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${
                      plan.current 
                        ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                        : plan.recommended 
                          ? 'bg-gradient-primary hover:opacity-90' 
                          : 'bg-gradient-primary hover:opacity-90'
                    }`}
                    disabled={plan.current}
                  >
                    {plan.current ? 'Current Plan' : `Upgrade to ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Need a custom solution? Contact our sales team.
            </p>
            <Button variant="outline">
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plans;