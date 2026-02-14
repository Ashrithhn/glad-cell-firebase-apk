
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Mail, Phone, Building, Hash, MapPin, Loader2, Camera, Ticket, QrCode, Lightbulb, Download, Pencil } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/hooks/use-auth'; 
import { updateOwnProfilePicture } from '@/services/profile';
import { getParticipationData } from '@/services/events'; 
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import type { ParticipationData } from '@/services/events';
import Link from 'next/link';
import { IdCard } from '@/components/features/profile/id-card';
import { toPng } from 'html-to-image';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function ProfilePage() {
  const { user, userProfile, userId, loading: authLoading, logout, authError } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const idCardRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [participations, setParticipations] = useState<ParticipationData[]>([]);
  const [loadingParticipations, setLoadingParticipations] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadIdCard = useCallback(() => {
    if (idCardRef.current === null) {
      return;
    }
    setIsDownloading(true);
    toPng(idCardRef.current, { cacheBust: true, pixelRatio: 2 })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `GLAD_ID_Card_${userProfile?.name?.replace(/\s+/g, '_') || userId}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('oops, something went wrong!', err);
        toast({
          title: "Download Failed",
          description: "Could not generate the ID card image. Please try again.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsDownloading(false);
      });
  }, [idCardRef, userId, userProfile?.name, toast]);

  const handleDownloadQrCode = (dataUrl: string | undefined, eventName: string) => {
    if (!dataUrl) {
      toast({
        title: 'Download Failed',
        description: 'QR Code data is not available for this ticket.',
        variant: 'destructive',
      });
      return;
    }
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `GLAD_Ticket_QR_${eventName.replace(/\s+/g, '_') || 'event'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (!authLoading && !userId) {
      router.replace('/login');
    } else if (userId && !authLoading && userProfile) {
      fetchParticipations(userId);
    }
  }, [userId, authLoading, userProfile, router]);

  const fetchParticipations = async (currentUserId: string) => {
    if (!userProfile) return; 
    setLoadingParticipations(true);
    try {
      const result = await getParticipationData(currentUserId);
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
        if (file.size > MAX_FILE_SIZE) {
            throw new Error(`File size exceeds ${MAX_FILE_SIZE / (1024*1024)}MB limit.`);
        }
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            throw new Error(`Invalid file type. Please upload an image (${ALLOWED_IMAGE_TYPES.join(', ')}).`);
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
          const base64data = reader.result as string;
          
          const result = await updateOwnProfilePicture(userId, base64data);

          if (result.success && result.photoURL) {
            toast({
              title: "Profile Picture Updated",
              description: "Your new profile picture has been saved.",
            });
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
      <div className="container mx-auto py-12 px-4 max-w-4xl space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            <div className="lg:col-span-3">
                 <Card className="shadow-lg"><CardHeader className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6"><Skeleton className="h-24 w-24 rounded-full" /><div className="text-center sm:text-left"><Skeleton className="h-8 w-48 mb-2" /><Skeleton className="h-4 w-64" /></div></CardHeader><CardContent className="p-6 space-y-6"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-5 w-3/4" /><Skeleton className="h-5 w-1/2" /><Skeleton className="h-5 w-full" /></CardContent></Card>
            </div>
             <div className="lg:col-span-2 space-y-8">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-64 w-full rounded-lg" />
             </div>
        </div>
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
              <p className="text-destructive mb-2">{error || 'Could not load profile information. The profile might not exist or there was an error.'}</p>
              <p className="text-muted-foreground">UID: {userId || 'N/A'}</p>
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
    <div className="max-w-4xl mx-auto space-y-8">
      {error && <p className="text-destructive mb-4 text-center">Upload Error: {error}</p>}
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

        <div className="lg:col-span-3">
          <Card className="shadow-lg overflow-hidden h-full relative">
             <Button asChild variant="outline" size="icon" className="absolute top-4 right-4 z-10">
                <Link href="/profile/edit">
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit Profile</span>
                </Link>
             </Button>

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
              <Input type="file" ref={fileInputRef} onChange={handleFileChange} accept={ALLOWED_IMAGE_TYPES.join(',')} className="hidden" disabled={isUploading} />
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
                  <p className="font-semibold">{userProfile?.city || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary"/> My Ideas</CardTitle>
                    <CardDescription>Track your submitted ideas and their status.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild className="w-full">
                        <Link href="/profile/my-ideas">View My Submitted Ideas</Link>
                    </Button>
                </CardContent>
            </Card>

            {userProfile && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Participant ID Card</CardTitle>
                  <CardDescription>A simple ID card for event check-ins.</CardDescription>
                </CardHeader>
                <CardContent>
                  <IdCard profile={userProfile} ref={idCardRef} />
                  <Button onClick={handleDownloadIdCard} disabled={isDownloading} className="w-full mt-4">
                    {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    Download ID Card
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2"><Ticket className="h-5 w-5 text-primary" /> Your Event Tickets</h3>
                {loadingParticipations ? (
                <div className="flex items-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading tickets...</div>
                ) : participations.length > 0 ? (
                <div className="space-y-4 pt-2">
                    {participations.map((p) => (
                    <Card key={p.id || p.payment_details?.order_id} className="shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-base">{p.event_name}</CardTitle>
                          <CardDescription>
                            Ticket ID: {p.ticket_id || p.id}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center">
                        {p.qr_code_data_uri ? (
                            <div className="flex flex-col items-center gap-2">
                                <Image src={p.qr_code_data_uri} alt={`QR Code for ${p.event_name}`} width={150} height={150} className="rounded-md border p-1"/>
                                <Button size="sm" variant="outline" onClick={() => handleDownloadQrCode(p.qr_code_data_uri, p.event_name)}>
                                    <Download className="mr-2 h-4 w-4"/> Download QR
                                </Button>
                            </div>
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
        </div>
      </div>
    </div>
  );
}
