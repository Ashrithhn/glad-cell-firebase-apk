
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, ArrowLeft, AlertCircle, PlusCircle } from 'lucide-react';
import { getIdeas } from '@/services/ideas';
import type { IdeaData } from '@/services/ideas';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AdminIdeaListClient } from '@/components/features/admin/admin-idea-list-client';

async function loadAllIdeas(): Promise<{ ideas?: IdeaData[], error?: string }> {
    const result = await getIdeas(); // Fetch all ideas for admin
    if (result.success) {
        return { ideas: result.ideas };
    } else {
        return { error: result.message || 'Failed to load ideas.' };
    }
}

export default async function AdminManageIdeasPage() {
  const { ideas, error } = await loadAllIdeas();

  return (
    <div className="container mx-auto py-12 px-4">
       <Button asChild variant="outline" className="mb-4">
         <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4"/> Back to Dashboard
         </Link>
       </Button>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-primary">Manage Student Ideas</h1>
        <Button asChild variant="default">
          <Link href="/admin/ideas/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Idea
          </Link>
        </Button>
      </div>

      {error && (
         <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Ideas</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
         </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5"/> Submitted Ideas</CardTitle>
          <CardDescription>Review, approve, or manage ideas submitted by students or added by admins.</CardDescription>
        </CardHeader>
        <CardContent>
          {!error && ideas ? (
            <AdminIdeaListClient ideas={ideas} />
          ) : !error ? (
            <p className="text-muted-foreground text-center py-8">No ideas found.</p>
          ) : null }
        </CardContent>
      </Card>
    </div>
  );
}
