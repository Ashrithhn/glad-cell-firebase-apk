
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollText, AlertCircle } from 'lucide-react';
import { getContent } from '@/services/content'; // Import service to fetch content
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Fetch terms and conditions content on the server
async function loadTermsContent(): Promise<{ content?: string, error?: string }> {
    const result = await getContent('terms-and-conditions'); // Fetch 'terms-and-conditions' content block
    if (result.success && typeof result.data === 'string') {
        return { content: result.data };
    } else if (!result.success) {
        return { error: result.message || 'Failed to load terms and conditions.' };
    }
    return { content: 'Default Terms and Conditions. Please update via admin panel.' }; // Default content
}


export default async function TermsAndConditionsPage() {
  const { content, error } = await loadTermsContent();

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary">Terms and Conditions</h1>
        <p className="text-muted-foreground mt-2">
          Please read these terms and conditions carefully before using Our Service.
        </p>
      </div>

       {error && (
         <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Content</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
         </Alert>
      )}

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <ScrollText className="h-5 w-5" /> Terms of Service
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || ''}</ReactMarkdown>
        </CardContent>
      </Card>

       {/* Note for admin to update content */}
       {content === 'Default Terms and Conditions. Please update via admin panel.' && !error && (
          <Alert variant="default" className="mt-6 bg-primary/10 border-primary/20 text-primary">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Content Note</AlertTitle>
            <AlertDescription>
              This is default content. Please update the Terms and Conditions from the admin panel.
            </AlertDescription>
          </Alert>
       )}
    </div>
  );
}

