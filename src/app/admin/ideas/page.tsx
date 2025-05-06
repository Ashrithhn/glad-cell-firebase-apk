
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, ArrowLeft, AlertCircle, Filter, Search } from 'lucide-react';
// import { getAllIdeas } from '@/services/ideas'; // Placeholder for service
// import type { IdeaData } from '@/services/ideas'; // Placeholder for type
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
// import { IdeaListClient } from '@/components/features/admin/idea-list-client'; // Placeholder

// Placeholder: Replace with actual data fetching
async function loadIdeas(): Promise<{ ideas?: any[], error?: string }> {
    // const result = await getAllIdeas();
    // if (result.success) {
    //     return { ideas: result.ideas };
    // } else {
    //     return { error: result.message || 'Failed to load ideas.' };
    // }
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
    return { ideas: [
        {id: 'idea1', title: 'AI Campus Navigator', submitterName: 'Alice Wonder', department: 'CSE', status: 'Pending Review', submittedAt: new Date().toISOString()},
        {id: 'idea2', title: 'Eco Bin Optimizer', submitterName: 'Bob Builder', department: 'Mechanical', status: 'Approved', submittedAt: new Date(Date.now() - 86400000).toISOString()},
    ] };
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-primary">Manage Student Ideas</h1>
         <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search ideas..." className="pl-10" />
            </div>
            <Button variant="outline"><Filter className="mr-2 h-4 w-4"/> Filters</Button>
        </div>
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
          <CardDescription>Review, approve, or manage ideas submitted by students.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder for IdeaListClient or direct rendering */}
          {!error && ideas && ideas.length > 0 ? (
            <div className="space-y-4">
                {ideas.map((idea: any) => (
                    <Card key={idea.id} className="p-4 shadow-sm">
                        <CardTitle className="text-lg">{idea.title}</CardTitle>
                        <CardDescription>Submitted by: {idea.submitterName} ({idea.department})</CardDescription>
                        <p className="text-sm mt-2">Status: <span className={`font-semibold ${idea.status === 'Approved' ? 'text-green-600' : 'text-orange-500'}`}>{idea.status}</span></p>
                        <p className="text-xs text-muted-foreground">Submitted: {new Date(idea.submittedAt).toLocaleDateString()}</p>
                        <div className="mt-3 flex gap-2">
                            <Button size="sm" variant="outline">View Details</Button>
                            <Button size="sm">Change Status</Button>
                        </div>
                    </Card>
                ))}
            </div>
          ) : !error ? (
            <p className="text-muted-foreground text-center py-8">No ideas submitted yet.</p>
          ) : null }
        </CardContent>
      </Card>
    </div>
  );
}
