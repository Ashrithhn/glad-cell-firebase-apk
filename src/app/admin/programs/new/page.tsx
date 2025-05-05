
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// Import or create a form component for adding programs
import { AddProgramForm } from '@/components/features/admin/add-program-form'; // Import the actual form
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function AdminAddProgramPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
        <Button asChild variant="outline" className="mb-4">
         <Link href="/admin/programs">
            <ArrowLeft className="mr-2 h-4 w-4"/> Back to Programs List
         </Link>
       </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Add New Program</CardTitle>
          <CardDescription>
            Enter the details for the new GLAD CELL program.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddProgramForm /> {/* Use the form component */}
        </CardContent>
      </Card>
    </div>
  );
}