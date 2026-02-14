
'use client';

import React, { forwardRef, useEffect, useState } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';
import { UserProfile } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Building, Mail, User, Hash } from 'lucide-react';

interface IdCardProps {
  profile: UserProfile;
}

export const IdCard = forwardRef<HTMLDivElement, IdCardProps>(({ profile }, ref) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    if (profile?.id) {
       // Using a consistent JSON structure for all QR codes
      const qrDataString = JSON.stringify({ userId: profile.id });
      QRCode.toDataURL(qrDataString, {
        width: 128,
        margin: 1,
        color: { dark: '#000000', light: '#FFFFFF' }
      })
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error('Failed to generate QR code:', err));
    }
  }, [profile?.id]);

  const initials = profile?.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : profile?.email?.charAt(0).toUpperCase() || '?';

  return (
    <div ref={ref} className="bg-card border rounded-lg p-4 font-sans text-card-foreground shadow-md max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="flex items-center gap-2 flex-shrink-0">
          <Image src="/logo.png" alt="GLAD CELL Logo" width={32} height={32} unoptimized />
          <span className="font-bold text-sm text-primary">GLAD CELL</span>
        </div>
        <div className="text-right pl-2 min-w-0">
          <p className="text-xs font-semibold leading-tight truncate">GECM</p>
          <p className="text-xs text-muted-foreground leading-tight">Participant ID</p>
        </div>
      </div>

      {/* Body */}
      <div className="flex gap-4 pt-4">
        {/* Photo */}
        <div className="w-1/3">
          <div className="aspect-square w-full rounded-md overflow-hidden bg-muted flex items-center justify-center">
            {profile.photo_url ? (
              <Image src={profile.photo_url} alt="Profile Photo" width={100} height={100} className="object-cover w-full h-full" data-ai-hint="person face" />
            ) : (
              <span className="text-3xl font-bold text-muted-foreground">{initials}</span>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="w-2/3 space-y-2 text-sm">
          <div className="font-bold text-lg leading-tight truncate" title={profile.name || ''}>{profile.name}</div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="h-3 w-3" />
            <span className="truncate">{profile.email}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Hash className="h-3 w-3" />
            <span className="truncate">{profile.registration_number}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Building className="h-3 w-3" />
            <span className="truncate">{profile.branch}</span>
          </div>
        </div>
      </div>
      
      {/* QR Code Section */}
      <div className="flex items-center justify-center pt-3">
        {qrCodeUrl ? (
          <Image src={qrCodeUrl} alt="User QR Code" width={80} height={80} />
        ) : (
          <Skeleton className="h-20 w-20" />
        )}
      </div>
    </div>
  );
});

IdCard.displayName = 'IdCard';
