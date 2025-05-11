
'use client';

import * as React from 'react';
import type { IdeaData } from '@/services/ideas';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Eye, Edit, Trash2, Loader2, Tag, Users, CalendarDays, CheckCircle, XCircle, AlertTriangle, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { deleteIdea } from '@/services/ideas'; // Import deleteIdea service
import Link from 'next/link';
import { format, parseISO } from 'date-fns';

interface AdminIdeaListClientProps {
  ideas: IdeaData[];
}

export function AdminIdeaListClient({ ideas }: AdminIdeaListClientProps) {
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async (ideaId: string, ideaTitle: string) => {
    if (!ideaId) return;
    setIsDeleting(ideaId);
    try {
      const result = await deleteIdea(ideaId);
      if (result.success) {
        toast({
          title: 'Idea Deleted',
          description: `"${ideaTitle}" has been successfully deleted.`,
        });
        router.refresh();
      } else {
        throw new Error(result.message || 'Failed to delete the idea.');
      }
    } catch (error) {
      toast({
        title: 'Deletion Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(null);
    }
  };
  
  const getStatusBadgeVariant = (status: IdeaData['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Approved':
        return 'default'; // Primary color for approved
      case 'Pending':
        return 'secondary'; // Muted for pending
      case 'Rejected':
        return 'destructive';
      case 'Implemented':
        return 'outline'; // A distinct outline style
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: IdeaData['status']) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'Rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'Implemented':
        return <Zap className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };


  return (
    <>
      {ideas.length > 0 ? (
        <div className="space-y-4">
          {ideas.map((idea) => (
            <div key={idea.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-md hover:shadow-md transition-shadow duration-200 gap-4">
              <div className='flex-1 min-w-0'>
                <h3 className="font-semibold text-lg truncate text-primary">{idea.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3 w-3"/> 
                    Created: {idea.createdAt ? format(parseISO(idea.createdAt as string), 'MMM d, yyyy, p') : 'N/A'}
                  </span>
                   {idea.submitterName && (
                     <span className="flex items-center gap-1 mt-0.5">
                        <Users className="h-3 w-3"/> Submitter: {idea.submitterName}
                     </span>
                   )}
                </p>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{idea.description}</p>
                 {idea.tags && idea.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                        <Tag className="h-3 w-3 text-muted-foreground self-center"/>
                        {idea.tags.map(tag => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                    </div>
                 )}
                 <div className="mt-2">
                     <Badge variant={getStatusBadgeVariant(idea.status)} className="flex items-center gap-1 w-fit">
                        {getStatusIcon(idea.status)}
                        {idea.status}
                     </Badge>
                 </div>
              </div>
              <div className="flex-shrink-0 flex gap-2 pt-2 sm:pt-0 self-start sm:self-center">
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/ideas/edit/${idea.id}`}>
                        <Edit className="mr-1 h-3 w-3"/> Edit
                    </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                     <Button variant="destructive" size="sm" disabled={isDeleting === idea.id}>
                         {isDeleting === idea.id ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Trash2 className="mr-1 h-3 w-3"/>}
                        Delete
                     </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the idea
                        <span className="font-semibold"> "{idea.title}"</span>.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeleting === idea.id}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                         onClick={() => handleDelete(idea.id!, idea.title)}
                         disabled={isDeleting === idea.id}
                         className="bg-destructive hover:bg-destructive/90"
                      >
                         {isDeleting === idea.id ? 'Deleting...' : 'Yes, delete it'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-8">No ideas found. Click "Add New Idea" to create one.</p>
      )}
    </>
  );
}
