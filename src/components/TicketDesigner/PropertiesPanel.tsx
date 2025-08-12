import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Trash2, AlignLeft, AlignCenter, AlignRight, Bold, Italic } from 'lucide-react';

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

interface PropertiesPanelProps {
  selectedElement: TicketElement | null;
  onUpdateElement: (id: string, updates: Partial<TicketElement>) => void;
  onDeleteElement: (id: string) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedElement,
  onUpdateElement,
  onDeleteElement,
  onImageUpload
}) => {
  if (!selectedElement) {
    return (
      <Card className="border-0 shadow-none">
        <CardHeader className="px-3 py-2">
          <CardTitle className="text-sm font-medium">Properties</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <p className="text-xs text-muted-foreground">Select an element to edit properties</p>
        </CardContent>
      </Card>
    );
  }

  const isTextElement = ['text', 'event-name', 'user-name', 'date', 'status', 'benefits', 'remaining-days', 'pin-code'].includes(selectedElement.type);
  const isShapeElement = ['rectangle', 'circle'].includes(selectedElement.type);
  const isImageElement = selectedElement.type === 'logo';

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-3 py-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">Properties</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDeleteElement(selectedElement.id)}
          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </CardHeader>
      <CardContent className="px-3 pb-3 space-y-4">
        {/* Content */}
        {isTextElement && (
          <div className="space-y-2">
            <Label className="text-xs font-medium">Content</Label>
            <Textarea
              value={selectedElement.content || ''}
              onChange={(e) => onUpdateElement(selectedElement.id, { content: e.target.value })}
              placeholder="Enter text"
              className="min-h-[60px] text-xs resize-none"
            />
          </div>
        )}

        {/* Image Upload */}
        {isImageElement && (
          <div className="space-y-2">
            <Label className="text-xs font-medium">Image</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              className="h-7 text-xs"
            />
            {selectedElement.imageUrl && (
              <div className="w-full h-16 border rounded overflow-hidden">
                <img 
                  src={selectedElement.imageUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        )}

        {/* Typography */}
        {isTextElement && (
          <>
            <Separator />
            <div className="space-y-3">
              <Label className="text-xs font-medium">Typography</Label>
              
              <div className="space-y-2">
                <Label className="text-xs">Font Family</Label>
                <Select 
                  value={selectedElement.fontFamily || 'Arial'} 
                  onValueChange={(value) => onUpdateElement(selectedElement.id, { fontFamily: value })}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Helvetica">Helvetica</SelectItem>
                    <SelectItem value="Georgia">Georgia</SelectItem>
                    <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                    <SelectItem value="Courier New">Courier New</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Size ({selectedElement.fontSize || 14}px)</Label>
                <Slider
                  value={[selectedElement.fontSize || 14]}
                  onValueChange={(value) => onUpdateElement(selectedElement.id, { fontSize: value[0] })}
                  min={8}
                  max={72}
                  step={1}
                  className="h-4"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Alignment</Label>
                <ToggleGroup 
                  type="single" 
                  value={selectedElement.textAlign || 'left'}
                  onValueChange={(value) => value && onUpdateElement(selectedElement.id, { textAlign: value as 'left' | 'center' | 'right' })}
                  className="justify-start"
                >
                  <ToggleGroupItem value="left" size="sm" className="h-7 w-7 p-0">
                    <AlignLeft className="w-3 h-3" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="center" size="sm" className="h-7 w-7 p-0">
                    <AlignCenter className="w-3 h-3" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="right" size="sm" className="h-7 w-7 p-0">
                    <AlignRight className="w-3 h-3" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Weight</Label>
                <ToggleGroup 
                  type="single" 
                  value={selectedElement.fontWeight || 'normal'}
                  onValueChange={(value) => value && onUpdateElement(selectedElement.id, { fontWeight: value as 'normal' | 'bold' })}
                  className="justify-start"
                >
                  <ToggleGroupItem value="normal" size="sm" className="h-7 px-2 text-xs">
                    Normal
                  </ToggleGroupItem>
                  <ToggleGroupItem value="bold" size="sm" className="h-7 w-7 p-0">
                    <Bold className="w-3 h-3" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={selectedElement.color || '#ffffff'}
                    onChange={(e) => onUpdateElement(selectedElement.id, { color: e.target.value })}
                    className="w-12 h-7 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={selectedElement.color || '#ffffff'}
                    onChange={(e) => onUpdateElement(selectedElement.id, { color: e.target.value })}
                    className="flex-1 h-7 text-xs"
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Fill & Stroke */}
        <Separator />
        <div className="space-y-3">
          <Label className="text-xs font-medium">Fill & Stroke</Label>
          
          <div className="space-y-2">
            <Label className="text-xs">Background Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={selectedElement.backgroundColor || '#transparent'}
                onChange={(e) => onUpdateElement(selectedElement.id, { backgroundColor: e.target.value })}
                className="w-12 h-7 p-1 border rounded"
              />
              <Input
                type="text"
                value={selectedElement.backgroundColor || 'transparent'}
                onChange={(e) => onUpdateElement(selectedElement.id, { backgroundColor: e.target.value })}
                className="flex-1 h-7 text-xs"
                placeholder="transparent"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateElement(selectedElement.id, { backgroundColor: 'transparent' })}
              className="w-full h-7 text-xs"
            >
              Transparent
            </Button>
          </div>

          {(isShapeElement || isImageElement) && (
            <div className="space-y-2">
              <Label className="text-xs">Border Radius ({selectedElement.borderRadius || 0}px)</Label>
              <Slider
                value={[selectedElement.borderRadius || 0]}
                onValueChange={(value) => onUpdateElement(selectedElement.id, { borderRadius: value[0] })}
                min={0}
                max={50}
                step={1}
                className="h-4"
              />
            </div>
          )}
        </div>

        {/* Position & Size */}
        <Separator />
        <div className="space-y-3">
          <Label className="text-xs font-medium">Position & Size</Label>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">X</Label>
              <Input
                type="number"
                value={Math.round(selectedElement.x)}
                onChange={(e) => onUpdateElement(selectedElement.id, { x: parseFloat(e.target.value) || 0 })}
                className="h-7 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Y</Label>
              <Input
                type="number"
                value={Math.round(selectedElement.y)}
                onChange={(e) => onUpdateElement(selectedElement.id, { y: parseFloat(e.target.value) || 0 })}
                className="h-7 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Width</Label>
              <Input
                type="number"
                value={Math.round(selectedElement.width)}
                onChange={(e) => onUpdateElement(selectedElement.id, { width: parseFloat(e.target.value) || 1 })}
                className="h-7 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Height</Label>
              <Input
                type="number"
                value={Math.round(selectedElement.height)}
                onChange={(e) => onUpdateElement(selectedElement.id, { height: parseFloat(e.target.value) || 1 })}
                className="h-7 text-xs"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Rotation ({selectedElement.rotation || 0}°)</Label>
            <Slider
              value={[selectedElement.rotation || 0]}
              onValueChange={(value) => onUpdateElement(selectedElement.id, { rotation: value[0] })}
              min={-180}
              max={180}
              step={1}
              className="h-4"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertiesPanel;