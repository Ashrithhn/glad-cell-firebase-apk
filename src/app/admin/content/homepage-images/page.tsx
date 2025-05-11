import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ManageHomepageImagesClient } from '@/components/features/admin/manage-homepage-images';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ImageUp } from 'lucide-react';
import { getHomepageImages } from '@/services/homepageContent';
import type { HomepageImage } from '@/services/homepageContent';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

async function loadImages(): Promise<{ images?: HomepageImage[], error?: string }> {
  const result = await getHomepageImages();
  if (result.success) {
    return { images: result.images || [] };
  } else {
    return { error: result.message || 'Failed to load homepage images.' };
  }
}

export default async function AdminManageHomepageImagesPage() {
  const { images, error } = await loadImages();

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
       <Button asChild variant="outline" className="mb-4">
         <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4"/> Back to Dashboard
         </Link>
       </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
             <ImageUp className="h-5 w-5" /> Manage Homepage Images
          </CardTitle>
          <CardDescription>
            Upload, view, and delete images that appear on the homepage.
          </CardDescription>
        </CardHeader>
        <CardContent>
           {error && (
            <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Loading Images</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
           )}
          <ManageHomepageImagesClient initialImages={images || []} />
        </CardContent>
      </Card>
    </div>
  );
}
