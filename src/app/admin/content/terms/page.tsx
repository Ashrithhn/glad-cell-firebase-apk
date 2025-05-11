
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EditTermsForm } from '@/components/features/admin/edit-terms-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ScrollText } from 'lucide-react';
import { getContent } from '@/services/content';

async function loadTermsContent(): Promise<{ content?: string, error?: string }> {
    const result = await getContent('terms-and-conditions');
    if (result.success && typeof result.data === 'string') {
        return { content: result.data };
    } else if (!result.success) {
        return { error: result.message || 'Failed to load terms and conditions content.' };
    }
    return { content: '' };
}

export default async function AdminEditTermsPage() {
  const { content, error } = await loadTermsContent();

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
             <ScrollText className="h-5 w-5" /> Edit Terms & Conditions
          </CardTitle>
          <CardDescription>
            Update the text content displayed on the public "Terms & Conditions" page. Use markdown for formatting if needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
           {error && <p className="text-destructive mb-4">Error loading current content: {error}</p>}
          <EditTermsForm currentContent={content || ''} />
        </CardContent>
      </Card>
    </div>
  );
}
