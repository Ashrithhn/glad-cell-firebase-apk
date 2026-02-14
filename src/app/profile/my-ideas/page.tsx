
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { getIdeasByUserId, IdeaData } from '@/services/ideas';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lightbulb, Loader2, AlertCircle, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export default function MyIdeasPage() {
  const { userId, loading: authLoading } = useAuth();
  const [ideas, setIdeas] = useState<IdeaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!userId) {
      setLoading(false);
      setError("You must be logged in to view your ideas.");
      return;
    }

    async function fetchMyIdeas() {
      setLoading(true);
      setError(null);
      const result = await getIdeasByUserId(userId!);
      if (result.success && result.ideas) {
        setIdeas(result.ideas);
      } else {
        setError(result.message || "Failed to load your submitted ideas.");
      }
      setLoading(false);
    }

    fetchMyIdeas();
  }, [userId, authLoading]);

  const getStatusBadgeVariant = (status: IdeaData['status']) => {
    switch (status) {
      case 'Approved': return 'default';
      case 'Pending': return 'secondary';
      case 'Rejected': return 'destructive';
      case 'Implemented': return 'outline';
      default: return 'secondary';
    }
  };

  const renderContent = () => {
    if (loading || authLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }
    
    if (ideas.length === 0) {
        return (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium">You haven't submitted any ideas yet.</h3>
                <p className="mt-1 text-sm text-muted-foreground">Ready to innovate? Submit your first idea today!</p>
                <div className="mt-6">
                    <Button asChild>
                        <Link href="/ideas">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Submit an Idea
                        </Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
      <div className="space-y-4">
        {ideas.map((idea) => (
          <Card key={idea.id} className="shadow-sm">
            <CardHeader>
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-lg">{idea.title}</CardTitle>
                <Badge variant={getStatusBadgeVariant(idea.status)} className="capitalize flex-shrink-0">
                  {idea.status}
                </Badge>
              </div>
              <CardDescription>
                Submitted on {idea.created_at ? format(parseISO(idea.created_at), 'PPP') : 'N/A'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">{idea.description}</p>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              Last updated: {idea.updated_at ? format(parseISO(idea.updated_at), 'Pp') : 'N/A'}
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
       <Button asChild variant="outline" size="sm">
            <Link href="/profile"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile</Link>
       </Button>
       
      <div className="text-left">
        <h1 className="text-3xl font-bold flex items-center gap-2"><Lightbulb className="h-7 w-7 text-primary"/> My Submitted Ideas</h1>
        <p className="text-muted-foreground mt-1">Track the status and progress of your innovations.</p>
      </div>

      {renderContent()}
    </div>
  );
}
