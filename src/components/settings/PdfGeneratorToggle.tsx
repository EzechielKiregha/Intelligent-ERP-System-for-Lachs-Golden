import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function PdfGeneratorToggle() {
  const [useJsPdf, setUseJsPdf] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch current setting on component mount
  useEffect(() => {
    const fetchSetting = async () => {
      try {
        const response = await fetch('/api/config/pdf-generator');
        if (response.ok) {
          const data = await response.json();
          setUseJsPdf(data.useJsPdf);
        } else {
          console.error('Failed to fetch PDF generator setting');
          toast.error('Failed to load PDF generator setting');
        }
      } catch (error) {
        console.error('Error fetching PDF generator setting:', error);
        toast.error('Error loading PDF generator setting');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSetting();
  }, []);

  // Save setting
  const saveSetting = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/config/pdf-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ useJsPdf }),
      });

      if (response.ok) {
        toast.success('PDF generator setting saved');
      } else {
        console.error('Failed to save PDF generator setting');
        toast.error('Failed to save PDF generator setting');
      }
    } catch (error) {
      console.error('Error saving PDF generator setting:', error);
      toast.error('Error saving PDF generator setting');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>PDF Generator Settings</CardTitle>
        <CardDescription>
          Configure which PDF generation technology to use for reports
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="pdf-generator-toggle">Use jsPDF Generator</Label>
                <p className="text-sm text-muted-foreground">
                  {useJsPdf
                    ? 'Using lightweight jsPDF for report generation (client-compatible)'
                    : 'Using Puppeteer for report generation (server-only)'}
                </p>
              </div>
              <Switch
                id="pdf-generator-toggle"
                checked={useJsPdf}
                onCheckedChange={setUseJsPdf}
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={saveSetting} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Settings
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}