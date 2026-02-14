
'use client';

import * as React from 'react';
import { IdeaList } from '@/components/features/ideas/idea-list';
import { Search, PlusCircle, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getApprovedIdeas } from '@/services/ideas';
import type { Idea } from '@/components/features/ideas/idea-list';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { IdeaSubmissionModal } from '@/components/features/ideas/idea-submission-modal';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function IdeasPage() {
  const [ideas, setIdeas] = React.useState<Idea[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { toast } = useToast();
  const { userId, loading: authLoading } = useAuth();
  const router = useRouter();

  const fetchIdeas = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getApprovedIdeas();
      if (result.success && result.ideas) {
        const mappedIdeas = result.ideas.map(idea => ({
          id: idea.id!,
          title: idea.title,
          submitter: idea.submitter_name || 'Admin Submitted',
          department: idea.department || 'N/A',
          description: idea.description,
          tags: idea.tags || [],
        }));
        setIdeas(mappedIdeas);
      } else {
        setError(result.message || "Failed to load ideas.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  const handleIdeaSubmitClick = () => {
    if (authLoading) {
      toast({ title: "Please wait", description: "Checking your login status..." });
      return;
    }
    if (!userId) {
      toast({ title: "Login Required", description: "You must be logged in to submit an idea.", variant: 'destructive' });
      router.push('/login?redirect=/ideas');
      return;
    }
    setIsModalOpen(true);
  };
  
  const onIdeaSubmitted = () => {
    setIsModalOpen(false);
    toast({
        title: "Idea Submitted!",
        description: "Your idea is now pending review by an administrator. You can track its status on your 'My Ideas' page.",
        className: 'bg-green-100 dark:bg-green-900',
    });
    // Optionally, you could redirect to 'My Ideas' or just close the modal.
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold animated-gradient-text">Explore Student Ideas</h1>
        <p className="text-muted-foreground mt-2">Discover the innovative projects and startups brewing in our college.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <div className="relative w-full max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Search ideas by title, tag, or department..."
                className="pl-10"
                // Add onChange handler to implement search functionality
            />
          </div>
           <Button onClick={handleIdeaSubmitClick} disabled={authLoading} className="animated-border-button">
                <PlusCircle className="mr-2 h-4 w-4" />
                Submit Your Idea
           </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
                <Card key={i} className="flex flex-col h-full">
                    <CardHeader><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/2 mt-2" /></CardHeader>
                    <CardContent><Skeleton className="h-20 w-full" /></CardContent>
                    <CardFooter><Skeleton className="h-8 w-full" /></CardFooter>
                </Card>
            ))}
        </div>
      ) : error ? (
        <Alert variant="destructive" className="max-w-xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Ideas</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <IdeaList ideas={ideas} />
      )}
      
      {/* Idea Submission Modal */}
      <IdeaSubmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onIdeaSubmitted={onIdeaSubmitted}
      />

    </div>
  );
}
