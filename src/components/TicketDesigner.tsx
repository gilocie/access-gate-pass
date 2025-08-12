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
import CanvasSettings from './TicketDesigner/CanvasSettings';
import ElementsLibrary from './TicketDesigner/ElementsLibrary';
import TemplateInfo from './TicketDesigner/TemplateInfo';
import PropertiesPanel from './TicketDesigner/PropertiesPanel';
import LayersPanel from './TicketDesigner/LayersPanel';

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

  const getBackgroundStyle = () => {
    if (backgroundType === 'gradient') {
      return {
        background: `linear-gradient(${gradientAngle}deg, ${gradientStart}, ${gradientEnd})`
      };
    }
    return {
      backgroundColor
    };
  };

  const moveLayer = (elementId: string, direction: 'up' | 'down') => {
    const currentIndex = elements.findIndex(el => el.id === elementId);
    if (currentIndex === -1) return;

    const newElements = [...elements];
    const targetIndex = direction === 'up' ? currentIndex + 1 : currentIndex - 1;
    
    if (targetIndex >= 0 && targetIndex < elements.length) {
      [newElements[currentIndex], newElements[targetIndex]] = [newElements[targetIndex], newElements[currentIndex]];
      setElements(newElements);
    }
  };

  return (
    <div className="flex h-full bg-background">
      {/* Left Sidebar - Compact */}
      <div className="w-60 border-r bg-card flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          <div className="p-3 space-y-4">
            <CanvasSettings
              backgroundColor={backgroundColor}
              setBackgroundColor={setBackgroundColor}
              backgroundType={backgroundType}
              setBackgroundType={setBackgroundType}
              gradientStart={gradientStart}
              setGradientStart={setGradientStart}
              gradientEnd={gradientEnd}
              setGradientEnd={setGradientEnd}
              gradientAngle={gradientAngle}
              setGradientAngle={setGradientAngle}
              backgroundImage={backgroundImage}
              backgroundOpacity={backgroundOpacity}
              setBackgroundOpacity={setBackgroundOpacity}
              overlayColor={overlayColor}
              setOverlayColor={setOverlayColor}
              onBackgroundImageUpload={handleBackgroundImageUpload}
              onRemoveBackgroundImage={() => setBackgroundImage(null)}
            />
            
            <ElementsLibrary onAddElement={addElement} />
            
            <TemplateInfo
              templateName={templateName}
              setTemplateName={setTemplateName}
              templateCategory={templateCategory}
              setTemplateCategory={setTemplateCategory}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="h-12 border-b bg-card flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onBack} className="h-8 px-3">
              Cancel
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button
              variant="outline"
              size="sm"
              onClick={undo}
              disabled={historyIndex <= 0}
              className="h-8 px-3"
            >
              <Undo className="w-4 h-4 mr-1" />
              Undo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="h-8 px-3"
            >
              <Redo className="w-4 h-4 mr-1" />
              Redo
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <ToggleGroup type="single" value={tool} onValueChange={(value) => value && setTool(value as 'select' | 'pan')}>
              <ToggleGroupItem value="select" size="sm" className="h-8 px-3">
                <Move className="w-4 h-4 mr-1" />
                Select
              </ToggleGroupItem>
              <ToggleGroupItem value="pan" size="sm" className="h-8 px-3">
                <Move className="w-4 h-4 mr-1" />
                Pan
              </ToggleGroupItem>
            </ToggleGroup>
            
            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex items-center gap-1">
              <Button
                variant={showGrid ? "default" : "outline"}
                size="sm"
                onClick={() => setShowGrid(!showGrid)}
                className="h-8 px-3"
              >
                <LayoutGrid className="w-4 h-4 mr-1" />
                Grid
              </Button>
              <Button
                variant={showRulers ? "default" : "outline"}
                size="sm"
                onClick={() => setShowRulers(!showRulers)}
                className="h-8 px-3"
              >
                <Ruler className="w-4 h-4 mr-1" />
                Rulers
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={showPreview ? handleBackFromPreview : handlePreview} className="h-8 px-3">
              <Eye className="w-4 h-4 mr-1" />
              {showPreview ? 'Edit' : 'Preview'}
            </Button>
            <Button onClick={handleSave} size="sm" className="h-8 px-3 bg-primary">
              <Save className="w-4 h-4 mr-1" />
              Save Template
            </Button>
          </div>
        </div>

        {/* Canvas Workspace */}
        <div className="flex-1 relative overflow-hidden">
          {showPreview ? (
            <div className="flex items-center justify-center h-full p-8">
              <div 
                className="border shadow-lg relative"
                style={{ 
                  width: canvasSize.width, 
                  height: canvasSize.height,
                  ...getBackgroundStyle(),
                  backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {backgroundImage && (
                  <div 
                    className="absolute inset-0" 
                    style={{ 
                      backgroundColor: `${overlayColor}${Math.round((100 - backgroundOpacity) * 2.55).toString(16).padStart(2, '0')}`
                    }} 
                  />
                )}
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
                    ) : (
                      <span>{element.content}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Zoom Controls */}
              <div className="absolute top-4 right-4 z-20 bg-card/95 backdrop-blur border rounded-lg shadow-lg px-3 py-2 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom((z) => Math.max(0.25, +(z - 0.1).toFixed(2)))}
                  className="h-7 w-7 p-0"
                >
                  −
                </Button>
                <span className="text-xs text-muted-foreground w-12 text-center font-mono">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom((z) => Math.min(2, +(z + 0.1).toFixed(2)))}
                  className="h-7 w-7 p-0"
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
                    const next = Math.min(scaleX, scaleY) * 0.8;
                    setZoom(Math.max(0.25, Math.min(2, next)));
                  }}
                  className="h-7 px-3 text-xs"
                >
                  Fit
                </Button>
              </div>

              {/* Canvas Container */}
              <div ref={viewportRef} className="w-full h-full overflow-auto bg-muted/30">
                <div className="flex items-center justify-center min-w-full min-h-full p-8">
                  <div className="relative" style={{ width: canvasSize.width * zoom, height: canvasSize.height * zoom }}>
                    {/* Grid Background */}
                    {showGrid && (
                      <div 
                        className="absolute inset-0 opacity-20"
                        style={{
                          backgroundImage: `
                            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                          `,
                          backgroundSize: `${20 * zoom}px ${20 * zoom}px`
                        }}
                      />
                    )}
                    
                    {/* Canvas */}
                    <div 
                      ref={canvasRef}
                      className="relative border-2 border-border shadow-lg bg-background"
                      style={{ 
                        width: canvasSize.width, 
                        height: canvasSize.height,
                        ...getBackgroundStyle(),
                        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        transform: `scale(${zoom})`,
                        transformOrigin: 'top left',
                        overflow: 'hidden'
                      }}
                      onClick={handleCanvasClick}
                    >
                      {backgroundImage && (
                        <div 
                          className="absolute inset-0 pointer-events-none" 
                          style={{ 
                            backgroundColor: `${overlayColor}${Math.round((100 - backgroundOpacity) * 2.55).toString(16).padStart(2, '0')}`
                          }} 
                        />
                      )}
                      
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
                            ) : (
                              <span className="text-center break-words">{element.content}</span>
                            )}
                          </div>
                          
                          {/* Resize handles */}
                          {selectedElement?.id === element.id && (
                            <>
                              {/* corners */}
                              <div
                                className="absolute -top-1 -left-1 w-3 h-3 bg-primary border border-background cursor-nw-resize rounded-full"
                                onMouseDown={(e) => startResize('nw', element, e)}
                              />
                              <div
                                className="absolute -top-1 -right-1 w-3 h-3 bg-primary border border-background cursor-ne-resize rounded-full"
                                onMouseDown={(e) => startResize('ne', element, e)}
                              />
                              <div
                                className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary border border-background cursor-sw-resize rounded-full"
                                onMouseDown={(e) => startResize('sw', element, e)}
                              />
                              <div
                                className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary border border-background cursor-se-resize rounded-full"
                                onMouseDown={(e) => startResize('se', element, e)}
                              />
                              {/* edges */}
                              <div
                                className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary border border-background cursor-n-resize rounded-full"
                                onMouseDown={(e) => startResize('n', element, e)}
                              />
                              <div
                                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary border border-background cursor-s-resize rounded-full"
                                onMouseDown={(e) => startResize('s', element, e)}
                              />
                              <div
                                className="absolute top-1/2 -left-1 -translate-y-1/2 w-3 h-3 bg-primary border border-background cursor-w-resize rounded-full"
                                onMouseDown={(e) => startResize('w', element, e)}
                              />
                              <div
                                className="absolute top-1/2 -right-1 -translate-y-1/2 w-3 h-3 bg-primary border border-background cursor-e-resize rounded-full"
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
            </>
          )}
        </div>
      </div>

      {/* Right Sidebar - Properties & Layers */}
      <div className="w-80 border-l bg-card flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          <div className="p-3 space-y-4">
            <PropertiesPanel
              selectedElement={selectedElement}
              onUpdateElement={updateElement}
              onDeleteElement={deleteElement}
              onImageUpload={handleImageUpload}
            />
            
            <LayersPanel
              elements={elements}
              selectedElement={selectedElement}
              onSelectElement={(element) => setSelectedElement(element)}
              onMoveLayer={moveLayer}
              onDeleteElement={deleteElement}
            />
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default TicketDesigner;
  );
};

export default TicketDesigner;