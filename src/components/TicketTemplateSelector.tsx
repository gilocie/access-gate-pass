import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Palette, Type, Image as ImageIcon } from 'lucide-react';

interface TemplateConfig {
  id: string;
  name: string;
  category: string;
  preview: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

const ticketTemplates: TemplateConfig[] = [
  {
    id: 'corporate',
    name: 'Corporate Professional',
    category: 'business',
    preview: 'bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900',
    colors: { primary: '#1e293b', secondary: '#1e40af', accent: '#FFD700' }
  },
  {
    id: 'conference',
    name: 'Tech Conference',
    category: 'technology',
    preview: 'bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900',
    colors: { primary: '#4c1d95', secondary: '#3730a3', accent: '#34d399' }
  },
  {
    id: 'music',
    name: 'Music Festival',
    category: 'entertainment',
    preview: 'bg-gradient-to-br from-rose-600 via-pink-700 to-purple-800',
    colors: { primary: '#e11d48', secondary: '#be185d', accent: '#FFD700' }
  },
  {
    id: 'sports',
    name: 'Sports Event',
    category: 'sports',
    preview: 'bg-gradient-to-br from-emerald-700 via-green-800 to-teal-800',
    colors: { primary: '#047857', secondary: '#065f46', accent: '#fbbf24' }
  },
  {
    id: 'elegant',
    name: 'Elegant Evening',
    category: 'formal',
    preview: 'bg-gradient-to-br from-black via-gray-900 to-slate-800',
    colors: { primary: '#111827', secondary: '#1f2937', accent: '#d4af37' }
  },
  {
    id: 'wedding',
    name: 'Wedding Celebration',
    category: 'wedding',
    preview: 'bg-gradient-to-br from-rose-300 via-pink-400 to-purple-400',
    colors: { primary: '#fb7185', secondary: '#f472b6', accent: '#fbbf24' }
  },
  {
    id: 'workshop',
    name: 'Educational Workshop',
    category: 'education',
    preview: 'bg-gradient-to-br from-teal-600 via-cyan-700 to-blue-700',
    colors: { primary: '#0f766e', secondary: '#0891b2', accent: '#f59e0b' }
  },
  {
    id: 'party',
    name: 'Party Celebration',
    category: 'party',
    preview: 'bg-gradient-to-br from-amber-400 via-orange-500 to-red-500',
    colors: { primary: '#f59e0b', secondary: '#ea580c', accent: '#dc2626' }
  }
];

interface TicketTemplateSelectorProps {
  onTemplateSelect: (template: TemplateConfig & { customizations: any }) => void;
  onBack: () => void;
  eventCategory?: string;
}

const TicketTemplateSelector: React.FC<TicketTemplateSelectorProps> = ({
  onTemplateSelect,
  onBack,
  eventCategory = ''
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfig | null>(null);
  const [customizations, setCustomizations] = useState({
    logo: null as File | null,
    primaryColor: '#1e40af',
    secondaryColor: '#3b82f6',
    accentColor: '#fbbf24',
    fontFamily: 'Arial',
    backgroundImage: null as File | null,
    backgroundOpacity: 0.3
  });

  const handleTemplateClick = (template: TemplateConfig) => {
    setSelectedTemplate(template);
    setCustomizations(prev => ({
      ...prev,
      primaryColor: template.colors.primary,
      secondaryColor: template.colors.secondary,
      accentColor: template.colors.accent
    }));
  };

  const handleFileUpload = (type: 'logo' | 'backgroundImage', file: File | null) => {
    setCustomizations(prev => ({
      ...prev,
      [type]: file
    }));
  };

  const handleContinue = () => {
    if (selectedTemplate) {
      onTemplateSelect({
        ...selectedTemplate,
        customizations
      });
    }
  };

  const filteredTemplates = ticketTemplates; // Show all templates regardless of category for better UX

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Choose Ticket Template</h3>
        <p className="text-muted-foreground">
          Select a template that matches your event style
        </p>
      </div>

      {/* Template Grid */}
      <div className="grid md:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
        {filteredTemplates.map((template) => (
          <Card 
            key={template.id} 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedTemplate?.id === template.id 
                ? 'ring-2 ring-primary shadow-lg' 
                : 'hover:scale-105'
            }`}
            onClick={() => handleTemplateClick(template)}
          >
            <CardContent className="p-3">
              <div className={`h-32 rounded-lg mb-3 ${template.preview} flex items-center justify-between p-4 relative overflow-hidden`}>
                {/* Background pattern overlay */}
                <div className="absolute inset-0 bg-black/20"></div>
                
                {/* Left side - Event info */}
                <div className="relative z-10 text-white">
                  <div className="text-xs font-bold tracking-wider opacity-80">EVENT</div>
                  <div className="text-lg font-bold">{template.name.split(' ')[0]}</div>
                  <div className="text-xs opacity-70 mt-1">PARTICIPANT NAME</div>
                  <div className="text-xs font-mono mt-1">PIN: 123456</div>
                </div>
                
                {/* Date boxes */}
                <div className="relative z-10 flex items-center gap-2">
                  <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded p-2 text-center">
                    <div className="text-white font-bold text-sm">25</div>
                    <div className="text-white/80 text-xs">DEC</div>
                  </div>
                  <div className="text-white text-xs">TO</div>
                  <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded p-2 text-center">
                    <div className="text-white font-bold text-sm">27</div>
                    <div className="text-white/80 text-xs">DEC</div>
                  </div>
                </div>
                
                {/* QR Code */}
                <div className="relative z-10 bg-white rounded-lg p-2">
                  <div className="w-12 h-12 bg-black/10 rounded grid grid-cols-4 gap-px p-1">
                    {[...Array(16)].map((_, i) => (
                      <div key={i} className={`bg-black ${Math.random() > 0.6 ? 'opacity-100' : 'opacity-20'} rounded-sm`}></div>
                    ))}
                  </div>
                </div>
              </div>
              <h4 className="font-medium text-sm">{template.name}</h4>
              <p className="text-xs text-muted-foreground capitalize">{template.category}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Customization Panel */}
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Palette className="w-5 h-5 mr-2" />
              Customize Template
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Logo Upload */}
            <div className="space-y-2">
              <Label className="flex items-center">
                <Upload className="w-4 h-4 mr-2" />
                Logo Upload
              </Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload('logo', e.target.files?.[0] || null)}
              />
            </div>

            {/* Color Customization */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="color"
                    value={customizations.primaryColor}
                    onChange={(e) => setCustomizations(prev => ({
                      ...prev,
                      primaryColor: e.target.value
                    }))}
                    className="w-12 h-8 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={customizations.primaryColor}
                    onChange={(e) => setCustomizations(prev => ({
                      ...prev,
                      primaryColor: e.target.value
                    }))}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Secondary Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="color"
                    value={customizations.secondaryColor}
                    onChange={(e) => setCustomizations(prev => ({
                      ...prev,
                      secondaryColor: e.target.value
                    }))}
                    className="w-12 h-8 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={customizations.secondaryColor}
                    onChange={(e) => setCustomizations(prev => ({
                      ...prev,
                      secondaryColor: e.target.value
                    }))}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Accent Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="color"
                    value={customizations.accentColor}
                    onChange={(e) => setCustomizations(prev => ({
                      ...prev,
                      accentColor: e.target.value
                    }))}
                    className="w-12 h-8 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={customizations.accentColor}
                    onChange={(e) => setCustomizations(prev => ({
                      ...prev,
                      accentColor: e.target.value
                    }))}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Font Selection */}
            <div className="space-y-2">
              <Label className="flex items-center">
                <Type className="w-4 h-4 mr-2" />
                Font Family
              </Label>
              <Select 
                value={customizations.fontFamily} 
                onValueChange={(value) => setCustomizations(prev => ({
                  ...prev,
                  fontFamily: value
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Georgia">Georgia</SelectItem>
                  <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                  <SelectItem value="Helvetica">Helvetica</SelectItem>
                  <SelectItem value="Verdana">Verdana</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Background Image */}
            <div className="space-y-2">
              <Label className="flex items-center">
                <ImageIcon className="w-4 h-4 mr-2" />
                Background Image (Optional)
              </Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload('backgroundImage', e.target.files?.[0] || null)}
              />
              {customizations.backgroundImage && (
                <div className="space-y-2">
                  <Label>Background Opacity: {Math.round(customizations.backgroundOpacity * 100)}%</Label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={customizations.backgroundOpacity}
                    onChange={(e) => setCustomizations(prev => ({
                      ...prev,
                      backgroundOpacity: parseFloat(e.target.value)
                    }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label>Template Preview</Label>
              <div 
                className="h-32 rounded-lg flex items-center justify-center text-white font-semibold"
                style={{
                  background: `linear-gradient(135deg, ${customizations.primaryColor}, ${customizations.secondaryColor})`,
                  fontFamily: customizations.fontFamily
                }}
              >
                <div className="text-center">
                  <div className="text-lg">EVENT TICKET</div>
                  <div className="text-sm opacity-80">Preview</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={handleContinue}
          disabled={!selectedTemplate}
          className="flex-1 bg-gradient-primary hover:opacity-90"
        >
          Continue to Details
        </Button>
      </div>
    </div>
  );
};

export default TicketTemplateSelector;