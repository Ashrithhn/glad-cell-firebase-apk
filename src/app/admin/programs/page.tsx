
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, List, ArrowLeft, AlertCircle } from 'lucide-react';
import { getPrograms } from '@/services/programs'; // Import the service function
import type { ProgramData } from '@/services/programs'; // Import the type
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'; // Import Alert components

// Fetch program data from Firestore on the server
async function loadPrograms(): Promise<{ programs?: ProgramData[], error?: string }> {
    const result = await getPrograms();
    if (result.success) {
        return { programs: result.programs };
    } else {
        return { error: result.message || 'Failed to load programs.' };
    }
}

export default async function AdminManageProgramsPage() {
  const { programs, error } = await loadPrograms();

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

      {error && (
         <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Programs</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
         </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><List className="h-5 w-5"/> Existing Programs</CardTitle>
          <CardDescription>List of ongoing and past GLAD CELL programs.</CardDescription>
        </CardHeader>
        <CardContent>
          {!error && programs && programs.length > 0 ? (
            <ul className="space-y-4">
              {programs.map((program) => (
                <li key={program.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-md hover:bg-muted/50 gap-4">
                  <div className='flex-1'>
                    <p className="font-semibold text-lg">{program.name}</p>
                     <p className="text-sm text-muted-foreground mt-1">{program.description}</p>
                     {program.duration && <p className="text-xs text-muted-foreground mt-1">Duration: {program.duration}</p>}
                     {program.targetAudience && <p className="text-xs text-muted-foreground mt-1">Audience: {program.targetAudience}</p>}
                     {/* Optionally display creation date */}
                     {/* {program.createdAt && <p className="text-xs text-muted-foreground mt-1">Created: {new Date(program.createdAt).toLocaleDateString()}</p>} */}
                  </div>
                  <div className="flex-shrink-0 flex gap-2">
                    {/* TODO: Add Edit/Delete buttons and functionality */}
                    <Button variant="outline" size="sm" disabled className="mr-2">Edit (soon)</Button>
                    <Button variant="destructive" size="sm" disabled>Delete (soon)</Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : !error ? (
            <p className="text-muted-foreground text-center">No programs found.</p>
          ) : null /* Don't show 'No programs' if there was an error */}
        </CardContent>
      </Card>
    </div>
  );
}