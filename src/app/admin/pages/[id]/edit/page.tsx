
// This file is new
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, AlertCircle } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/server-utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { CustomPage } from '@/services/custom-pages';
import { EditCustomPageForm } from '@/components/features/admin/edit-custom-page-form';
import { getCurrentUser } from '@/lib/server-utils';
import { redirect } from 'next/navigation';


async function getPageData(id: string): Promise<{ page?: CustomPage, error?: string}> {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from('custom_pages').select('*').eq('id', id).single();
    if(error) return { error: error.message };
    return { page: data };
}


export default async function AdminEditCustomPage({ params }: { params: { id: string } }) {
  const { profile } = await getCurrentUser();
  if (profile?.role !== 'Super Admin') {
    redirect('/admin/dashboard');
  }

  const { id } = params;
  const { page, error } = await getPageData(id);
  
  if (error || !page) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-3xl">
        <Button asChild variant="outline" className="mb-4">
          <Link href="/admin/pages">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Pages List
          </Link>
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Page</AlertTitle>
          <AlertDescription>{error || 'Could not find the specified page.'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
       <Button asChild variant="outline" className="mb-4">
         <Link href="/admin/pages">
            <ArrowLeft className="mr-2 h-4 w-4"/> Back to Pages List
         </Link>
       </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
             <Edit className="h-5 w-5" /> Edit Page: "{page.title}"
          </CardTitle>
          <CardDescription>
            Modify the content and settings for this custom page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditCustomPageForm page={page} />
        </CardContent>
      </Card>
    </div>
  );
}
