
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EditLinksForm } from '@/components/features/admin/edit-links-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Link2 } from 'lucide-react';
import { getContent } from '@/services/content'; // Import service to fetch content
import type { SiteLinks } from '@/services/content';

// Fetch existing content on the server
async function loadLinks(): Promise<{ links?: SiteLinks, error?: string }> {
    const result = await getContent('links'); // Fetch 'links' content block
    if (result.success && typeof result.data === 'object' && result.data !== null) {
        return { links: result.data as SiteLinks };
    } else if (!result.success) {
        return { error: result.message || 'Failed to load links.' };
    }
    // Return default empty structure if no content exists yet
    return { links: { whatsappCommunity: '' } };
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
             <Link2 className="h-5 w-5" /> Manage Site Links
          </CardTitle>
          <CardDescription>
            Update external links used in the site sidebar or other areas.
          </CardDescription>
        </CardHeader>
        <CardContent>
           {error && <p className="text-destructive mb-4">Error loading current links: {error}</p>}
          <EditLinksForm currentLinks={links!} /> {/* Pass non-null default */}
        </CardContent>
      </Card>
    </div>
  );
}
