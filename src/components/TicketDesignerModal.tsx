import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import TicketDesigner from './TicketDesigner';
import { ArrowLeft } from 'lucide-react';

interface TicketDesignerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateCreated: (template: any) => void;
  initialTemplate?: any;
}

const TicketDesignerModal: React.FC<TicketDesignerModalProps> = ({ 
  isOpen, 
  onClose, 
  onTemplateCreated,
  initialTemplate
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const handleSave = (template: any) => {
    onTemplateCreated(template);
    onClose();
  };

  const handlePreview = (elements: any[], canvasSize: any) => {
    setPreviewData({ elements, canvasSize });
    setShowPreview(true);
  };

  if (showPreview) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="fixed max-w-[98vw] w-[1200px] h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(false)}
                className="mr-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              Template Preview
            </DialogTitle>
            <DialogDescription>
              Preview of your custom ticket template
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-center p-6">
            <div
              className="relative border shadow-lg"
              style={{
                width: previewData?.canvasSize.width || 605,
                height: previewData?.canvasSize.height || 151,
                backgroundColor: '#1e293b'
              }}
            >
              {previewData?.elements.map((element: any) => (
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
                    padding: '4px'
                  }}
                >
                  {element.type === 'qr-code' ? (
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
                  ) : element.type === 'logo' ? (
                    <div className="w-full h-full bg-white/90 rounded-lg flex items-center justify-center">
                      {element.imageUrl ? (
                        <img src={element.imageUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                      ) : (
                        <div className="text-xs font-bold text-gray-700">LOGO</div>
                      )}
                    </div>
                  ) : (
                    element.content
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[98vw] w-[1200px] h-[90vh] p-0 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="sr-only">Ticket Designer</DialogTitle>
          <DialogDescription className="sr-only">Design and customize your ticket template</DialogDescription>
        </DialogHeader>
        <div className="h-full">
          <TicketDesigner
            onSave={handleSave}
            onPreview={handlePreview}
            onBack={onClose}
            initialTemplate={initialTemplate}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketDesignerModal;