
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AddIdeaForm } from '@/components/features/admin/add-idea-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function AdminAddIdeaPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
       <Button asChild variant="outline" className="mb-4">
         <Link href="/admin/ideas">
            <ArrowLeft className="mr-2 h-4 w-4"/> Back to Ideas List
         </Link>
       </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Add New Idea</CardTitle>
          <CardDescription>
            Enter the details for the new idea.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddIdeaForm />
        </CardContent>
      </Card>
    </div>
  );
}
