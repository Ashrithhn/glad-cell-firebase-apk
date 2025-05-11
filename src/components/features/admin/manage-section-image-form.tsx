'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { HomepageSectionImage } from '@/services/content';
import { updateContent } from '@/services/content';
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { Loader2, Upload, ImagePlus, AlertCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { initializationError } from '@/lib/firebase/config'; // To check Firebase status
import { useRouter } from 'next/navigation';

interface ManageSectionImageFormProps {
  contentId: string; // e.g., 'homepage_image_explore_ideas'
  currentImage: HomepageSectionImage | undefined;
  imageTitle: string; // e.g., "Explore Ideas Section Image"
  imageDescription: string; // e.g., "Manage the image displayed in the 'Explore Ideas' card on the homepage."
}

export function ManageSectionImageForm({ contentId, currentImage: initialCurrentImage, imageTitle, imageDescription }: ManageSectionImageFormProps) {
  const [currentImage, setCurrentImage] = useState<HomepageSectionImage | undefined>(initialCurrentImage);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialCurrentImage?.imageUrl || null);
  const [altText, setAltText] = useState(initialCurrentImage?.altText || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setCurrentImage(initialCurrentImage);
    setPreviewUrl(initialCurrentImage?.imageUrl || null);
    setAltText(initialCurrentImage?.altText || '');
  }, [initialCurrentImage]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // If file selection is cancelled, revert preview to current image if it exists
      setSelectedFile(null);
      setPreviewUrl(currentImage?.imageUrl || null);
    }
  };

  const handleSave = async () => {
    if (initializationError) {
      toast({ title: "Firebase Error", description: `Firebase not initialized: ${initializationError.message}`, variant: "destructive" });
      return;
    }

    if (!selectedFile && altText === (currentImage?.altText || '')) {
      toast({ title: 'No Changes', description: 'No new image selected and alt text is unchanged.', variant: 'default' });
      return;
    }
     if (!altText.trim() && selectedFile) {
      toast({ title: 'Alt Text Required', description: 'Please provide alternative text for the new image.', variant: 'destructive' });
      return;
    }
     if (!altText.trim() && !selectedFile && currentImage) {
        // Only updating alt text for an existing image
     } else if (!altText.trim()){
        toast({ title: 'Alt Text Required', description: 'Please provide alternative text for the image.', variant: 'destructive' });
        return;
     }


    setIsProcessing(true);

    try {
      let newImageUrl = currentImage?.imageUrl;
      let newStoragePath = currentImage?.storagePath;

      if (selectedFile) {
        // Upload new image to Firebase Storage
        const storage = getStorage();
        const mimeType = selectedFile.type;
        const extension = mimeType.split('/')[1] || 'jpg';
        const uniqueFileName = `${contentId}_${Date.now()}.${extension}`;
        const imageStorageRef = ref(storage, `sectionImages/${contentId}/${uniqueFileName}`);
        
        const reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        
        await new Promise<void>((resolve, reject) => {
            reader.onloadend = async () => {
                try {
                    const base64data = reader.result as string;
                    await uploadString(imageStorageRef, base64data, 'data_url');
                    newImageUrl = await getDownloadURL(imageStorageRef);
                    newStoragePath = imageStorageRef.fullPath;

                    // Delete old image from storage if it exists and path is different
                    if (currentImage?.storagePath && currentImage.storagePath !== newStoragePath) {
                        try {
                            const oldImageRef = ref(storage, currentImage.storagePath);
                            await deleteObject(oldImageRef);
                            toast({ title: 'Old Image Deleted', description: 'Previous image removed from storage.' });
                        } catch (deleteError: any) {
                            if (deleteError.code === 'storage/object-not-found') {
                                console.warn("Old image not found in storage, skipping deletion:", currentImage.storagePath);
                            } else {
                                console.error("Failed to delete old image from storage:", deleteError);
                                toast({ title: 'Warning', description: 'Could not delete old image from storage, but new one uploaded.', variant: 'default' });
                            }
                        }
                    }
                    resolve();
                } catch (uploadError) {
                    reject(uploadError);
                }
            };
            reader.onerror = (error) => {
                reject(error);
            };
        });
      }

      // Prepare data for Firestore
      const imageDetailsToSave: HomepageSectionImage = {
        imageUrl: newImageUrl || '', // Should always have a URL if new image or existing
        altText: altText.trim(),
        storagePath: newStoragePath || '',
      };
      
      if (!imageDetailsToSave.imageUrl) {
        throw new Error("Image URL is missing. Cannot save.");
      }


      // Update Firestore using the generic updateContent function
      const result = await updateContent(contentId, imageDetailsToSave);

      if (result.success) {
        toast({ title: 'Image Saved', description: `${imageTitle} has been updated successfully.` });
        setCurrentImage(imageDetailsToSave); // Update local state for current image
        setSelectedFile(null); // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = ''; // Clear file input
        router.refresh(); // Refresh server components
      } else {
        throw new Error(result.message || 'Failed to save image details to database.');
      }

    } catch (error: any) {
      console.error(`Error saving image for ${contentId}:`, error);
      toast({ title: 'Save Failed', description: error.message || 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleRemoveImage = async () => {
    if (!currentImage || !currentImage.storagePath) {
        toast({title: "No Image", description: "There is no image to remove.", variant: "destructive"});
        return;
    }
    setIsProcessing(true);
    try {
        const storage = getStorage();
        const imageRef = ref(storage, currentImage.storagePath);
        await deleteObject(imageRef);
        
        // Update Firestore to remove image details (or set to empty/default)
        const result = await updateContent(contentId, {imageUrl: '', altText: '', storagePath: ''}); 
        if (result.success) {
            toast({title: "Image Removed", description: `${imageTitle} has been removed.`});
            setCurrentImage(undefined);
            setPreviewUrl(null);
            setAltText('');
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            router.refresh();
        } else {
             throw new Error(result.message || 'Failed to update database after image removal.');
        }

    } catch (error: any) {
        console.error(`Error removing image for ${contentId}:`, error);
        toast({title: "Removal Failed", description: error.message || 'Could not remove image.', variant: "destructive"});
    } finally {
        setIsProcessing(false);
    }
  };


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
          <ImagePlus className="h-5 w-5" /> {imageTitle}
        </CardTitle>
        <CardDescription>
          {imageDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {initializationError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Firebase Error</AlertTitle>
            <AlertDescription>
              Firebase is not initialized correctly: {initializationError.message}. Image management features are disabled.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="current-image-preview">Current Image Preview</Label>
          <div className="border rounded-md p-2 bg-muted aspect-video w-full max-w-sm flex items-center justify-center">
            {previewUrl ? (
              <Image src={previewUrl} alt={altText || "Current section image"} width={300} height={180} className="rounded-md object-contain max-h-[180px]" />
            ) : (
              <p className="text-muted-foreground">No image set</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="image-upload">New Image File (Optional)</Label>
          <Input 
            id="image-upload" 
            type="file" 
            accept="image/png, image/jpeg, image/webp, image/gif" 
            onChange={handleFileChange} 
            ref={fileInputRef} 
            disabled={isProcessing || !!initializationError}
          />
          <p className="text-xs text-muted-foreground">Select a new image to replace the current one. If not selected, only alt text will be updated.</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="alt-text">Alternative Text (for accessibility)</Label>
          <Input 
            id="alt-text" 
            value={altText} 
            onChange={(e) => setAltText(e.target.value)} 
            placeholder="e.g., Students collaborating" 
            disabled={isProcessing || !!initializationError}
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <Button onClick={handleSave} disabled={isProcessing || !!initializationError}>
          {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          {isProcessing ? 'Saving...' : 'Save Image & Alt Text'}
        </Button>
        {currentImage?.imageUrl && (
            <Button variant="destructive" onClick={handleRemoveImage} disabled={isProcessing || !!initializationError}>
                <Trash2 className="mr-2 h-4 w-4"/> Remove Current Image
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}
