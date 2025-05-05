
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, List, ArrowLeft } from 'lucide-react';

// TODO: Fetch program data from Firestore
const samplePrograms = [
  { id: 'mentorship-2025', name: 'Startup Mentorship Program 2025' },
];

export default function AdminManageProgramsPage() {
  return (
    <div className="container mx-auto py-12 px-4">
       <Button asChild variant="outline" className="mb-4">
         <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4"/> Back to Dashboard
         </Link>
       </Button>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Manage Programs</h1>
        <Button asChild variant="default">
          <Link href="/admin/programs/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Program
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><List className="h-5 w-5"/> Existing Programs</CardTitle>
          <CardDescription>List of ongoing and past GLAD CELL programs.</CardDescription>
        </CardHeader>
        <CardContent>
          {samplePrograms.length > 0 ? (
            <ul className="space-y-4">
              {samplePrograms.map((program) => (
                <li key={program.id} className="flex justify-between items-center p-4 border rounded-md hover:bg-muted/50">
                  <div>
                    <p className="font-semibold">{program.name}</p>
                  </div>
                  <div>
                    {/* TODO: Add Edit/Delete buttons and functionality */}
                    <Button variant="outline" size="sm" disabled className="mr-2">Edit (soon)</Button>
                    <Button variant="destructive" size="sm" disabled>Delete (soon)</Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center">No programs found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
