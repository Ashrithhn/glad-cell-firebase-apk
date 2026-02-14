
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AddPromotionForm } from '@/components/features/admin/add-promotion-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Megaphone } from 'lucide-react';

export default function AdminAddPromotionPage() {
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
            <Megaphone className="h-6 w-6" /> Add New Promotion
          </CardTitle>
          <CardDescription>
            Create a new promotional pop-up that will be shown to users on the homepage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddPromotionForm />
        </CardContent>
      </Card>
    </div>
  );
}
