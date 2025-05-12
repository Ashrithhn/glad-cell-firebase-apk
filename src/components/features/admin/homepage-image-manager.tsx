
'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { PlusCircle, Edit2, Trash2, Loader2, Image as ImageIcon, Link2, ListOrdered, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import type { HomepageImage } from '@/services/homepage';
import { addHomepageImage, updateHomepageImage, deleteHomepageImage } from '@/services/homepage';
import { useRouter } from 'next/navigation';

interface HomepageImageManagerProps {
  initialImages: HomepageImage[];
}

type EditableImage = Omit<HomepageImage, 'id' | 'createdAt' | 'updatedAt' | 'imageUrl'> & {
  id?: string;
  imageUrl?: string;
  imageFile?: string; // For new image uploads (Data URI)
  imagePreview?: string; // For previewing new image
};

export function HomepageImageManager({ initialImages }: HomepageImageManagerProps) {
  const [images, setImages] = useState<HomepageImage[]>(initialImages);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<EditableImage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleAddNew = () => {
    setCurrentImage({
      name: '',
      altText: '',
      order: images.length + 1,
      section: 'carousel',
      isActive: true,
      link: '',
      imageFile: undefined,
      imagePreview: undefined,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (image: HomepageImage) => {
    setCurrentImage({ ...image, imageFile: undefined, imagePreview: image.imageUrl });
    setIsModalOpen(true);
  };

  const handleDelete = async (image: HomepageImage) => {
    if (!image.id || !image.imageUrl) return;
    if (!confirm(`Are you sure you want to delete the image "${image.name}"?`)) return;

    setIsLoading(true);
    try {
      const result = await deleteHomepageImage(image.id, image.imageUrl);
      if (result.success) {
        setImages(prev => prev.filter(img => img.id !== image.id));
        toast({ title: 'Image Deleted', description: `"${image.name}" has been removed.` });
        router.refresh();
      } else {
        throw new Error(result.message || 'Failed to delete image.');
      }
    } catch (error: any) {
      toast({ title: 'Error Deleting Image', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && currentImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentImage(prev => ({
          ...prev!,
          imageFile: reader.result as string,
          imagePreview: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!currentImage) return;
    setIsLoading(true);

    try {
      if (currentImage.id) { // Editing existing image
        const { id, imageUrl, imageFile, imagePreview, ...updateData } = currentImage;
        // For now, we don't support changing the image file for an existing entry via this form
        // to keep it simpler. A separate "Replace Image" flow would be better.
        // If imageFile is present, it means a new image was selected during edit, which we are not handling for simplicity here.
        // We will only update metadata.
        if (imageFile) {
             toast({ title: "Info", description: "To change the actual image, please delete this entry and add a new one.", variant: "default"});
        }
        const result = await updateHomepageImage(id, updateData);
        if (result.success) {
          toast({ title: 'Image Updated', description: `"${currentImage.name}" details saved.` });
          // Optimistic update or rely on router.refresh()
        } else {
          throw new Error(result.message || 'Failed to update image.');
        }
      } else { // Adding new image
        if (!currentImage.imageFile) {
          throw new Error('Image file is required for new uploads.');
        }
        const { imagePreview, ...addData } = currentImage;
        const result = await addHomepageImage(addData as any); // Cast because imageFile is present
        if (result.success && result.imageId) {
          toast({ title: 'Image Added', description: `"${currentImage.name}" uploaded successfully.` });
          // Add to local state or rely on router.refresh()
        } else {
          throw new Error(result.message || 'Failed to add image.');
        }
      }
      setIsModalOpen(false);
      setCurrentImage(null);
      router.refresh(); // Re-fetch images
    } catch (error: any) {
      toast({ title: 'Save Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const sections: HomepageImage['section'][] = ['carousel', 'exploreIdeas', 'latestEventPromo'];

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleAddNew} disabled={isLoading}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Image
        </Button>
      </div>

      {images.length === 0 && (
        <p className="text-center text-muted-foreground py-4">No homepage images configured yet.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map(image => (
          <Card key={image.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="truncate">{image.name}</CardTitle>
              <CardDescription>Section: {image.section} | Order: {image.order}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-2">
              <div className="aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center">
                {image.imageUrl ? (
                  <Image src={image.imageUrl} alt={image.altText} width={300} height={169} className="object-cover w-full h-full" data-ai-hint="website banner"/>
                ) : (
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">Alt: {image.altText}</p>
              {image.link && <p className="text-xs text-primary truncate"><Link2 className="inline mr-1 h-3 w-3"/>{image.link}</p>}
              <p className={`text-xs font-medium ${image.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {image.isActive ? 'Active' : 'Inactive'}
              </p>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleEdit(image)} disabled={isLoading}>
                <Edit2 className="mr-1 h-3 w-3" /> Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(image)} disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin h-3 w-3" /> : <Trash2 className="mr-1 h-3 w-3" />} Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{currentImage?.id ? 'Edit' : 'Add New'} Homepage Image</DialogTitle>
          </DialogHeader>
          {currentImage && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="imageName">Image Name / Identifier</Label>
                <Input id="imageName" value={currentImage.name} onChange={e => setCurrentImage(prev => ({ ...prev!, name: e.target.value }))} placeholder="e.g., Main Carousel Slide 1" />
              </div>
              <div>
                <Label htmlFor="altText">Alt Text (for accessibility)</Label>
                <Input id="altText" value={currentImage.altText} onChange={e => setCurrentImage(prev => ({ ...prev!, altText: e.target.value }))} placeholder="Descriptive text for the image" />
              </div>
              <div>
                <Label htmlFor="imageOrder">Display Order</Label>
                <Input id="imageOrder" type="number" value={currentImage.order} onChange={e => setCurrentImage(prev => ({ ...prev!, order: parseInt(e.target.value) || 0 }))} />
              </div>
               <div>
                <Label htmlFor="imageSection">Section</Label>
                <Select
                  value={currentImage.section}
                  onValueChange={(value: HomepageImage['section']) => setCurrentImage(prev => ({ ...prev!, section: value }))}
                >
                  <SelectTrigger id="imageSection">
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map(sec => <SelectItem key={sec} value={sec}>{sec}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="imageLink">Link (Optional)</Label>
                <Input id="imageLink" value={currentImage.link || ''} onChange={e => setCurrentImage(prev => ({ ...prev!, link: e.target.value }))} placeholder="e.g., /programs/event-name" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="isActive" checked={currentImage.isActive} onCheckedChange={checked => setCurrentImage(prev => ({ ...prev!, isActive: checked }))} />
                <Label htmlFor="isActive">Active (visible on homepage)</Label>
              </div>
              
              <div>
                <Label htmlFor="imageFileContent">{currentImage.id ? 'Replace Image (Optional)' : 'Image File'}</Label>
                <Input id="imageFileContent" type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} />
                {currentImage.imagePreview && (
                  <div className="mt-2 border rounded-md p-2">
                    <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                    <Image src={currentImage.imagePreview} alt="Preview" width={200} height={112} className="object-contain rounded" data-ai-hint="abstract image"/>
                  </div>
                )}
                 {!currentImage.id && !currentImage.imageFile && (
                    <p className="text-xs text-destructive mt-1">Image file is required for new uploads.</p>
                 )}
                 {currentImage.id && (
                     <p className="text-xs text-muted-foreground mt-1">To change the actual image file for an existing entry, it's recommended to delete this and add a new one to avoid issues with cached URLs. This form primarily updates metadata.</p>
                 )}
              </div>

            </div>
          )}
          <DialogFooter>
            <DialogClose asChild><Button variant="outline" disabled={isLoading}>Cancel</Button></DialogClose>
            <Button onClick={handleSubmit} disabled={isLoading || (!currentImage?.id && !currentImage?.imageFile)}>
              {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
              {currentImage?.id ? 'Save Changes' : 'Add Image'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
