
// This file is new
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { getCurrentUser } from '@/lib/server-utils';
import { redirect } from 'next/navigation';
import { EditCustomPageForm } from '@/components/features/admin/edit-custom-page-form';

export default async function AdminAddCustomPage() {
    const { profile } = await getCurrentUser();
    if (profile?.role !== 'Super Admin') {
      redirect('/admin/dashboard');
    }

    return (
        <div className="container mx-auto py-12 px-4 max-w-3xl">
           <Button asChild variant="outline" className="mb-4">
             <Link href="/admin/pages">
                <ArrowLeft className="mr-2 h-4 w-4"/> Back to Custom Pages
             </Link>
           </Button>
    
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                <BookOpen className="h-6 w-6" /> Add New Custom Page
              </CardTitle>
              <CardDescription>
                Create a new page that will be publicly accessible on your site.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EditCustomPageForm />
            </CardContent>
          </Card>
        </div>
      );
}
