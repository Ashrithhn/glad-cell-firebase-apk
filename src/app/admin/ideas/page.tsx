
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, ArrowLeft, AlertCircle, Lightbulb } from 'lucide-react';
import { getAllIdeas } from '@/services/ideas'; 
import type { IdeaData } from '@/services/ideas';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { IdeaListAdmin } from '@/components/features/admin/idea-list-admin';

async function loadIdeas(): Promise<{ ideas?: IdeaData[], error?: string }> {
    const result = await getAllIdeas();
    if (result.success && result.ideas) {
        return { ideas: result.ideas };
    } else {
        return { error: result.message || 'Failed to load ideas.' };
    }
}

export default async function AdminManageIdeasPage() {
  const { ideas, error } = await loadIdeas();

  return (
    <div className="container mx-auto py-12 px-4">
       <Button asChild variant="outline" className="mb-4">
         <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4"/> Back to Dashboard
         </Link>
       </Button>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Manage Submitted Ideas</h1>
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
          <CardDescription>List of all submitted ideas. Review and change their status to 'Approved' to show them in the public gallery.</CardDescription>
        </CardHeader>
        <CardContent>
          {!error && ideas ? (
            <IdeaListAdmin initialIdeas={ideas} />
          ) : !error ? (
            <p className="text-muted-foreground text-center">No ideas have been submitted yet.</p>
          ) : null }
        </CardContent>
      </Card>
    </div>
  );
}
