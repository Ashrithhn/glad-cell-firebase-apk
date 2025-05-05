
'use client'; // Required for hooks

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Mail, Phone, Building, Hash, MapPin, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth'; // Import useAuth
import { getUserProfile } from '@/services/events'; // Function to fetch profile
import { Skeleton } from '@/components/ui/skeleton'; // For loading state
import { Button } from '@/components/ui/button'; // For potential edit button

interface UserProfileData {
  name?: string;
  email?: string;
  phone?: string;
  branch?: string;
  semester?: number | string; // Can be number or string from Firestore
  registrationNumber?: string;
  collegeName?: string;
  city?: string;
  pincode?: string;
}

export default function ProfilePage() {
  const { user, userId, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not logged in or auth is still loading
    if (!authLoading && !userId) {
      router.replace('/login');
      return; // Stop further execution
    }

    // Fetch profile data if user ID is available
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
             // Set email from auth as fallback
             setProfileData({ email: user?.email || 'N/A' });
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
          setError('An unexpected error occurred while fetching the profile.');
          setProfileData({ email: user?.email || 'N/A' });
        } finally {
          setProfileLoading(false);
        }
      };
      fetchProfile();
    } else if (!authLoading) {
        // Handle case where auth is done loading but no userId (should have been redirected)
        setProfileLoading(false);
        setError("User not found.");
    }
  }, [userId, authLoading, user, router]);

  // Loading state for auth or profile fetch
  if (authLoading || profileLoading) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
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

  // Render profile if data is available
  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <User className="h-6 w-6" /> Your Profile
          </CardTitle>
          <CardDescription>
            View your account information. {/* TODO: Add Edit button later */}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="flex items-center space-x-4">
            <User className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Full Name</h3>
              <p className="font-semibold">{profileData?.name || 'N/A'}</p>
            </div>
          </div>
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

          {/* Add Edit Profile / Change Password Buttons Later
           <div className="flex justify-end space-x-2 pt-4">
             <Button variant="outline" disabled>Edit Profile (soon)</Button>
             <Button variant="destructive" disabled>Change Password (soon)</Button>
           </div>
           */}
        </CardContent>
      </Card>
    </div>
  );
}
