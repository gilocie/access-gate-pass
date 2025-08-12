import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Palette, Type, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
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
  const [templateToRedesign, setTemplateToRedesign] = useState<any | null>(null);

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

  const deleteCustomTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('custom_ticket_templates')
        .delete()
        .eq('id', templateId);
      
      if (error) throw error;
      loadCustomTemplates(); // Reload after deletion
    } catch (error) {
      console.error('Error deleting template:', error);
    }
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
          <div className="grid grid-cols-1 gap-4 max-h-60 overflow-y-auto">
            {customTemplates.map((template) => (
              <div key={template.id} className="relative group">
                <Card className="cursor-pointer transition-all hover:shadow-lg">
                  <CardContent className="p-0">
                    <div 
                      className="relative overflow-hidden rounded-lg border"
                      style={{ 
                        width: '605px', 
                        height: '151px',
                        backgroundColor: template.background_color || '#1e293b',
                        backgroundImage: template.background_image_url ? `url(${template.background_image_url})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                      onClick={() => handleCustomTemplateClick(template)}
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
                            fontSize: element.fontSize,
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
                            padding: '2px',
                            overflow: 'hidden'
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
                            <div className="w-full h-full bg-transparent rounded flex items-center justify-center">
                              {element.imageUrl ? (
                                <img src={element.imageUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                              ) : (
                                <ImageIcon className="w-6 h-6 text-white/70" />
                              )}
                            </div>
                          ) : (
                            <span style={{ fontSize: 'inherit', color: 'inherit' }}>{element.content}</span>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{template.name}</h4>
                        <p className="text-xs text-muted-foreground capitalize">{template.category}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTemplateToRedesign(template);
                            setShowDesigner(true);
                          }}
                        >
                          Redesign
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCustomTemplate(template.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
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
        onClose={() => { setShowDesigner(false); setTemplateToRedesign(null); }}
        onTemplateCreated={handleTemplateCreated}
        initialTemplate={templateToRedesign}
      />
    </div>
  );
};

export default TicketTemplateSelector;