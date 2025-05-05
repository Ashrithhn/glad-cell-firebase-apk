
'use client'; // Required for hooks

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Mail, Phone, Building, Hash, MapPin, Loader2, Camera, Edit } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/hooks/use-auth'; // Import useAuth
import { getUserProfile } from '@/services/events'; // Function to fetch profile
import { updateProfilePicture } from '@/services/profile'; // Server action for upload
import { Skeleton } from '@/components/ui/skeleton'; // For loading state
import { Button } from '@/components/ui/button'; // For edit/upload button
import { Input } from '@/components/ui/input'; // For file input
import { useToast } from '@/hooks/use-toast';

interface UserProfileData {
  uid?: string; // Include UID
  name?: string;
  email?: string;
  phone?: string;
  branch?: string;
  semester?: number | string; // Can be number or string from Firestore
  registrationNumber?: string;
  collegeName?: string;
  city?: string;
  pincode?: string;
  photoURL?: string; // Add photoURL field
}

export default function ProfilePage() {
  const { user, userId, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !userId) {
      router.replace('/login');
      return;
    }

    if (userId) {
      const fetchProfile = async () => {
        setProfileLoading(true);
        setError(null);
        try {
          const result = await getUserProfile(userId);
          if (result.success && result.data) {
            setProfileData(result.data);
          } else {
             setError(result.message || 'Could not load profile.');
             setProfileData({ email: user?.email || 'N/A', uid: userId }); // Fallback with UID
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
          setError('An unexpected error occurred while fetching the profile.');
          setProfileData({ email: user?.email || 'N/A', uid: userId }); // Fallback with UID
        } finally {
          setProfileLoading(false);
        }
      };
      fetchProfile();
    } else if (!authLoading) {
        setProfileLoading(false);
        setError("User not found.");
    }
  }, [userId, authLoading, user, router]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && userId) {
      setIsUploading(true);
      try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
          const base64data = reader.result as string;

          // Split the base64 string into MIME type and data
          const mimeType = base64data.substring(base64data.indexOf(':') + 1, base64data.indexOf(';'));
          // Ensure base64 data part starts correctly
          const base64StringOnly = base64data.substring(base64data.indexOf(',') + 1);

          if (!base64StringOnly) {
              throw new Error("Failed to extract base64 data from file.");
          }

           // Validate MIME type (optional but recommended)
           const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
           if (!allowedTypes.includes(mimeType)) {
               throw new Error(`Invalid file type. Please upload an image (${allowedTypes.join(', ')}).`);
           }

          const result = await updateProfilePicture(userId, base64data); // Send full data URI

          if (result.success && result.photoURL) {
            setProfileData((prev) => prev ? { ...prev, photoURL: result.photoURL } : { photoURL: result.photoURL, uid: userId });
            toast({
              title: "Profile Picture Updated",
              description: "Your new profile picture has been saved.",
            });
          } else {
            throw new Error(result.message || "Failed to upload profile picture.");
          }
        };
        reader.onerror = (error) => {
             console.error("FileReader error:", error);
             throw new Error("Failed to read the selected file.");
        }
      } catch (uploadError: any) {
        console.error("Upload Error:", uploadError);
        toast({
          title: "Upload Failed",
          description: uploadError.message || "Could not update profile picture.",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
        // Reset file input value to allow re-uploading the same file if needed
         if (fileInputRef.current) {
             fileInputRef.current.value = '';
         }
      }
    }
  };

  // Loading state
  if (authLoading || profileLoading) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6">
             <Skeleton className="h-24 w-24 rounded-full" />
             <div className="text-center sm:text-left">
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
             </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
              <div className="flex items-center space-x-4"> <Skeleton className="h-5 w-5 rounded-full" /> <Skeleton className="h-5 w-3/4" /> </div>
              <div className="flex items-center space-x-4"> <Skeleton className="h-5 w-5 rounded-full" /> <Skeleton className="h-5 w-3/4" /> </div>
              <div className="flex items-center space-x-4"> <Skeleton className="h-5 w-5 rounded-full" /> <Skeleton className="h-5 w-3/4" /> </div>
              <hr/>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="flex items-center space-x-4"> <Skeleton className="h-5 w-5 rounded-full" /> <Skeleton className="h-5 w-1/2" /> </div>
                 <div className="flex items-center space-x-4"> <Skeleton className="h-5 w-5 rounded-full" /> <Skeleton className="h-5 w-1/2" /> </div>
                 <div className="flex items-center space-x-4 col-span-1 sm:col-span-2"> <Skeleton className="h-5 w-5 rounded-full" /> <Skeleton className="h-5 w-full" /> </div>
              </div>
               <hr/>
               <div className="flex items-start space-x-4"> <Skeleton className="h-5 w-5 rounded-full" /> <div className="space-y-1"><Skeleton className="h-5 w-48" /> <Skeleton className="h-5 w-32" /></div> </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
      return (
          <div className="container mx-auto py-12 px-4 max-w-2xl text-center text-destructive">
              <p>{error}</p>
              <Button onClick={() => router.push('/')} variant="link">Go Home</Button>
          </div>
      );
  }

  const initials = profileData?.name
    ? profileData.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '?';

  // Render profile if data is available
  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      <Card className="shadow-lg overflow-hidden">
        <CardHeader className="bg-muted/30 p-6 flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6">
           <div className="relative group cursor-pointer" onClick={handleAvatarClick} title="Click to change picture">
             <Avatar className="h-24 w-24 border-4 border-background shadow-md">
               <AvatarImage src={profileData?.photoURL || undefined} alt={profileData?.name || 'User Profile'} data-ai-hint="person portrait" />
               <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
             </Avatar>
             <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
               {isUploading ? (
                 <Loader2 className="h-6 w-6 text-white animate-spin" />
               ) : (
                 <Camera className="h-6 w-6 text-white" />
               )}
             </div>
           </div>
           {/* Hidden File Input */}
           <Input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/webp, image/gif" // Specify accepted image types
              className="hidden"
              disabled={isUploading}
           />
          <div className="text-center sm:text-left">
             <CardTitle className="text-2xl font-bold text-primary">
                {profileData?.name || 'User Profile'}
             </CardTitle>
            <CardDescription>
               View and manage your account information.
            </CardDescription>
            {/* <Button size="sm" variant="outline" className="mt-2" disabled>
              <Edit className="mr-2 h-4 w-4" /> Edit Profile (soon)
            </Button> */}
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="flex items-center space-x-4">
            <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Email Address</h3>
              <p className="font-semibold">{profileData?.email || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Phone Number</h3>
              <p className="font-semibold">{profileData?.phone || 'N/A'}</p>
            </div>
          </div>

          <hr className="border-border" />

          {/* Academic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-center space-x-4">
              <Building className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Branch</h3>
                <p className="font-semibold">{profileData?.branch || 'N/A'}</p>
              </div>
            </div>
             <div className="flex items-center space-x-4">
                <User className="h-5 w-5 text-muted-foreground flex-shrink-0" /> {/* Placeholder icon */}
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Semester</h3>
                    <p className="font-semibold">{profileData?.semester || 'N/A'}</p>
                </div>
            </div>
            <div className="flex items-center space-x-4 col-span-1 sm:col-span-2">
              <Hash className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Registration Number</h3>
                <p className="font-semibold">{profileData?.registrationNumber || 'N/A'}</p>
              </div>
            </div>
          </div>

           <hr className="border-border" />

           {/* Location Info */}
           <div className="flex items-start space-x-4">
            <MapPin className="h-5 w-5 mt-1 text-muted-foreground flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
              <p className="font-semibold">{profileData?.collegeName || 'N/A'},</p>
              <p className="font-semibold">{profileData?.city || 'N/A'} - {profileData?.pincode || 'N/A'}</p>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
