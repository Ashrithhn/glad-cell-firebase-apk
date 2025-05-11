'use client';

import React, { useState, useRef } from 'react';
import { HomepageImage, uploadHomepageImage, deleteHomepageImage, updateHomepageImageDetails } from '@/services/homepageContent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // For alt text if it gets longer
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';
import { Loader2, Trash2, Upload, ImagePlus, AlertCircle, Edit3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';


interface ManageHomepageImagesClientProps {
  initialImages: HomepageImage[];
}

export function ManageHomepageImagesClient({ initialImages }: ManageHomepageImagesClientProps) {
  const [images, setImages] = useState<HomepageImage[]>(initialImages);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [altText, setAltText] = useState('');
  const [order, setOrder] = useState<number>(images.length > 0 ? Math.max(...images.map(img => img.order)) + 1 : 1);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // Store ID of image being deleted
  const [isEditing, setIsEditing] = useState<HomepageImage | null>(null);
  const [editAltText, setEditAltText] = useState('');
  const [editOrder, setEditOrder] = useState<number>(0);


  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({ title: 'No file selected', description: 'Please select an image to upload.', variant: 'destructive' });
      return;
    }
    if (!altText.trim()) {
        toast({ title: 'Alt text required', description: 'Please provide alternative text for the image.', variant: 'destructive'});
        return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onloadend = async () => {
      const base64data = reader.result as string;
      const result = await uploadHomepageImage(base64data, altText, order);
      if (result.success && result.imageId) {
        toast({ title: 'Image Uploaded', description: result.message });
        setImages(prev => [...prev, { 
            id: result.imageId, 
            imageUrl: base64data, // Show preview immediately, actual URL will be from Firestore on next fetch
            altText, 
            order, 
            isActive: true, 
            storagePath: '', // Placeholder, actual path not known client-side without another fetch
            createdAt: new Date().toISOString()
        }].sort((a, b) => a.order - b.order));
        // Reset form
        setSelectedFile(null);
        setPreviewUrl(null);
        setAltText('');
        setOrder(prevOrder => prevOrder + 1);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        toast({ title: 'Upload Failed', description: result.message, variant: 'destructive' });
      }
      setIsUploading(false);
    };
    reader.onerror = () => {
        toast({ title: 'File Read Error', description: 'Could not read the selected file.', variant: 'destructive'});
        setIsUploading(false);
    }
  };

  const handleDelete = async (imageId: string, storagePath: string) => {
    setIsDeleting(imageId);
    const result = await deleteHomepageImage(imageId, storagePath);
    if (result.success) {
      toast({ title: 'Image Deleted', description: result.message });
      setImages(prev => prev.filter(img => img.id !== imageId));
    } else {
      toast({ title: 'Deletion Failed', description: result.message, variant: 'destructive' });
    }
    setIsDeleting(null);
  };

  const openEditModal = (image: HomepageImage) => {
    setIsEditing(image);
    setEditAltText(image.altText);
    setEditOrder(image.order);
  };

  const handleUpdateDetails = async () => {
    if (!isEditing) return;
    const updates: Partial<Pick<HomepageImage, 'altText' | 'order' | 'isActive'>> = {};
    if (editAltText !== isEditing.altText) updates.altText = editAltText;
    if (editOrder !== isEditing.order) updates.order = editOrder;

    if (Object.keys(updates).length === 0) {
        toast({ title: "No Changes", description: "No details were changed."});
        setIsEditing(null);
        return;
    }
    
    const result = await updateHomepageImageDetails(isEditing.id!, updates);
    if (result.success) {
        toast({ title: "Image Updated", description: "Details saved successfully."});
        setImages(prev => prev.map(img => img.id === isEditing.id ? {...img, ...updates} : img).sort((a,b) => a.order - b.order));
    } else {
        toast({ title: "Update Failed", description: result.message, variant: "destructive"});
    }
    setIsEditing(null);
  };
  
  const handleToggleActive = async (image: HomepageImage) => {
    const newStatus = !image.isActive;
    const result = await updateHomepageImageDetails(image.id!, { isActive: newStatus });
    if (result.success) {
      toast({ title: 'Status Updated', description: `Image is now ${newStatus ? 'active' : 'inactive'}.` });
      setImages(prev => prev.map(img => img.id === image.id ? { ...img, isActive: newStatus } : img));
    } else {
      toast({ title: 'Update Failed', description: result.message, variant: 'destructive' });
    }
  };


  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ImagePlus className="h-5 w-5 text-primary" /> Upload New Homepage Image</CardTitle>
          <CardDescription>Select an image file, provide alternative text, and set its display order.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="image-upload">Image File</Label>
            <Input id="image-upload" type="file" accept="image/png, image/jpeg, image/webp, image/gif" onChange={handleFileChange} ref={fileInputRef} />
          </div>
          {previewUrl && (
            <div className="mt-2">
              <Image src={previewUrl} alt="Preview" width={200} height={120} className="rounded-md object-cover border" />
            </div>
          )}
          <div>
            <Label htmlFor="alt-text">Alternative Text (for accessibility)</Label>
            <Input id="alt-text" value={altText} onChange={(e) => setAltText(e.target.value)} placeholder="e.g., Students collaborating on a project" />
          </div>
          <div>
            <Label htmlFor="order">Display Order</Label>
            <Input id="order" type="number" value={order} onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)} placeholder="Lower numbers appear first" />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleUpload} disabled={isUploading || !selectedFile}>
            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            {isUploading ? 'Uploading...' : 'Upload Image'}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Homepage Images</CardTitle>
          <CardDescription>Manage existing images displayed on the homepage.</CardDescription>
        </CardHeader>
        <CardContent>
          {images.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No images uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image) => (
                <Card key={image.id} className="overflow-hidden">
                  <Image src={image.imageUrl} alt={image.altText} width={400} height={240} className="w-full h-40 object-cover" />
                  <CardContent className="p-3 space-y-1">
                    <p className="text-sm font-medium truncate" title={image.altText}>{image.altText}</p>
                    <p className="text-xs text-muted-foreground">Order: {image.order}</p>
                    <div className="flex items-center justify-between pt-1">
                        <Label htmlFor={`active-switch-${image.id}`} className="text-xs flex items-center gap-1">
                            {image.isActive ? "Active" : "Inactive"}
                        </Label>
                        <Switch
                            id={`active-switch-${image.id}`}
                            checked={image.isActive}
                            onCheckedChange={() => handleToggleActive(image)}
                        />
                    </div>
                  </CardContent>
                  <CardFooter className="p-3 flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditModal(image)}>
                        <Edit3 className="mr-1 h-3 w-3" /> Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={isDeleting === image.id}>
                          {isDeleting === image.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the image "{image.altText}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(image.id!, image.storagePath)} className="bg-destructive hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isEditing && (
        <Dialog open={!!isEditing} onOpenChange={(open) => !open && setIsEditing(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Image Details</DialogTitle>
                    <DialogDescription>Update the alternative text and display order for this image.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="edit-alt-text">Alternative Text</Label>
                        <Input id="edit-alt-text" value={editAltText} onChange={(e) => setEditAltText(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="edit-order">Display Order</Label>
                        <Input id="edit-order" type="number" value={editOrder} onChange={(e) => setEditOrder(parseInt(e.target.value,10) || 0)} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleUpdateDetails}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
