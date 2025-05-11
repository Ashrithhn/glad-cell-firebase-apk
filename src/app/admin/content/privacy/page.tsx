
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EditPrivacyForm } from '@/components/features/admin/edit-privacy-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { getContent } from '@/services/content';

async function loadPrivacyPolicyContent(): Promise<{ content?: string, error?: string }> {
    const result = await getContent('privacy-policy');
    if (result.success && typeof result.data === 'string') {
        return { content: result.data };
    } else if (!result.success) {
        return { error: result.message || 'Failed to load privacy policy content.' };
    }
    return { content: '' };
}

export default async function AdminEditPrivacyPage() {
  const { content, error } = await loadPrivacyPolicyContent();

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
             <ShieldCheck className="h-5 w-5" /> Edit Privacy Policy
          </CardTitle>
          <CardDescription>
            Update the text content displayed on the public "Privacy Policy" page. Use markdown for formatting if needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
           {error && <p className="text-destructive mb-4">Error loading current content: {error}</p>}
          <EditPrivacyForm currentContent={content || ''} />
        </CardContent>
      </Card>
    </div>
  );
}
