
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Mail, Phone, Building, Hash, MapPin, Loader2, Camera, Edit, Ticket, QrCode } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/hooks/use-auth'; // Uses Supabase via useAuth
import { updateProfilePicture } from '@/services/profile'; // Uses Supabase Storage
import { getParticipationData } from '@/services/events'; // Uses Supabase
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image'; // For displaying QR code
import type { ParticipationData } from '@/services/events'; // Supabase type

export default function ProfilePage() {
  const { user, userProfile, userId, loading: authLoading, logout, authError } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [participations, setParticipations] = useState<ParticipationData[]>([]);
  const [loadingParticipations, setLoadingParticipations] = useState(false);

  useEffect(() => {
    if (!authLoading && !userId) {
      router.replace('/login');
    } else if (userId && !authLoading && userProfile) {
      fetchParticipations(userId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, authLoading, userProfile, router]);

  const fetchParticipations = async (currentUserId: string) => {
    if (!userProfile) return; 
    setLoadingParticipations(true);
    try {
      const result = await getParticipationData(currentUserId); // Fetches from Supabase
      if (result.success && result.participations) {
        setParticipations(result.participations);
      } else {
        toast({
          title: "Could not load tickets",
          description: result.message || "Failed to fetch your event participation data.",
          variant: "destructive"
        });
        setParticipations([]);
      }
    } catch (e: any) {
      toast({
        title: "Error loading tickets",
        description: e.message || "An unexpected error occurred.",
        variant: "destructive"
      });
      setParticipations([]);
    } finally {
      setLoadingParticipations(false);
    }
  };

  const handleAvatarClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && userId) {
      setIsUploading(true);
      setError(null);
      try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
          const base64data = reader.result as string;
          // Basic client-side validation (Supabase storage might have its own limits/rules)
          const mimeType = base64data.substring(base64data.indexOf(':') + 1, base64data.indexOf(';'));
          const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
          if (!allowedTypes.includes(mimeType)) {
            throw new Error(`Invalid file type. Please upload an image (${allowedTypes.join(', ')}).`);
          }
          if (file.size > 5 * 1024 * 1024) { // 5MB example limit
             throw new Error("File size exceeds 5MB limit.");
          }

          const result = await updateProfilePicture(userId, base64data); // Uses Supabase Storage

          if (result.success && result.photoURL) {
            // userProfile will update via onSnapshot listener in useAuth (if implemented for Supabase profiles)
            // or useAuth's onAuthStateChange will refetch it.
            toast({
              title: "Profile Picture Updated",
              description: "Your new profile picture has been saved.",
            });
             // Manually trigger a refresh of auth state if needed, or rely on Supabase listener
             if (typeof window !== 'undefined') window.dispatchEvent(new Event('authChange'));
          } else {
            throw new Error(result.message || "Failed to upload profile picture.");
          }
        };
        reader.onerror = (readError) => {
          console.error("FileReader error:", readError);
          throw new Error("Failed to read the selected file.");
        }
      } catch (uploadError: any) {
        console.error("Upload Error:", uploadError);
        setError(uploadError.message || "Could not update profile picture.");
        toast({
          title: "Upload Failed",
          description: uploadError.message || "Could not update profile picture.",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  if (authLoading) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-2xl">
        {/* Skeleton remains the same */}
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
                <hr className="border-border" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <Skeleton className="h-40 rounded-md" />
                        <Skeleton className="h-40 rounded-md" />
                    </div>
                </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!authLoading && userId) {
    if (authError) {
      return (
        <div className="container mx-auto py-12 px-4 max-w-2xl text-center">
          <p className="text-destructive mb-2">
            Supabase Client Error: {authError.message}. Profile cannot be displayed.
          </p>
          <p className="text-muted-foreground">UID: {userId}</p>
          <Button onClick={() => router.push('/')} variant="link">Go Home</Button>
          <Button onClick={logout} variant="outline" className="ml-2">Logout</Button>
        </div>
      );
    }
    if (!userProfile) {
      return (
          <div className="container mx-auto py-12 px-4 max-w-2xl text-center">
              <p className="text-destructive mb-2">
                Could not load your profile information. This might be due to a temporary issue, or the profile data is incomplete. Please try again later or contact support.
              </p>
              <p className="text-muted-foreground">UID: {userId}</p>
              <Button onClick={() => router.push('/')} variant="link">Go Home</Button>
              <Button onClick={logout} variant="outline" className="ml-2">Logout</Button>
          </div>
      );
    }
  }

  const initials = userProfile?.name
    ? userProfile.name.split(' ').map((n) => n[0]).join('').toUpperCase()
    : userProfile?.email?.charAt(0).toUpperCase() || '?';

  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      {error && <p className="text-destructive mb-4 text-center">Upload Error: {error}</p>}
      <Card className="shadow-lg overflow-hidden">
        <CardHeader className="bg-muted/30 p-6 flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6">
           <div className={cn("relative group", isUploading ? 'cursor-not-allowed' : 'cursor-pointer')} onClick={handleAvatarClick} title="Click to change picture">
             <Avatar className="h-24 w-24 border-4 border-background shadow-md">
               <AvatarImage src={userProfile?.photo_url || undefined} alt={userProfile?.name || 'User Profile'} data-ai-hint="person portrait" />
               <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
             </Avatar>
             <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
               {isUploading ? <Loader2 className="h-6 w-6 text-white animate-spin" /> : <Camera className="h-6 w-6 text-white" />}
             </div>
           </div>
           <Input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, image/webp, image/gif" className="hidden" disabled={isUploading} />
          <div className="text-center sm:text-left">
             <CardTitle className="text-2xl font-bold text-primary">{userProfile?.name || userProfile?.email || 'User Profile'}</CardTitle>
            <CardDescription>View and manage your account information and event tickets.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center space-x-4">
            <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div><h3 className="text-sm font-medium text-muted-foreground">Email Address</h3><p className="font-semibold">{userProfile?.email || 'N/A'}</p></div>
          </div>
          <div className="flex items-center space-x-4">
            <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div><h3 className="text-sm font-medium text-muted-foreground">Phone Number</h3><p className="font-semibold">{(userProfile as any)?.phone || 'N/A'}</p></div>
          </div>
          <hr className="border-border" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-center space-x-4">
              <Building className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div><h3 className="text-sm font-medium text-muted-foreground">Branch</h3><p className="font-semibold">{userProfile?.branch || 'N/A'}</p></div>
            </div>
             <div className="flex items-center space-x-4">
                <User className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div><h3 className="text-sm font-medium text-muted-foreground">Semester</h3><p className="font-semibold">{userProfile?.semester || 'N/A'}</p></div>
            </div>
            <div className="flex items-center space-x-4 col-span-1 sm:col-span-2">
              <Hash className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div><h3 className="text-sm font-medium text-muted-foreground">Registration Number</h3><p className="font-semibold">{userProfile?.registration_number || 'N/A'}</p></div>
            </div>
          </div>
           <hr className="border-border" />
           <div className="flex items-start space-x-4">
            <MapPin className="h-5 w-5 mt-1 text-muted-foreground flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
              <p className="font-semibold">{userProfile?.college_name || 'N/A'},</p>
              <p className="font-semibold">{userProfile?.city || 'N/A'} - {userProfile?.pincode || 'N/A'}</p>
            </div>
          </div>
          <hr className="border-border" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center gap-2"><Ticket className="h-5 w-5 text-primary" /> Your Event Tickets</h3>
            {loadingParticipations ? (
              <div className="flex items-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading tickets...</div>
            ) : participations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {participations.map((p) => (
                  <Card key={p.id || p.payment_details?.order_id} className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base">{p.event_name}</CardTitle>
                      <CardDescription>Order ID: {p.payment_details?.order_id || 'N/A'}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center">
                      {p.qr_code_data_uri ? (
                        <Image src={p.qr_code_data_uri} alt={`QR Code for ${p.event_name}`} width={150} height={150} className="rounded-md border p-1"/>
                      ) : (
                        <div className="flex flex-col items-center text-muted-foreground"><QrCode className="h-12 w-12 mb-2"/><p className="text-xs">QR Code not available</p></div>
                      )}
                       <p className="text-xs text-muted-foreground mt-2">Show this QR at the event</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">You have not participated in any events yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
