
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EditPromotionForm } from '@/components/features/admin/edit-promotion-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, AlertCircle } from 'lucide-react';
import { getPromotionById } from '@/services/promotions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default async function AdminEditPromotionPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { success, promotion, message } = await getPromotionById(id);

  if (!success || !promotion) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-3xl">
        <Button asChild variant="outline" className="mb-4">
          <Link href="/admin/promotions">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Promotions List
          </Link>
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Promotion</AlertTitle>
          <AlertDescription>{message || 'Could not find the specified promotion.'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
       <Button asChild variant="outline" className="mb-4">
         <Link href="/admin/promotions">
            <ArrowLeft className="mr-2 h-4 w-4"/> Back to Promotions List
         </Link>
       </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
             <Edit className="h-5 w-5" /> Edit Promotion
          </CardTitle>
          <CardDescription>
            Modify the details for the promotion: "{promotion.title}".
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditPromotionForm promotion={promotion} />
        </CardContent>
      </Card>
    </div>
  );
}
