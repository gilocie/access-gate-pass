import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Lock, Unlock, ChevronUp, ChevronDown } from 'lucide-react';

interface TicketElement {
  id: string;
  type: 'text' | 'qr-code' | 'date' | 'user-name' | 'event-name' | 'status' | 'benefits' | 'remaining-days' | 'logo' | 'background-image' | 'pin-code' | 'rectangle' | 'circle';
  content?: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LayersPanelProps {
  elements: TicketElement[];
  selectedElement: TicketElement | null;
  onSelectElement: (element: TicketElement) => void;
  onMoveLayer: (elementId: string, direction: 'up' | 'down') => void;
  onDeleteElement: (elementId: string) => void;
}

const LayersPanel: React.FC<LayersPanelProps> = ({
  elements,
  selectedElement,
  onSelectElement,
  onMoveLayer,
  onDeleteElement
}) => {
  const getElementDisplayName = (element: TicketElement) => {
    switch (element.type) {
      case 'text':
        return element.content || 'Text';
      case 'event-name':
        return 'Event Name';
      case 'user-name':
        return 'User Name';
      case 'date':
        return 'Date';
      case 'status':
        return 'Status';
      case 'benefits':
        return 'Benefits';
      case 'remaining-days':
        return 'Days Left';
      case 'pin-code':
        return 'PIN Code';
      case 'logo':
        return 'Logo';
      case 'qr-code':
        return 'QR Code';
      case 'rectangle':
        return 'Rectangle';
      case 'circle':
        return 'Circle';
      default:
        return element.type;
    }
  };

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'text':
      case 'event-name':
      case 'user-name':
      case 'date':
      case 'status':
      case 'benefits':
      case 'remaining-days':
      case 'pin-code':
        return 'T';
      case 'logo':
        return '🖼️';
      case 'qr-code':
        return '⚬';
      case 'rectangle':
        return '▭';
      case 'circle':
        return '○';
      default:
        return '◯';
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-3 py-2">
        <CardTitle className="text-sm font-medium">Layers</CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        {elements.length === 0 ? (
          <p className="text-xs text-muted-foreground">No elements added</p>
        ) : (
          <div className="space-y-1">
            {[...elements].reverse().map((element, index) => (
              <div
                key={element.id}
                className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                  selectedElement?.id === element.id
                    ? 'bg-primary/10 border border-primary/20'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => onSelectElement(element)}
              >
                <span className="text-xs font-mono w-4 text-center">
                  {getElementIcon(element.type)}
                </span>
                <span className="flex-1 text-xs truncate">
                  {getElementDisplayName(element)}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveLayer(element.id, 'up');
                    }}
                    disabled={index === 0}
                    className="h-5 w-5 p-0"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveLayer(element.id, 'down');
                    }}
                    disabled={index === elements.length - 1}
                    className="h-5 w-5 p-0"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LayersPanel;