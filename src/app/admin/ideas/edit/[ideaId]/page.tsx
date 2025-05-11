
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EditIdeaForm } from '@/components/features/admin/edit-idea-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { getIdeaById } from '@/services/ideas';
import type { IdeaData } from '@/services/ideas';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface EditIdeaPageProps {
  params: { ideaId: string };
}

async function loadIdea(ideaId: string): Promise<{ idea?: IdeaData, error?: string }> {
  const result = await getIdeaById(ideaId);
  if (result.success && result.idea) {
    return { idea: result.idea };
  } else {
    return { error: result.message || 'Failed to load idea details.' };
  }
}

export default async function AdminEditIdeaPage({ params }: EditIdeaPageProps) {
  const { ideaId } = params;
  const { idea, error } = await loadIdea(ideaId);

  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
       <Button asChild variant="outline" className="mb-4">
         <Link href="/admin/ideas">
            <ArrowLeft className="mr-2 h-4 w-4"/> Back to Ideas List
         </Link>
       </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Edit Idea</CardTitle>
          <CardDescription>
            Update the details for the idea: {idea?.title || 'Loading...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Idea</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {idea && !error ? (
            <EditIdeaForm currentIdea={idea} />
          ) : !error ? (
            <p>Loading idea details...</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
