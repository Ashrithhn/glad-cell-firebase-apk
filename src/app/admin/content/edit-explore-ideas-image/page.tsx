
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ManageSectionImageForm } from '@/components/features/admin/manage-section-image-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ImageUp, AlertCircle } from 'lucide-react';
import { getContent } from '@/services/content';
import type { HomepageSectionImage } from '@/services/content';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const CONTENT_ID = 'homepage_image_explore_ideas';

async function loadCurrentImage(): Promise<{ image?: HomepageSectionImage, error?: string }> {
  const result = await getContent(CONTENT_ID);
  if (result.success && result.data) {
    // Ensure the data is of the correct type
    if (typeof result.data === 'object' && 'imageUrl' in result.data && 'altText' in result.data) {
      return { image: result.data as HomepageSectionImage };
    }
    // If data exists but not in expected format, treat as if no image is set
    return { image: undefined, error: "Image data format is incorrect." };
  } else if (!result.success) {
    return { error: result.message || `Failed to load image for ${CONTENT_ID}.` };
  }
  return { image: undefined }; // No image set yet
}

export default async function AdminEditExploreIdeasImagePage() {
  const { image, error } = await loadCurrentImage();

  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
       <Button asChild variant="outline" className="mb-4">
         <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4"/> Back to Dashboard
         </Link>
       </Button>

      {error && (
        <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Image Data</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
       )}

      <ManageSectionImageForm
        contentId={CONTENT_ID}
        currentImage={image}
        imageTitle="Explore Ideas Section Image"
        imageDescription="Manage the image displayed in the 'Explore Ideas' card on the homepage."
      />
    </div>
  );
}
