
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  QrCode, 
  Shield, 
  BarChart3, 
  Smartphone, 
  Lock,
  Users,
  Ticket,
  CheckCircle
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Upload,
      title: 'Easy Attendee Management',
      description: 'Upload CSV files or add attendees manually. Assign benefits, PINs, and ticket types effortlessly.',
      color: 'bg-blue-500',
      benefits: ['CSV Upload', 'Manual Entry', 'Bulk Operations', 'Custom Fields']
    },
    {
      icon: QrCode,
      title: 'Secure QR Generation',
      description: 'Generate unique, encrypted QR codes for each attendee with tamper-proof security.',
      color: 'bg-purple-500',
      benefits: ['Unique Codes', 'Encryption', 'Anti-fraud', 'Real-time Verification']
    },
    {
      icon: Shield,
      title: 'PIN-Protected Access',
      description: 'Each ticket is protected by a personal PIN, preventing unauthorized access and sharing.',
      color: 'bg-green-500',
      benefits: ['Personal PINs', 'Access Control', 'Reset Options', 'Secure Viewing']
    },
    {
      icon: BarChart3,
      title: 'Real-Time Analytics',
      description: 'Track benefit usage, attendance patterns, and event insights in real-time dashboards.',
      color: 'bg-orange-500',
      benefits: ['Live Tracking', 'Usage Reports', 'Attendance Data', 'Export Options']
    },
    {
      icon: Smartphone,
      title: 'Mobile Scanner',
      description: 'Staff-friendly mobile interface for quick QR scanning and benefit verification.',
      color: 'bg-pink-500',
      benefits: ['Mobile Optimized', 'Quick Scan', 'Offline Mode', 'Staff Dashboard']
    },
    {
      icon: Lock,
      title: 'Benefit Control',
      description: 'Track meals, sessions, accommodations, and custom benefits with one-time usage limits.',
      color: 'bg-teal-500',
      benefits: ['Custom Benefits', 'Usage Limits', 'Multi-day Events', 'Flexible Rules']
    }
  ];

  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="secondary">
            Powerful Features
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Everything You Need for
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              Professional Events
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools to manage attendees, generate secure tickets, and track benefit usage in real-time.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 group">
              <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">{feature.description}</p>
              <div className="space-y-2">
                {feature.benefits.map((benefit, benefitIndex) => (
                  <div key={benefitIndex} className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-success mr-2" />
                    {benefit}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Process Flow */}
        <div className="bg-card rounded-2xl p-8 glass">
          <h3 className="text-2xl font-bold text-center mb-8">How GoPass Works</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold mb-2">1. Upload Attendees</h4>
              <p className="text-sm text-muted-foreground">Import your attendee list via CSV or add manually</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Ticket className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold mb-2">2. Generate Tickets</h4>
              <p className="text-sm text-muted-foreground">Create branded, secure tickets with QR codes</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold mb-2">3. Scan & Verify</h4>
              <p className="text-sm text-muted-foreground">Staff scan QR codes to verify and track benefits</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-warning rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold mb-2">4. Track Analytics</h4>
              <p className="text-sm text-muted-foreground">Monitor usage and get insights in real-time</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
