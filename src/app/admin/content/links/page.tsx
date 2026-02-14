
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EditLinksForm } from '@/components/features/admin/edit-links-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Link2 } from 'lucide-react';
import { getContent } from '@/services/content';
import type { SiteLinks } from '@/services/content';

// Fetch existing content on the server and ensure all keys are present
async function loadLinks(): Promise<{ links: SiteLinks, error?: string }> {
    const result = await getContent('links');
    const defaultLinks: SiteLinks = { whatsappCommunity: '', telegram: '', instagram: '', linkedin: '', github: '' };

    if (result.success && typeof result.data === 'object' && result.data !== null) {
        // Merge fetched links with defaults to ensure form has all fields
        return { links: { ...defaultLinks, ...(result.data as SiteLinks) } };
    } else if (!result.success) {
        return { links: defaultLinks, error: result.message || 'Failed to load links.' };
    }
    // Return default structure if no content exists yet
    return { links: defaultLinks };
}


export default async function AdminEditLinksPage() {
  const { links, error } = await loadLinks();

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
             <Link2 className="h-5 w-5" /> Manage Social Media Links
          </CardTitle>
          <CardDescription>
            Update the social media links for the "Find Us On" section. Leave a field blank to hide its icon.
          </CardDescription>
        </CardHeader>
        <CardContent>
           {error && <p className="text-destructive mb-4">Error loading current links: {error}</p>}
          <EditLinksForm currentLinks={links!} />
        </CardContent>
      </Card>
    </div>
  );
}
