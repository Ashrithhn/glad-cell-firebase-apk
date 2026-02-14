
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
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
import { Edit, Loader2, ImageOff, Trash2 } from 'lucide-react';
import type { Promotion } from '@/services/promotions';
import { deletePromotion } from '@/services/promotions';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface PromotionListClientProps {
  promotions: Promotion[];
}

export function PromotionListClient({ promotions: initialPromotions }: PromotionListClientProps) {
  const [promotions, setPromotions] = React.useState<Promotion[]>(initialPromotions);
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async (promotion: Promotion) => {
    if (!promotion.id) return;
    setIsDeleting(promotion.id);
    try {
      const result = await deletePromotion(promotion.id, promotion.image_storage_path);
      if (result.success) {
        toast({
          title: 'Promotion Deleted',
          description: `"${promotion.title}" has been successfully removed.`,
        });
        setPromotions(prev => prev.filter(p => p.id !== promotion.id));
        router.refresh();
      } else {
        throw new Error(result.message || 'Failed to delete the promotion.');
      }
    } catch (error) {
      toast({
        title: 'Deletion Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <>
      {promotions.length > 0 ? (
        <ul className="space-y-6">
          {promotions.map((promo) => (
            <li key={promo.id} className="flex flex-col sm:flex-row justify-between items-start p-4 border rounded-lg hover:shadow-md transition-shadow duration-300 gap-4">
              <div className="w-full sm:w-1/3 md:w-1/4 aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center flex-shrink-0">
                {promo.image_url ? (
                    <Image
                        src={promo.image_url}
                        alt={`Image for ${promo.title}`}
                        width={300}
                        height={169}
                        className="object-cover w-full h-full"
                        unoptimized
                        data-ai-hint="advertisement banner"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <ImageOff className="h-12 w-12" />
                        <p className="text-xs mt-1">No Image</p>
                    </div>
                )}
              </div>

              <div className='flex-1 min-w-0 space-y-2'>
                <p className="font-semibold text-lg text-primary truncate flex items-center gap-2">
                    {promo.title}
                    <Badge variant={promo.is_active ? "default" : "secondary"}>
                      {promo.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2">{promo.description}</p>
                <p className="text-xs text-muted-foreground">Order: {promo.display_order}</p>
                {promo.cta_link && <p className="text-xs text-muted-foreground truncate">Link: {promo.cta_link}</p>}
              </div>
              <div className="flex-shrink-0 flex flex-row gap-2 pt-2 sm:pt-0 self-start sm:self-center">
                <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/promotions/${promo.id}/edit`}>
                        <Edit className="mr-1 h-3 w-3"/> Edit
                    </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                     <Button variant="destructive" size="sm" disabled={isDeleting === promo.id}>
                         {isDeleting === promo.id ? (
                             <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                         ) : (
                            <Trash2 className="mr-1 h-3 w-3"/>
                         )}
                        Delete
                     </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the promotion "{promo.title}". This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeleting === promo.id}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                         onClick={() => handleDelete(promo)}
                         disabled={isDeleting === promo.id}
                         className="bg-destructive hover:bg-destructive/90"
                      >
                         {isDeleting === promo.id ? 'Deleting...' : 'Yes, delete it'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground text-center py-10">No promotions found. Click "Add New Promotion" to create one.</p>
      )}
    </>
  );
}
