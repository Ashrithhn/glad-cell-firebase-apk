
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { updateOwnUserProfile, removeOwnProfilePicture } from '@/services/profile';
import type { UserProfile } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2, Save } from 'lucide-react';
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

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }).max(100),
  phone: z.string().min(10, { message: 'Please enter a valid 10-digit phone number.' }).max(13, { message: 'Phone number is too long.' }).regex(/^(?:\+91)?[6-9]\d{9}$/, { message: 'Please enter a valid Indian phone number (e.g., 9876543210 or +919876543210).' }),
  semester: z.coerce.number().min(1, { message: 'Semester must be between 1 and 8.' }).max(8, { message: 'Semester must be between 1 and 8.' }),
});

type FormData = z.infer<typeof formSchema>;

interface EditProfileFormProps {
  userProfile: UserProfile;
}

export function EditProfileForm({ userProfile }: EditProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isRemovingPicture, setIsRemovingPicture] = React.useState(false);
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: userProfile.name || '',
      phone: userProfile.phone || '',
      semester: userProfile.semester ? parseInt(String(userProfile.semester), 10) : undefined,
    },
  });

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    try {
      const result = await updateOwnUserProfile(userProfile.id, values);
      if (result.success) {
        toast({ title: "Profile Updated", description: "Your changes have been saved." });
        router.refresh(); // Refresh the parent page data
        router.push('/profile'); // Navigate back to profile view
      } else {
        throw new Error(result.message || 'Failed to update profile.');
      }
    } catch (error) {
      toast({ title: 'Update Failed', description: error instanceof Error ? error.message : 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRemovePicture() {
    setIsRemovingPicture(true);
    try {
      const result = await removeOwnProfilePicture(userProfile.id);
       if (result.success) {
        toast({ title: "Profile Picture Removed" });
        router.refresh();
      } else {
        throw new Error(result.message || 'Failed to remove picture.');
      }
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Could not remove picture.', variant: 'destructive' });
    } finally {
      setIsRemovingPicture(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <fieldset disabled={isSubmitting} className="space-y-4">
           <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl><Input placeholder="Your full name" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl><Input placeholder="Your 10-digit phone number" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="semester"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Semester</FormLabel>
                <FormControl><Input type="number" min="1" max="8" placeholder="Your current semester" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || undefined)} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </fieldset>
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t">
          <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" disabled={isRemovingPicture || !userProfile.photo_url}>
                    {isRemovingPicture ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                    Remove Profile Picture
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently remove your profile picture. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRemovePicture} className="bg-destructive hover:bg-destructive/90">
                        Yes, remove it
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
