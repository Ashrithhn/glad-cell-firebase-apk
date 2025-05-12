
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EditHelpForm } from '@/components/features/admin/edit-help-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import { getContent } from '@/services/content'; 

async function loadHelpContent(): Promise<{ content?: string, error?: string }> {
    const result = await getContent('help'); 
    if (result.success && typeof result.data === 'string') {
        return { content: result.data };
    } else if (!result.success) {
        return { error: result.message || 'Failed to load help content.' };
    }
    return { content: '## Frequently Asked Questions\n\n**Q: How do I register for an event?**\n\nA: Navigate to the "Our Programs" page, find the event you are interested in, and click the "Participate Now" button. You will be guided through the registration and payment process if applicable.\n\n**Q: Where can I see my event tickets?**\n\nA: After successful registration and payment, your event tickets (including QR codes) will be available on your Profile page.\n\n**Q: Who can I contact for support?**\n\nA: Please visit our Contact Us page for ways to get in touch with the GLAD CELL team.' }; // Default content
}


export default async function AdminEditHelpPage() {
  const { content, error } = await loadHelpContent();

  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
       <Button asChild variant="outline" className="mb-4">
         <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4"/> Back to Dashboard
         </Link>
       </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
             <HelpCircle className="h-5 w-5" /> Edit "Help/FAQ" Page Content
          </CardTitle>
          <CardDescription>
            Update the text content displayed on the public "Help/FAQ" page. Use markdown for formatting.
          </CardDescription>
        </CardHeader>
        <CardContent>
           {error && <p className="text-destructive mb-4">Error loading current content: {error}</p>}
          <EditHelpForm currentContent={content || ''} />
        </CardContent>
      </Card>
    </div>
  );
}
