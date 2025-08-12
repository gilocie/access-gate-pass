import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Clock
} from 'lucide-react';

interface ElementsLibraryProps {
  onAddElement: (type: string) => void;
}

const ElementsLibrary: React.FC<ElementsLibraryProps> = ({ onAddElement }) => {
  const elementCategories = [
    {
      name: 'Text',
      elements: [
        { type: 'text', icon: Type, label: 'Text' },
        { type: 'event-name', icon: Tag, label: 'Event Name' },
        { type: 'user-name', icon: User, label: 'User Name' },
        { type: 'date', icon: Calendar, label: 'Date' },
        { type: 'status', icon: Shield, label: 'Status' },
        { type: 'benefits', icon: Tag, label: 'Benefits' },
        { type: 'remaining-days', icon: Clock, label: 'Days Left' },
        { type: 'pin-code', icon: Square, label: 'PIN Code' },
      ]
    },
    {
      name: 'Media',
      elements: [
        { type: 'logo', icon: ImageIcon, label: 'Logo' },
        { type: 'qr-code', icon: QrCode, label: 'QR Code' },
      ]
    },
    {
      name: 'Shapes',
      elements: [
        { type: 'rectangle', icon: Square, label: 'Rectangle' },
        { type: 'circle', icon: Circle, label: 'Circle' },
      ]
    }
  ];

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-3 py-2">
        <CardTitle className="text-sm font-medium">Elements</CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3 space-y-3">
        {elementCategories.map((category) => (
          <div key={category.name} className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {category.name}
            </h4>
            <div className="grid grid-cols-2 gap-1">
              {category.elements.map((element) => {
                const Icon = element.icon;
                return (
                  <Button
                    key={element.type}
                    variant="ghost"
                    size="sm"
                    onClick={() => onAddElement(element.type)}
                    className="h-8 flex flex-col items-center gap-1 p-1 hover:bg-muted"
                  >
                    <Icon className="w-3 h-3" />
                    <span className="text-[10px] leading-none">{element.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ElementsLibrary;