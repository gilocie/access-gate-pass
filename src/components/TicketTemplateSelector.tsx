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
    preview: 'bg-gradient-to-r from-blue-600 to-blue-800',
    colors: { primary: '#1e40af', secondary: '#3b82f6', accent: '#fbbf24' }
  },
  {
    id: 'conference',
    name: 'Tech Conference',
    category: 'technology',
    preview: 'bg-gradient-to-r from-purple-600 to-indigo-600',
    colors: { primary: '#7c3aed', secondary: '#a855f7', accent: '#10b981' }
  },
  {
    id: 'music',
    name: 'Music Festival',
    category: 'entertainment',
    preview: 'bg-gradient-to-r from-pink-500 to-rose-500',
    colors: { primary: '#ec4899', secondary: '#f43f5e', accent: '#fbbf24' }
  },
  {
    id: 'sports',
    name: 'Sports Event',
    category: 'sports',
    preview: 'bg-gradient-to-r from-green-600 to-emerald-600',
    colors: { primary: '#059669', secondary: '#10b981', accent: '#f59e0b' }
  },
  {
    id: 'workshop',
    name: 'Workshop & Training',
    category: 'education',
    preview: 'bg-gradient-to-r from-orange-500 to-amber-500',
    colors: { primary: '#ea580c', secondary: '#f59e0b', accent: '#3b82f6' }
  },
  {
    id: 'gala',
    name: 'Elegant Gala',
    category: 'formal',
    preview: 'bg-gradient-to-r from-slate-800 to-slate-900',
    colors: { primary: '#1e293b', secondary: '#475569', accent: '#fbbf24' }
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
    backgroundImage: null as File | null
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

  const filteredTemplates = eventCategory 
    ? ticketTemplates.filter(t => t.category === eventCategory.toLowerCase())
    : ticketTemplates;

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
              <div className={`h-24 rounded-md mb-3 ${template.preview} flex items-center justify-center`}>
                <div className="text-white text-sm font-semibold">TICKET</div>
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