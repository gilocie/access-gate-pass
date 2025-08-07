
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Crown } from 'lucide-react';

const Pricing = () => {
  const plans = [
    {
      name: 'Starter',
      price: '29',
      period: 'month',
      description: 'Perfect for small events and getting started',
      icon: Zap,
      color: 'bg-blue-500',
      features: [
        'Up to 100 tickets per month',
        '2 active events',
        'Basic QR code generation',
        'PIN protection',
        'Email support',
        'Mobile scanner',
        'Basic analytics'
      ],
      popular: false
    },
    {
      name: 'Professional',
      price: '79',
      period: 'month', 
      description: 'For growing events and professional organizers',
      icon: Star,
      color: 'bg-gradient-primary',
      features: [
        'Up to 500 tickets per month',
        '10 active events',
        'Advanced QR security',
        'Custom branding',
        'Priority support',
        'Advanced analytics',
        'CSV bulk upload',
        'Benefit tracking',
        'Staff management'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: '199',
      period: 'month',
      description: 'For large events and enterprise organizations',
      icon: Crown,
      color: 'bg-purple-600',
      features: [
        'Unlimited tickets',
        'Unlimited events',
        'White-label options',
        'API access',
        'Custom integrations',
        'Dedicated support',
        'Advanced security',
        'Multi-user accounts',
        'Custom reporting',
        'SLA guarantee'
      ],
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="secondary">
            Simple Pricing
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Choose Your Plan
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            No hidden fees. Cancel anytime. 14-day free trial on all plans.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`p-8 relative hover:shadow-xl transition-all duration-300 ${
                plan.popular ? 'ring-2 ring-primary scale-105' : ''
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-primary text-white">
                  Most Popular
                </Badge>
              )}
              
              <div className="text-center mb-8">
                <div className={`w-16 h-16 ${plan.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <plan.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-center justify-center mb-2">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground ml-2">/{plan.period}</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center">
                    <Check className="w-5 h-5 text-success mr-3" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                size="lg" 
                className={`w-full ${
                  plan.popular 
                    ? 'bg-gradient-primary hover:opacity-90' 
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                } transition-all`}
              >
                Start Free Trial
              </Button>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Need a custom solution for your organization?
          </p>
          <Button variant="outline" size="lg">
            Contact Sales
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
