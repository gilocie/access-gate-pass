import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TemplateInfoProps {
  templateName: string;
  setTemplateName: (name: string) => void;
  templateCategory: string;
  setTemplateCategory: (category: string) => void;
}

const TemplateInfo: React.FC<TemplateInfoProps> = ({
  templateName,
  setTemplateName,
  templateCategory,
  setTemplateCategory
}) => {
  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-3 py-2">
        <CardTitle className="text-sm font-medium">Template</CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3 space-y-3">
        <div className="space-y-2">
          <Label className="text-xs font-medium">Name</Label>
          <Input
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Template name"
            className="h-7 text-xs"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-medium">Category</Label>
          <Select value={templateCategory} onValueChange={setTemplateCategory}>
            <SelectTrigger className="h-7 text-xs">
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
  );
};

export default TemplateInfo;