import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { 
  Type, 
  Image as ImageIcon, 
  Square, 
  Circle, 
  QrCode, 
  Calendar, 
  User, 
  Shield, 
  Tag, 
  Clock,
  Upload,
  Save,
  Eye,
  Move,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TicketElement {
  id: string;
  type: 'text' | 'qr-code' | 'date' | 'user-name' | 'event-name' | 'status' | 'benefits' | 'remaining-days' | 'logo' | 'background-image' | 'pin-code';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
  textAlign?: 'left' | 'center' | 'right';
  fontWeight?: 'normal' | 'bold';
  imageUrl?: string;
  rotation?: number;
}

interface TicketDesignerProps {
  onSave: (template: any) => void;
  onPreview: (elements: TicketElement[], canvasSize: { width: number; height: number }) => void;
  onBack: () => void;
  initialTemplate?: any;
}

const TicketDesigner: React.FC<TicketDesignerProps> = ({ onSave, onPreview, onBack, initialTemplate }) => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [elements, setElements] = useState<TicketElement[]>(initialTemplate?.elements || []);
  const [selectedElement, setSelectedElement] = useState<TicketElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 605, height: 151 }); // 16cm x 4cm at 96 DPI
  const [backgroundColor, setBackgroundColor] = useState('#1e293b');
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateCategory, setTemplateCategory] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const elementTypes = [
    { type: 'text', icon: Type, label: 'Text' },
    { type: 'qr-code', icon: QrCode, label: 'QR Code' },
    { type: 'event-name', icon: Tag, label: 'Event Name' },
    { type: 'user-name', icon: User, label: 'User Name' },
    { type: 'date', icon: Calendar, label: 'Date' },
    { type: 'status', icon: Shield, label: 'Status' },
    { type: 'benefits', icon: Tag, label: 'Benefits Used' },
    { type: 'remaining-days', icon: Clock, label: 'Remaining Days' },
    { type: 'pin-code', icon: Square, label: 'PIN Code' },
    { type: 'logo', icon: ImageIcon, label: 'Logo' },
  ];

  const addElement = (type: TicketElement['type']) => {
    const newElement: TicketElement = {
      id: `element-${Date.now()}`,
      type,
      x: 50,
      y: 50,
      width: type === 'qr-code' ? 113 : type === 'logo' ? 120 : 200,
      height: type === 'qr-code' ? 113 : type === 'logo' ? 80 : 40,
      content: type === 'text' ? 'Sample Text' : 
               type === 'event-name' ? 'EVENT NAME' :
               type === 'user-name' ? 'USER NAME' :
               type === 'status' ? 'VALID' :
               type === 'benefits' ? '2/7' :
               type === 'remaining-days' ? '6 Days' :
               type === 'pin-code' ? '123456' :
               '',
      fontSize: type === 'event-name' ? 28 : 16,
      fontFamily: 'Arial',
      color: type === 'event-name' ? '#FFD700' : '#FFFFFF',
      backgroundColor: 'transparent',
      borderRadius: 0,
      textAlign: 'left',
      fontWeight: type === 'event-name' ? 'bold' : 'normal',
      rotation: 0
    };

    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement);
  };

  const updateElement = (id: string, updates: Partial<TicketElement>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
    if (selectedElement?.id === id) {
      setSelectedElement(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const deleteElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    setSelectedElement(null);
  };

  const handleMouseDown = (e: React.MouseEvent, element: TicketElement) => {
    e.preventDefault();
    setSelectedElement(element);
    setIsDragging(true);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left - element.x,
        y: e.clientY - rect.top - element.y
      });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !selectedElement || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.min(canvasSize.width - selectedElement.width, e.clientX - rect.left - dragOffset.x));
    const newY = Math.max(0, Math.min(canvasSize.height - selectedElement.height, e.clientY - rect.top - dragOffset.y));

    updateElement(selectedElement.id, { x: newX, y: newY });
  }, [isDragging, selectedElement, canvasSize, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleBackgroundImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Upload to a public storage bucket or convert to base64
    const reader = new FileReader();
    reader.onload = () => {
      setBackgroundImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const saveTemplate = async () => {
    if (!templateName || !templateCategory) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in template name and category."
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('custom_ticket_templates')
        .insert({
          name: templateName,
          category: templateCategory,
          canvas_width: canvasSize.width,
          canvas_height: canvasSize.height,
          elements: elements as any,
          background_color: backgroundColor,
          background_image_url: backgroundImage,
          is_public: true,
          creator_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Template Saved!",
        description: "Your custom template has been saved to the library."
      });

      onSave({
        name: templateName,
        category: templateCategory,
        elements,
        canvasSize,
        backgroundColor,
        backgroundImage
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving template",
        description: error.message
      });
    }
  };

  const renderElement = (element: TicketElement) => {
    const style = {
      position: 'absolute' as const,
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
      cursor: 'move',
      border: selectedElement?.id === element.id ? '2px solid #3b82f6' : '1px solid transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: element.textAlign === 'center' ? 'center' : element.textAlign === 'right' ? 'flex-end' : 'flex-start',
      padding: '4px',
      zIndex: selectedElement?.id === element.id ? 10 : 1
    };

    if (element.type === 'qr-code') {
      return (
        <div
          key={element.id}
          style={style}
          onMouseDown={(e) => handleMouseDown(e, element)}
        >
          <div className="w-full h-full bg-white rounded-lg p-2 flex items-center justify-center">
            <div className="w-full h-full grid grid-cols-8 gap-px">
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
      );
    }

    if (element.type === 'logo') {
      return (
        <div
          key={element.id}
          style={style}
          onMouseDown={(e) => handleMouseDown(e, element)}
        >
          <div className="w-full h-full bg-white/90 rounded-lg flex items-center justify-center">
            {element.imageUrl ? (
              <img src={element.imageUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
            ) : (
              <div className="text-xs font-bold text-gray-700">LOGO</div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div
        key={element.id}
        style={style}
        onMouseDown={(e) => handleMouseDown(e, element)}
      >
        {element.content}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Element Library */}
      <div className="w-80 border-r bg-card p-4 overflow-y-auto">
        <div className="space-y-6">
          {/* Canvas Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Canvas Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Width (px)</Label>
                  <Input
                    type="number"
                    value={canvasSize.width}
                    onChange={(e) => setCanvasSize(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Height (px)</Label>
                  <Input
                    type="number"
                    value={canvasSize.height}
                    onChange={(e) => setCanvasSize(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
              <div>
                <Label>Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-16"
                  />
                  <Input
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label>Background Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleBackgroundImageUpload(file);
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Element Library */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Element Library</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {elementTypes.map((elementType) => {
                  const Icon = elementType.icon;
                  return (
                    <Button
                      key={elementType.type}
                      variant="outline"
                      className="h-auto p-3 flex flex-col items-center gap-2"
                      onClick={() => addElement(elementType.type as TicketElement['type'])}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs">{elementType.label}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Template Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Template Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Template Name</Label>
                <Input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={templateCategory} onValueChange={setTemplateCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="wedding">Wedding</SelectItem>
                    <SelectItem value="party">Party</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Center - Canvas */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex flex-col items-center">
          <div className="mb-4 flex gap-4">
            <Button onClick={onBack} variant="outline">
              Back
            </Button>
            <Button onClick={() => onPreview(elements, canvasSize)} variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button onClick={saveTemplate} className="bg-gradient-primary hover:opacity-90">
              <Save className="w-4 h-4 mr-2" />
              Save Template
            </Button>
          </div>

          <div
            ref={canvasRef}
            className="relative border-2 border-dashed border-gray-300 bg-white shadow-lg"
            style={{
              width: canvasSize.width,
              height: canvasSize.height,
              backgroundColor: backgroundColor,
              backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {elements.map(renderElement)}
            
            {elements.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                Drag elements from the left panel to start designing
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Element Properties */}
      <div className="w-80 border-l bg-card p-4 overflow-y-auto">
        {selectedElement ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Element Properties
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteElement(selectedElement.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Position & Size */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>X Position</Label>
                  <Input
                    type="number"
                    value={selectedElement.x}
                    onChange={(e) => updateElement(selectedElement.id, { x: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Y Position</Label>
                  <Input
                    type="number"
                    value={selectedElement.y}
                    onChange={(e) => updateElement(selectedElement.id, { y: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Width</Label>
                  <Input
                    type="number"
                    value={selectedElement.width}
                    onChange={(e) => updateElement(selectedElement.id, { width: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Height</Label>
                  <Input
                    type="number"
                    value={selectedElement.height}
                    onChange={(e) => updateElement(selectedElement.id, { height: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              {/* Text Properties */}
              {selectedElement.type !== 'qr-code' && selectedElement.type !== 'logo' && (
                <>
                  <div>
                    <Label>Content</Label>
                    <Textarea
                      value={selectedElement.content}
                      onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label>Font Size</Label>
                    <Slider
                      value={[selectedElement.fontSize || 16]}
                      onValueChange={(value) => updateElement(selectedElement.id, { fontSize: value[0] })}
                      min={8}
                      max={72}
                      step={1}
                    />
                  </div>

                  <div>
                    <Label>Font Family</Label>
                    <Select 
                      value={selectedElement.fontFamily} 
                      onValueChange={(value) => updateElement(selectedElement.id, { fontFamily: value })}
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

                  <div>
                    <Label>Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={selectedElement.color}
                        onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                        className="w-16"
                      />
                      <Input
                        value={selectedElement.color}
                        onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Text Align</Label>
                    <Select 
                      value={selectedElement.textAlign} 
                      onValueChange={(value) => updateElement(selectedElement.id, { textAlign: value as 'left' | 'center' | 'right' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Font Weight</Label>
                    <Select 
                      value={selectedElement.fontWeight} 
                      onValueChange={(value) => updateElement(selectedElement.id, { fontWeight: value as 'normal' | 'bold' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Logo Image Upload */}
              {selectedElement.type === 'logo' && (
                <div>
                  <Label>Logo Image</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          updateElement(selectedElement.id, { imageUrl: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
              )}

              {/* Background Color */}
              <div>
                <Label>Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={selectedElement.backgroundColor === 'transparent' ? '#ffffff' : selectedElement.backgroundColor}
                    onChange={(e) => updateElement(selectedElement.id, { backgroundColor: e.target.value })}
                    className="w-16"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateElement(selectedElement.id, { backgroundColor: 'transparent' })}
                  >
                    Transparent
                  </Button>
                </div>
              </div>

              {/* Border Radius */}
              <div>
                <Label>Border Radius</Label>
                <Slider
                  value={[selectedElement.borderRadius || 0]}
                  onValueChange={(value) => updateElement(selectedElement.id, { borderRadius: value[0] })}
                  min={0}
                  max={50}
                  step={1}
                />
              </div>

              {/* Rotation */}
              <div>
                <Label>Rotation (degrees)</Label>
                <Slider
                  value={[selectedElement.rotation || 0]}
                  onValueChange={(value) => updateElement(selectedElement.id, { rotation: value[0] })}
                  min={-180}
                  max={180}
                  step={1}
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center text-muted-foreground mt-8">
            Select an element to edit its properties
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketDesigner;