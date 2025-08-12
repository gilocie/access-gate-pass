import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
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
  Trash2,
  Undo,
  Redo,
  Ruler,
  LayoutGrid
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TicketElement {
  id: string;
  type: 'text' | 'qr-code' | 'date' | 'user-name' | 'event-name' | 'status' | 'benefits' | 'remaining-days' | 'logo' | 'background-image' | 'pin-code' | 'rectangle' | 'circle';
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
  const [canvasSize, setCanvasSize] = useState({ width: 605, height: 151 });
  const [backgroundColor, setBackgroundColor] = useState('#1e293b');
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateCategory, setTemplateCategory] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [backgroundOpacity, setBackgroundOpacity] = useState(80);
  const [overlayColor, setOverlayColor] = useState('#000000');
  const [backgroundType, setBackgroundType] = useState<'solid' | 'gradient'>('solid');
  const [gradientStart, setGradientStart] = useState('#1e293b');
  const [gradientEnd, setGradientEnd] = useState('#334155');
  const [gradientAngle, setGradientAngle] = useState(135);
  const [showGridSnap, setShowGridSnap] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showPreview, setShowPreview] = useState(false);
  const [lastDesignState, setLastDesignState] = useState<any>(null);
  // Zoom, pan & viewport
  const viewportRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [tool, setTool] = useState<'select' | 'pan'>('select');
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number } | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [showRulers, setShowRulers] = useState(false);
  // Resize/drag state
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<'n'|'s'|'e'|'w'|'ne'|'nw'|'se'|'sw'|null>(null);
  const resizeStart = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number; startW: number; startH: number; id: string } | null>(null);
  // Push changes to history for undo/redo (up to first action)
  useEffect(() => {
    if (showPreview) return;
    const current = { elements, backgroundColor, backgroundImage };
    const last = history[historyIndex];
    if (last && JSON.stringify(last) === JSON.stringify(current)) return;
    setHistory(prev => [...prev.slice(0, historyIndex + 1), current]);
    setHistoryIndex(prev => prev + 1);
  }, [elements, backgroundColor, backgroundImage]);

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
    { type: 'rectangle', icon: Square, label: 'Rectangle' },
    { type: 'circle', icon: Circle, label: 'Circle' },
  ];

  useEffect(() => {
    if (!initialTemplate) return;

    // Apply initial template state when redesigning
    if (initialTemplate.elements && initialTemplate.elements.length > 0) {
      setElements(initialTemplate.elements);
    }
    if (initialTemplate.canvas_width && initialTemplate.canvas_height) {
      setCanvasSize({ width: initialTemplate.canvas_width, height: initialTemplate.canvas_height });
    }
    if (typeof initialTemplate.background_color === 'string') {
      setBackgroundColor(initialTemplate.background_color);
    }
    if (initialTemplate.background_image_url) {
      setBackgroundImage(initialTemplate.background_image_url);
    }

    // Initialize history with the applied initial state
    const initialState = {
      elements: initialTemplate.elements || [],
      backgroundColor: initialTemplate.background_color || backgroundColor,
      backgroundImage: initialTemplate.background_image_url || backgroundImage,
    };
    setHistory([initialState]);
    setHistoryIndex(0);
  }, [initialTemplate]);
  // Auto fit canvas to viewport
  useEffect(() => {
    if (!viewportRef.current || showPreview) return;
    const { clientWidth, clientHeight } = viewportRef.current;
    if (!clientWidth || !clientHeight) return;
    const scaleX = clientWidth / canvasSize.width;
    const scaleY = clientHeight / canvasSize.height;
    const next = Math.min(scaleX, scaleY) * 0.9;
    setZoom(Math.max(0.25, Math.min(2, next)));
  }, [canvasSize.width, canvasSize.height, showPreview]);

  // Save design state when entering preview
  const handlePreview = () => {
    setLastDesignState({
      elements,
      backgroundColor,
      backgroundImage
    });
    setShowPreview(true);
  };
  // Restore design state when returning from preview
  const handleBackFromPreview = () => {
    if (lastDesignState) {
      setElements(lastDesignState.elements);
      setBackgroundColor(lastDesignState.backgroundColor);
      setBackgroundImage(lastDesignState.backgroundImage);
    }
    setShowPreview(false);
  };

  const addElement = (type: TicketElement['type']) => {
    const newElement: TicketElement = {
      id: `element-${Date.now()}`,
      type,
      x: 50,
      y: 50,
      width: type === 'qr-code' ? 96 : 
             type === 'logo' ? 96 : 
             type === 'rectangle' ? 120 : 
             type === 'circle' ? 80 : 150,
      height: type === 'qr-code' ? 96 : 
              type === 'logo' ? 64 : 
              type === 'rectangle' ? 60 : 
              type === 'circle' ? 80 : 32,
      content: type === 'text' ? 'Sample Text' : 
               type === 'event-name' ? 'EVENT NAME' :
               type === 'user-name' ? 'USER NAME' :
               type === 'status' ? 'VALID' :
               type === 'benefits' ? '0/3 Used' :
               type === 'remaining-days' ? '6 Days' :
               type === 'pin-code' ? '123456' :
               '',
      fontSize: type === 'event-name' ? 22 : 14,
      fontFamily: 'Arial',
      color: type === 'event-name' ? '#FFD700' : 
             type === 'rectangle' || type === 'circle' ? 'transparent' : '#FFFFFF',
      backgroundColor: type === 'rectangle' || type === 'circle' ? '#3b82f6' : 'transparent',
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

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1].elements);
      setBackgroundColor(history[historyIndex - 1].backgroundColor);
      setBackgroundImage(history[historyIndex - 1].backgroundImage);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1].elements);
      setBackgroundColor(history[historyIndex + 1].backgroundColor);
      setBackgroundImage(history[historyIndex + 1].backgroundImage);
    }
  };

  const deleteElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    setSelectedElement(null);
  };

  const handleElementClick = (e: React.MouseEvent, element: TicketElement) => {
    e.stopPropagation();
    setSelectedElement(element);
  };

  const handleElementMouseDown = (e: React.MouseEvent, element: TicketElement) => {
    e.preventDefault();
    setSelectedElement(element);
    setIsDragging(true);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const scaledX = (e.clientX - rect.left) / zoom;
      const scaledY = (e.clientY - rect.top) / zoom;
      setDragOffset({
        x: scaledX - element.x,
        y: scaledY - element.y
      });
    }
  };

  const startResize = (
    handle: typeof resizeHandle,
    element: TicketElement,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setSelectedElement(element);
    setIsResizing(true);
    setResizeHandle(handle);
    resizeStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: element.x,
      startY: element.y,
      startW: element.width,
      startH: element.height,
      id: element.id,
    };
  };

  const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const cursorX = (e.clientX - rect.left) / zoom;
      const cursorY = (e.clientY - rect.top) / zoom;

      if (isDragging && selectedElement) {
        const newX = clamp(cursorX - dragOffset.x, 0, canvasSize.width - selectedElement.width);
        const newY = clamp(cursorY - dragOffset.y, 0, canvasSize.height - selectedElement.height);
        updateElement(selectedElement.id, { x: newX, y: newY });
      } else if (isResizing && resizeStart.current && selectedElement) {
        const dx = (e.clientX - resizeStart.current.mouseX) / zoom;
        const dy = (e.clientY - resizeStart.current.mouseY) / zoom;

        let newW = resizeStart.current.startW;
        let newH = resizeStart.current.startH;
        let newX = resizeStart.current.startX;
        let newY = resizeStart.current.startY;

        switch (resizeHandle) {
          case 'se': newW += dx; newH += dy; break;
          case 'ne': newW += dx; newH -= dy; newY += dy; break;
          case 'sw': newW -= dx; newH += dy; newX += dx; break;
          case 'nw': newW -= dx; newH -= dy; newX += dx; newY += dy; break;
          case 'e': newW += dx; break;
          case 'w': newW -= dx; newX += dx; break;
          case 's': newH += dy; break;
          case 'n': newH -= dy; newY += dy; break;
        }

        const minW = 24;
        const minH = 24;
        newW = Math.max(minW, newW);
        newH = Math.max(minH, newH);

        newX = clamp(newX, 0, canvasSize.width - newW);
        newY = clamp(newY, 0, canvasSize.height - newH);
        newW = clamp(newW, minW, canvasSize.width - newX);
        newH = clamp(newH, minH, canvasSize.height - newY);

        updateElement(selectedElement.id, { x: newX, y: newY, width: newW, height: newH });
      }
    };

    const onMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle(null);
      resizeStart.current = null;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, isResizing, selectedElement, dragOffset.x, dragOffset.y, canvasSize.width, canvasSize.height, zoom]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedElement(null);
    }
  };
  const handleBackgroundImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      setBackgroundImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedElement) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      updateElement(selectedElement.id, { imageUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
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

  return (
    <div className="flex h-full bg-background">
      {/* Left Sidebar */}
      <div className="w-80 border-r bg-card p-4 overflow-y-auto">
        <div className="space-y-6">
          <div className="flex gap-2 mb-4">
            <Button onClick={handleSave} className="bg-gradient-primary">
              Save Template
            </Button>
            <Button variant="outline" onClick={showPreview ? handleBackFromPreview : handlePreview}>
              {showPreview ? 'Back to Designer' : 'Preview'}
            </Button>
            <Button variant="outline" onClick={onBack}>
              Cancel
            </Button>
            <Button variant="outline" onClick={undo} disabled={historyIndex <= 0}>
              <Undo className="w-4 h-4 mr-2" />
              Undo
            </Button>
            <Button variant="outline" onClick={redo} disabled={historyIndex >= history.length - 1}>
              <Redo className="w-4 h-4 mr-2" />
              Redo
            </Button>
          </div>

          {/* Canvas moved to center workspace */}

          {/* Canvas Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Canvas Settings</h3>
            
            <div className="space-y-2">
              <Label>Background Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-20"
                />
                <Select value="solid" onValueChange={(value) => {}}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Background Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Solid Color</SelectItem>
                    <SelectItem value="gradient">Gradient</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Gradient Colors (if gradient selected)</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-20"
                  placeholder="Start"
                />
                <Input
                  type="color"
                  value="#3b82f6"
                  onChange={() => {}}
                  className="w-20"
                  placeholder="End"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Background Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleBackgroundImageUpload}
              />
              {backgroundImage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBackgroundImage(null)}
                >
                  Remove Image
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label>Background Opacity ({backgroundOpacity}%)</Label>
              <Slider
                value={[backgroundOpacity]}
                onValueChange={(value) => setBackgroundOpacity(value[0])}
                max={100}
                min={0}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label>Add Shapes</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addElement('rectangle')}
                >
                  Rectangle
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addElement('circle')}
                >
                  Circle
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas Workspace */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex items-center justify-center h-full">
          {showPreview ? (
            <div 
              className="border shadow-lg"
              style={{ 
                width: canvasSize.width, 
                height: canvasSize.height,
                backgroundColor,
                backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative'
              }}
            >
              <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0, ${(100 - backgroundOpacity) / 100})` }} />
              {elements.map((element) => (
                <div
                  key={element.id}
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
                    padding: '4px',
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
                    element.imageUrl ? (
                      <img src={element.imageUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    )
                  ) : element.type === 'benefits' ? (
                    <span>0/3 Used</span>
                  ) : (
                    <span>{element.content}</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div ref={viewportRef} className="relative w-full h-full overflow-auto">
              {/* Zoom Controls */}
              <div className="absolute top-3 right-3 z-20 bg-card/80 backdrop-blur border rounded-md shadow px-2 py-1 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setZoom((z) => Math.max(0.25, +(z - 0.1).toFixed(2)))}
                  aria-label="Zoom out"
                >
                  −
                </Button>
                <span className="text-sm text-muted-foreground w-12 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setZoom((z) => Math.min(2, +(z + 0.1).toFixed(2)))}
                  aria-label="Zoom in"
                >
                  +
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (!viewportRef.current) return;
                    const { clientWidth, clientHeight } = viewportRef.current;
                    const scaleX = clientWidth / canvasSize.width;
                    const scaleY = clientHeight / canvasSize.height;
                    const next = Math.min(scaleX, scaleY) * 0.9;
                    setZoom(Math.max(0.25, Math.min(2, next)));
                  }}
                >
                  Fit
                </Button>
              </div>

              <div className="flex items-center justify-center w-full h-full p-8">
                <div className="relative" style={{ width: canvasSize.width * zoom, height: canvasSize.height * zoom }}>
                  <div 
                    ref={canvasRef}
                    className="relative border-2 border-dashed border-muted-foreground/30 bg-background"
                    style={{ 
                      width: canvasSize.width, 
                      height: canvasSize.height,
                      backgroundColor,
                      backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      transform: `scale(${zoom})`,
                      transformOrigin: 'top left',
                      overflow: 'hidden'
                    }}
                    onClick={handleCanvasClick}
                  >
                    <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: `rgba(0,0,0, ${(100 - backgroundOpacity) / 100})` }} />
                    {elements.map((element) => (
                      <div
                        key={element.id}
                        className={`absolute cursor-move group ${
                          selectedElement?.id === element.id ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-muted-foreground'
                        }`}
                        style={{
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
                          transformOrigin: 'center'
                        }}
                        onClick={(e) => handleElementClick(e, element)}
                        onMouseDown={(e) => handleElementMouseDown(e, element)}
                      >
                        <div className="flex items-center justify-center h-full w-full p-1 overflow-hidden">
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
                            element.imageUrl ? (
                              <img src={element.imageUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                            ) : (
                              <ImageIcon className="w-6 h-6 text-muted-foreground" />
                            )
                          ) : element.type === 'benefits' ? (
                            <span className="text-center font-semibold">0/3 Used</span>
                          ) : (
                            <span className="text-center break-words">{element.content}</span>
                          )}
                        </div>
                        
                        {/* Resize handles */}
                        {selectedElement?.id === element.id && (
                          <>
                            {/* corners */}
                            <div
                              className="absolute -top-1 -left-1 w-3 h-3 bg-primary border border-background cursor-nw-resize"
                              onMouseDown={(e) => startResize('nw', element, e)}
                            />
                            <div
                              className="absolute -top-1 -right-1 w-3 h-3 bg-primary border border-background cursor-ne-resize"
                              onMouseDown={(e) => startResize('ne', element, e)}
                            />
                            <div
                              className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary border border-background cursor-sw-resize"
                              onMouseDown={(e) => startResize('sw', element, e)}
                            />
                            <div
                              className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary border border-background cursor-se-resize"
                              onMouseDown={(e) => startResize('se', element, e)}
                            />
                            {/* edges */}
                            <div
                              className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary border border-background cursor-n-resize"
                              onMouseDown={(e) => startResize('n', element, e)}
                            />
                            <div
                              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary border border-background cursor-s-resize"
                              onMouseDown={(e) => startResize('s', element, e)}
                            />
                            <div
                              className="absolute top-1/2 -left-1 -translate-y-1/2 w-3 h-3 bg-primary border border-background cursor-w-resize"
                              onMouseDown={(e) => startResize('w', element, e)}
                            />
                            <div
                              className="absolute top-1/2 -right-1 -translate-y-1/2 w-3 h-3 bg-primary border border-background cursor-e-resize"
                              onMouseDown={(e) => startResize('e', element, e)}
                            />
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 border-l bg-card p-4 overflow-y-auto">
        <div className="space-y-6">
          {/* Element Library */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Elements</h3>
            <div className="grid grid-cols-2 gap-2">
              {elementTypes.map((elementType) => {
                const Icon = elementType.icon;
                return (
                  <Button
                    key={elementType.type}
                    variant="outline"
                    size="sm"
                    onClick={() => addElement(elementType.type as TicketElement['type'])}
                    className="flex flex-col items-center gap-1"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs">{elementType.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Element Settings */}
          {selectedElement && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Element Settings</h3>
              
              {selectedElement.type === 'logo' && (
                <div className="space-y-2">
                  <Label>Logo Upload</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="mb-2"
                  />
                  <Input
                    type="text"
                    placeholder="Or paste image URL"
                    value={selectedElement.imageUrl || ''}
                    onChange={(e) => updateElement(selectedElement.id, { imageUrl: e.target.value })}
                  />
                  <div className="space-y-2">
                    <Label>Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={selectedElement.backgroundColor || '#ffffff'}
                        onChange={(e) => updateElement(selectedElement.id, { backgroundColor: e.target.value })}
                        className="w-20"
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
                </div>
              )}

              {selectedElement.type !== 'qr-code' && selectedElement.type !== 'logo' && (
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea
                    placeholder="Enter text content"
                    value={selectedElement.content || ''}
                    onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                  />
                </div>
              )}

              {selectedElement.type === 'benefits' && (
                <div className="space-y-2">
                  <Label>Benefits Display Format</Label>
                  <p className="text-sm text-muted-foreground">
                    This element will automatically show "X/Y used" where X is used benefits and Y is total benefits.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Template Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Template Info</h3>
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name"
              />
            </div>
            <div className="space-y-2">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDesigner;