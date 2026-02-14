
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HelpCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { getContent } from '@/services/content'; 
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import ReactMarkdown from 'react-markdown'; 
import remarkGfm from 'remark-gfm'; 
import { Button } from "@/components/ui/button";
import Link from "next/link";

async function loadHelpContent(): Promise<{ content?: string, error?: string }> {
    const result = await getContent('help'); 
    if (result.success && typeof result.data === 'string') {
        return { content: result.data };
    } else if (!result.success) {
        return { error: result.message || 'Failed to load help content.' };
    }
    return { content: 'Help content is not available at the moment. Please check back later or contact support.' }; 
}

export default async function HelpPage() {
  const { content, error } = await loadHelpContent();

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
       <Button asChild variant="outline" className="mb-4">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4"/> Back to Home
        </Link>
      </Button>

      <div className="text-center">
        <h1 className="text-3xl font-bold animated-gradient-text flex items-center justify-center gap-2">
            <HelpCircle className="h-8 w-8 text-primary" /> Help & Frequently Asked Questions
        </h1>
        <p className="text-muted-foreground mt-2">
          Find answers to common questions and get help with using the GLAD CELL platform.
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
          <CardTitle className="text-xl">Support Information</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
           <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || ''}</ReactMarkdown>
        </CardContent>
      </Card>
    </div>
  );
}
