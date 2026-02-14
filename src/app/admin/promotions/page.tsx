
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, List, ArrowLeft, AlertCircle, Megaphone } from 'lucide-react';
import { getAdminPromotions } from '@/services/promotions';
import type { Promotion } from '@/services/promotions';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { PromotionListClient } from '@/components/features/admin/promotion-list-client';

async function loadPromotions(): Promise<{ promotions?: Promotion[], error?: string }> {
    const result = await getAdminPromotions();
    if (result.success && result.promotions) {
        return { promotions: result.promotions };
    } else {
        return { error: result.message || 'Failed to load promotions.' };
    }
}

export default async function AdminManagePromotionsPage() {
  const { promotions, error } = await loadPromotions();

  return (
    <div className="container mx-auto py-12 px-4">
       <Button asChild variant="outline" className="mb-4">
         <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4"/> Back to Dashboard
         </Link>
       </Button>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Manage Homepage Promotions</h1>
        <Button asChild variant="default">
          <Link href="/admin/promotions/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Promotion
          </Link>
        </Button>
      </div>

      {error && (
         <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Promotions</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
         </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5"/> Active & Inactive Promotions</CardTitle>
          <CardDescription>Manage the promotional pop-ups that appear to users on the homepage.</CardDescription>
        </CardHeader>
        <CardContent>
          {!error && promotions ? (
            <PromotionListClient promotions={promotions} />
          ) : !error ? (
            <p className="text-muted-foreground text-center">No promotions found.</p>
          ) : null }
        </CardContent>
      </Card>
    </div>
  );
}
