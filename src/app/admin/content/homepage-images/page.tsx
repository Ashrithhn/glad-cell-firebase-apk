
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, ImagePlus, AlertCircle } from 'lucide-react';
import { HomepageImageManager } from '@/components/features/admin/homepage-image-manager';
import { getHomepageImages } from '@/services/homepageContent';
import type { HomepageImage } from '@/services/homepageContent';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

async function loadImages(): Promise<{ images?: HomepageImage[], error?: string}> {
    const result = await getHomepageImages();
    if (result.success) {
        return { images: result.images };
    }
    return { error: result.message || "Failed to fetch images." };
}

export default async function AdminManageHomepageImagesPage() {
  const { images, error } = await loadImages();

  return (
    <div className="container mx-auto py-12 px-4">
      <Button asChild variant="outline" className="mb-6">
        <Link href="/admin/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <ImagePlus className="h-6 w-6" /> Manage Homepage Images
          </CardTitle>
          <CardDescription>
            Upload, update, and manage images displayed on the homepage sections like the carousel, "Explore Ideas" promo, and "Latest Event" promo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Could not load homepage images</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <HomepageImageManager initialImages={images || []} />
        </CardContent>
      </Card>
    </div>
  );
}
