
// This file is new
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, ArrowLeft, AlertCircle, BookOpen } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { getCurrentUser } from '@/lib/server-utils';
import { redirect } from 'next/navigation';
import { getCustomPages, type CustomPage } from '@/services/custom-pages';
import { CustomPagesListClient } from '@/components/features/admin/custom-pages-list-client';

async function loadPages(): Promise<{ pages?: CustomPage[], error?: string }> {
    const result = await getCustomPages();
    if (result.success) {
        return { pages: result.pages };
    }
    return { error: result.message || 'Failed to load pages.' };
}

export default async function AdminManageCustomPages() {
  const { profile } = await getCurrentUser();
  if (profile?.role !== 'Super Admin') {
    redirect('/admin/dashboard');
  }

  const { pages, error } = await loadPages();

  return (
    <div className="container mx-auto py-12 px-4">
       <Button asChild variant="outline" className="mb-4">
         <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4"/> Back to Dashboard
         </Link>
       </Button>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Manage Custom Pages</h1>
        <Button asChild variant="default">
          <Link href="/admin/pages/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Page
          </Link>
        </Button>
      </div>

      {error && (
         <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Pages</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
         </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5"/> Existing Custom Pages</CardTitle>
          <CardDescription>Create, edit, and publish custom pages for your website. Published pages are publicly accessible.</CardDescription>
        </CardHeader>
        <CardContent>
          {!error && pages ? (
            <CustomPagesListClient pages={pages} />
          ) : !error ? (
            <p className="text-muted-foreground text-center">No custom pages have been created yet.</p>
          ) : null }
        </CardContent>
      </Card>
    </div>
  );
}
