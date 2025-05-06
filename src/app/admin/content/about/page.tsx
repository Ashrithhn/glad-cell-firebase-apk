
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EditAboutForm } from '@/components/features/admin/edit-about-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';
import { getContent } from '@/services/content'; // Import service to fetch content

// Fetch existing content on the server
async function loadAboutContent(): Promise<{ content?: string, error?: string }> {
    const result = await getContent('about'); // Fetch 'about' content block
    if (result.success && typeof result.data === 'string') {
        return { content: result.data };
    } else if (!result.success) {
        return { error: result.message || 'Failed to load about content.' };
    }
    return { content: '' }; // Return empty string if no content exists yet
}


export default async function AdminEditAboutPage() {
  const { content, error } = await loadAboutContent();

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
             <FileText className="h-5 w-5" /> Edit "About Us" Page Content
          </CardTitle>
          <CardDescription>
            Update the text content displayed on the public "About Us" page. Use markdown for formatting if needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
           {error && <p className="text-destructive mb-4">Error loading current content: {error}</p>}
          <EditAboutForm currentContent={content || ''} />
        </CardContent>
      </Card>
    </div>
  );
}
