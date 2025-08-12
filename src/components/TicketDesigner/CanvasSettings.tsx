import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface CanvasSettingsProps {
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  backgroundType: 'solid' | 'gradient';
  setBackgroundType: (type: 'solid' | 'gradient') => void;
  gradientStart: string;
  setGradientStart: (color: string) => void;
  gradientEnd: string;
  setGradientEnd: (color: string) => void;
  gradientAngle: number;
  setGradientAngle: (angle: number) => void;
  backgroundImage: string | null;
  backgroundOpacity: number;
  setBackgroundOpacity: (opacity: number) => void;
  overlayColor: string;
  setOverlayColor: (color: string) => void;
  onBackgroundImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveBackgroundImage: () => void;
}

const CanvasSettings: React.FC<CanvasSettingsProps> = ({
  backgroundColor,
  setBackgroundColor,
  backgroundType,
  setBackgroundType,
  gradientStart,
  setGradientStart,
  gradientEnd,
  setGradientEnd,
  gradientAngle,
  setGradientAngle,
  backgroundImage,
  backgroundOpacity,
  setBackgroundOpacity,
  overlayColor,
  setOverlayColor,
  onBackgroundImageUpload,
  onRemoveBackgroundImage
}) => {
  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-3 py-2">
        <CardTitle className="text-sm font-medium">Canvas</CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3 space-y-3">
        <div className="space-y-2">
          <Label className="text-xs font-medium">Background</Label>
          <Select value={backgroundType} onValueChange={(value: 'solid' | 'gradient') => setBackgroundType(value)}>
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">Solid Color</SelectItem>
              <SelectItem value="gradient">Gradient</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {backgroundType === 'solid' ? (
          <div className="space-y-2">
            <Label className="text-xs font-medium">Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-12 h-7 p-1 border rounded"
              />
              <Input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="flex-1 h-7 text-xs"
                placeholder="#000000"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label className="text-xs font-medium">Gradient Colors</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={gradientStart}
                  onChange={(e) => setGradientStart(e.target.value)}
                  className="w-12 h-7 p-1 border rounded"
                />
                <Input
                  type="text"
                  value={gradientStart}
                  onChange={(e) => setGradientStart(e.target.value)}
                  className="flex-1 h-7 text-xs"
                  placeholder="Start"
                />
              </div>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={gradientEnd}
                  onChange={(e) => setGradientEnd(e.target.value)}
                  className="w-12 h-7 p-1 border rounded"
                />
                <Input
                  type="text"
                  value={gradientEnd}
                  onChange={(e) => setGradientEnd(e.target.value)}
                  className="flex-1 h-7 text-xs"
                  placeholder="End"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Angle ({gradientAngle}°)</Label>
              <Slider
                value={[gradientAngle]}
                onValueChange={(value) => setGradientAngle(value[0])}
                max={360}
                min={0}
                step={1}
                className="h-4"
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-xs font-medium">Background Image</Label>
          <div className="relative">
            <Input
              type="file"
              accept="image/*"
              onChange={onBackgroundImageUpload}
              className="hidden"
              id="bg-image-upload"
            />
            <label
              htmlFor="bg-image-upload"
              className="flex items-center justify-center gap-2 p-2 border border-dashed border-muted-foreground/30 rounded cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <Upload className="w-3 h-3" />
              <span className="text-xs">Upload Image</span>
            </label>
          </div>
          {backgroundImage && (
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRemoveBackgroundImage}
                className="w-full h-7 text-xs"
              >
                Remove Image
              </Button>
              <div className="space-y-1">
                <Label className="text-xs font-medium">Opacity ({backgroundOpacity}%)</Label>
                <Slider
                  value={[backgroundOpacity]}
                  onValueChange={(value) => setBackgroundOpacity(value[0])}
                  max={100}
                  min={0}
                  step={1}
                  className="h-4"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Overlay Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={overlayColor}
                    onChange={(e) => setOverlayColor(e.target.value)}
                    className="w-12 h-7 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={overlayColor}
                    onChange={(e) => setOverlayColor(e.target.value)}
                    className="flex-1 h-7 text-xs"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CanvasSettings;