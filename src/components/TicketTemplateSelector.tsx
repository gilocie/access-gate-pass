import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Palette, Type, Image as ImageIcon, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import TicketDesignerModal from './TicketDesignerModal';

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
  const [customTemplates, setCustomTemplates] = useState<any[]>([]);
  const [showDesigner, setShowDesigner] = useState(false);
  const [customizations, setCustomizations] = useState({
    logo: null as File | null,
    primaryColor: '#1e40af',
    secondaryColor: '#3b82f6',
    accentColor: '#fbbf24',
    fontFamily: 'Arial',
    backgroundImage: null as File | null,
    backgroundOpacity: 0.3
  });

  useEffect(() => {
    loadCustomTemplates();
  }, []);

  const loadCustomTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_ticket_templates')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setCustomTemplates(data || []);
    } catch (error) {
      console.error('Error loading custom templates:', error);
    }
  };

  const handleTemplateClick = (template: TemplateConfig) => {
    setSelectedTemplate(template);
    setCustomizations(prev => ({
      ...prev,
      primaryColor: template.colors.primary,
      secondaryColor: template.colors.secondary,
      accentColor: template.colors.accent
    }));
  };

  const handleCustomTemplateClick = (template: any) => {
    onTemplateSelect({
      id: template.id,
      name: template.name,
      category: template.category,
      preview: '',
      colors: { primary: '#1e293b', secondary: '#3b82f6', accent: '#fbbf24' },
      customizations: {
        elements: template.elements,
        canvasSize: { width: template.canvas_width, height: template.canvas_height },
        backgroundColor: template.background_color,
        backgroundImage: template.background_image_url,
        isCustomTemplate: true,
        customTemplateId: template.id
      }
    });
  };

  const handleTemplateCreated = (template: any) => {
    loadCustomTemplates(); // Reload templates after creation
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
          Select a template or create your own custom design
        </p>
        <Button 
          onClick={() => setShowDesigner(true)}
          className="mt-4 bg-gradient-primary hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Custom Template
        </Button>
      </div>

      {/* Custom Templates */}
      {customTemplates.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Custom Templates</h4>
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6 max-h-60 overflow-y-auto">
          {customTemplates.map((template) => (
            <Card 
              key={template.id} 
              className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
              onClick={() => handleCustomTemplateClick(template)}
            >
              <CardContent className="p-3">
                <div 
                  className="relative overflow-hidden rounded-lg mb-3 mx-auto border"
                  style={{ 
                    width: '605px', 
                    height: '151px',
                      backgroundColor: template.background_color || '#1e293b',
                      backgroundImage: template.background_image_url ? `url(${template.background_image_url})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    {template.elements.map((element: any, index: number) => (
                      <div
                        key={index}
                        style={{
                          position: 'absolute',
                          left: element.x,
                          top: element.y,
                          width: element.width,
                          height: element.height,
                          fontSize: `${(element.fontSize || 16) * 0.8}px`,
                          fontFamily: element.fontFamily,
                          color: element.color,
                          backgroundColor: element.backgroundColor !== 'transparent' ? element.backgroundColor : undefined,
                          borderRadius: element.borderRadius,
                          textAlign: element.textAlign,
                          fontWeight: element.fontWeight,
                          transform: `rotate(${element.rotation || 0}deg)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: element.textAlign === 'center' ? 'center' : element.textAlign === 'right' ? 'flex-end' : 'flex-start',
                          padding: '2px'
                        }}
                      >
                        {element.type === 'qr-code' ? (
                          <div className="w-full h-full bg-white rounded p-1 flex items-center justify-center">
                            <div className="w-full h-full grid grid-cols-6 gap-px">
                              {[...Array(36)].map((_, i) => (
                                <div 
                                  key={i} 
                                  className={`bg-black ${Math.random() > 0.6 ? 'opacity-100' : 'opacity-0'}`}
                                />
                              ))}
                            </div>
                          </div>
                        ) : element.type === 'logo' ? (
                          <div className="w-full h-full bg-white/90 rounded flex items-center justify-center">
                            {element.imageUrl ? (
                              <img src={element.imageUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                            ) : (
                              <div className="text-xs font-bold text-gray-700">LOGO</div>
                            )}
                          </div>
                        ) : (
                          <span>{element.content}</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <h4 className="font-medium text-sm">{template.name}</h4>
                  <p className="text-xs text-muted-foreground capitalize">{template.category}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Built-in Template Grid */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium">Built-in Templates</h4>
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6 max-h-60 overflow-y-auto">
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
              <div className={`${template.preview} relative overflow-hidden rounded-lg mb-3 mx-auto`}
                   style={{ width: '605px', height: '151px' }}>
                {/* Background pattern overlay */}
                <div className="absolute inset-0 bg-black/30"></div>
                
                {/* Logo area */}
                <div className="absolute top-3 left-3 bg-white/90 rounded-lg p-2 w-20 h-16 flex items-center justify-center">
                  <div className="text-xs font-bold text-gray-700">LOGO</div>
                </div>
                
                {/* Event name - large yellow/accent text */}
                <div className="absolute top-4 left-24 right-20">
                  <div 
                    className="text-lg font-bold tracking-wider"
                    style={{ color: template.colors.accent }}
                  >
                    EVENT NAME
                  </div>
                  <div className="text-white text-sm mt-1">
                    TICKET USER NAME
                  </div>
                </div>
                
                {/* Date section */}
                <div className="absolute bottom-16 left-6 flex items-center gap-2">
                  <div 
                    className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center border-2"
                    style={{ borderColor: template.colors.accent }}
                  >
                    <div 
                      className="font-bold text-sm"
                      style={{ color: template.colors.accent }}
                    >
                      04
                    </div>
                    <div className="text-white text-xs">AUG</div>
                  </div>
                  <div className="text-white text-xs font-bold">TO</div>
                  <div 
                    className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center border-2"
                    style={{ borderColor: template.colors.accent }}
                  >
                    <div 
                      className="font-bold text-sm"
                      style={{ color: template.colors.accent }}
                    >
                      10
                    </div>
                    <div className="text-white text-xs">AUG</div>
                  </div>
                </div>
                
                {/* Status and Benefits */}
                <div className="absolute bottom-16 left-40">
                  <div 
                    className="text-sm font-bold"
                    style={{ color: template.colors.accent }}
                  >
                    STATUS
                  </div>
                  <div className="text-green-400 text-xs font-bold">VALID</div>
                </div>
                
                <div className="absolute bottom-16 left-56">
                  <div 
                    className="text-sm font-bold"
                    style={{ color: template.colors.accent }}
                  >
                    B USED
                  </div>
                  <div className="text-white text-xs font-bold">2/7</div>
                </div>
                
                {/* Bottom info */}
                <div className="absolute bottom-4 left-6">
                  <div 
                    className="text-xs font-bold"
                    style={{ color: template.colors.accent }}
                  >
                    PIN CODE:
                  </div>
                  <div className="text-white text-xs font-mono">123456</div>
                </div>
                
                <div className="absolute bottom-4 left-32">
                  <div 
                    className="text-xs font-bold"
                    style={{ color: template.colors.accent }}
                  >
                    REMAINING DAYS:
                  </div>
                  <div className="text-white text-xs">6 Days</div>
                </div>
                
                {/* QR Code */}
                <div className="absolute top-4 right-4 bg-white rounded-lg p-2 w-20 h-20 flex items-center justify-center">
                  <div className="w-16 h-16 grid grid-cols-8 gap-px">
                    {[...Array(64)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`bg-black ${
                          [0,1,2,3,4,5,6,7,8,14,16,22,24,30,32,38,40,46,48,54,56,57,58,59,60,61,62,63].includes(i) ||
                          Math.random() > 0.65 ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
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

            {/* Live Preview with Selected Template */}
            <div className="space-y-2">
              <Label>Live Template Preview</Label>
              <div 
                className="h-48 rounded-lg relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${customizations.primaryColor}, ${customizations.secondaryColor})`,
                  fontFamily: customizations.fontFamily
                }}
              >
                {/* Background overlay */}
                <div className="absolute inset-0 bg-black/30"></div>
                
                {/* Logo area */}
                <div className="absolute top-4 left-4 bg-white/90 rounded-lg p-2 w-20 h-16 flex items-center justify-center">
                  <div className="text-xs font-bold text-gray-700">LOGO</div>
                </div>
                
                {/* Event name */}
                <div className="absolute top-6 left-28 right-24">
                  <div 
                    className="text-2xl font-bold tracking-wider"
                    style={{ color: customizations.accentColor }}
                  >
                    EVENT NAME
                  </div>
                  <div className="text-white text-sm mt-1">
                    TICKET USER NAME
                  </div>
                </div>
                
                {/* Date section */}
                <div className="absolute bottom-20 left-6 flex items-center gap-3">
                  <div 
                    className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center border-2"
                    style={{ borderColor: customizations.accentColor }}
                  >
                    <div 
                      className="font-bold text-lg"
                      style={{ color: customizations.accentColor }}
                    >
                      04
                    </div>
                    <div className="text-white text-xs">AUG</div>
                    <div className="text-white text-xs">2025</div>
                  </div>
                  <div className="text-white text-sm font-bold">TO</div>
                  <div 
                    className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center border-2"
                    style={{ borderColor: customizations.accentColor }}
                  >
                    <div 
                      className="font-bold text-lg"
                      style={{ color: customizations.accentColor }}
                    >
                      10
                    </div>
                    <div className="text-white text-xs">AUG</div>
                    <div className="text-white text-xs">2025</div>
                  </div>
                </div>
                
                {/* Status and Benefits */}
                <div className="absolute bottom-20 left-56">
                  <div 
                    className="text-sm font-bold"
                    style={{ color: customizations.accentColor }}
                  >
                    STATUS
                  </div>
                  <div className="text-green-400 text-xs font-bold">VALID</div>
                </div>
                
                <div className="absolute bottom-20 left-80">
                  <div 
                    className="text-sm font-bold"
                    style={{ color: customizations.accentColor }}
                  >
                    B USED
                  </div>
                  <div className="text-white text-xs font-bold">2/7</div>
                </div>
                
                {/* Bottom info */}
                <div className="absolute bottom-4 left-6">
                  <div 
                    className="text-xs font-bold"
                    style={{ color: customizations.accentColor }}
                  >
                    PIN CODE: 
                    <span className="text-white font-mono ml-1">123456</span>
                  </div>
                </div>
                
                <div className="absolute bottom-4 left-40">
                  <div 
                    className="text-xs font-bold"
                    style={{ color: customizations.accentColor }}
                  >
                    REMAINING DAYS: 
                    <span className="text-white ml-1">6 Days</span>
                  </div>
                </div>
                
                {/* QR Code */}
                <div className="absolute top-6 right-6 bg-white rounded-lg p-3 w-24 h-24 flex items-center justify-center">
                  <div className="w-18 h-18 grid grid-cols-8 gap-px">
                    {[...Array(64)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`bg-black ${
                          [0,1,2,3,4,5,6,7,8,14,16,22,24,30,32,38,40,46,48,54,56,57,58,59,60,61,62,63].includes(i) ||
                          Math.random() > 0.65 ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                    ))}
                  </div>
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

      <TicketDesignerModal
        isOpen={showDesigner}
        onClose={() => setShowDesigner(false)}
        onTemplateCreated={handleTemplateCreated}
      />
    </div>
  );
};

export default TicketTemplateSelector;