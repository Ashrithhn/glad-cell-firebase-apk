<<<<<<< HEAD
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
=======

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, ImagePlus, AlertCircle } from 'lucide-react';
import { HomepageImageManager } from '@/components/features/admin/homepage-image-manager';
import { getHomepageImages } from '@/services/homepage';
import type { HomepageImage } from '@/services/homepage';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

async function loadImages(): Promise<{ images?: HomepageImage[], error?: string}> {
    const result = await getHomepageImages();
    if (result.success) {
        return { images: result.images };
    }
    return { error: result.message || "Failed to fetch images." };
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
}

export default async function AdminManageHomepageImagesPage() {
  const { images, error } = await loadImages();

  return (
<<<<<<< HEAD
    <div className="container mx-auto py-12 px-4 max-w-4xl">
       <Button asChild variant="outline" className="mb-4">
         <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4"/> Back to Dashboard
         </Link>
       </Button>
=======
    <div className="container mx-auto py-12 px-4">
      <Button asChild variant="outline" className="mb-6">
        <Link href="/admin/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
      </Button>
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
<<<<<<< HEAD
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
=======
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
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
        </CardContent>
      </Card>
    </div>
  );
}
