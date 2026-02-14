
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EditIdeaForm } from '@/components/features/admin/edit-idea-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, AlertCircle } from 'lucide-react';
import { getIdeaById } from '@/services/ideas';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default async function AdminEditIdeaPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { success, idea, message } = await getIdeaById(id);

  if (!success || !idea) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-3xl">
        <Button asChild variant="outline" className="mb-4">
          <Link href="/admin/ideas">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Ideas List
          </Link>
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Idea</AlertTitle>
          <AlertDescription>{message || 'Could not find the specified idea.'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
       <Button asChild variant="outline" className="mb-4">
         <Link href="/admin/ideas">
            <ArrowLeft className="mr-2 h-4 w-4"/> Back to Ideas List
         </Link>
       </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
             <Edit className="h-5 w-5" /> Edit Idea
          </CardTitle>
          <CardDescription>
            Modify the details for the idea: "{idea.title}".
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditIdeaForm currentIdea={idea} />
        </CardContent>
      </Card>
    </div>
  );
}
