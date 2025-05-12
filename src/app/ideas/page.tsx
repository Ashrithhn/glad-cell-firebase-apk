
import { IdeaList } from '@/components/features/ideas/idea-list';
import { Search, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getIdeas } from '@/services/ideas'; // Import the new service function
import type { IdeaData } from '@/services/ideas'; // Import the IdeaData type
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Fetch approved ideas on the server
async function loadApprovedIdeas(): Promise<{ ideas?: IdeaData[], error?: string }> {
    const result = await getIdeas();
    if (result.success && result.ideas) {
        // Filter for approved ideas to show to users
        const approvedIdeas = result.ideas.filter(idea => idea.status === 'Approved');
        return { ideas: approvedIdeas };
    } else if (!result.success) {
        return { error: result.message || 'Failed to load ideas.' };
    }
    return { ideas: [] }; // Default to empty array
}


export default async function IdeasPage() {
  const { ideas, error } = await loadApprovedIdeas();

  // Map IdeaData to the format expected by IdeaList component
  const mappedIdeas = ideas?.map(idea => ({
    id: idea.id!,
    title: idea.title,
    submitter: idea.submitter_name || 'Admin Submitted', // Use submitter_name
    department: idea.department || 'N/A',
    description: idea.description,
    tags: idea.tags || [],
  })) || [];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary">Explore Student Ideas</h1>
        <p className="text-muted-foreground mt-2">Discover the innovative projects and startups brewing in our college.</p>
      </div>

      <div className="relative w-full max-w-lg mx-auto">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
            type="search"
            placeholder="Search ideas by title, tag, or department..."
            className="pl-10"
            // Add onChange handler to implement search functionality if needed later
        />
      </div>

      {error && (
         <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Ideas</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
         </Alert>
      )}

      {!error && mappedIdeas.length > 0 ? (
        <IdeaList ideas={mappedIdeas} />
      ) : !error ? (
         <p className="text-center text-muted-foreground mt-10">No approved ideas to display currently. Check back soon!</p>
      ) : null}
    </div>
  );
}
