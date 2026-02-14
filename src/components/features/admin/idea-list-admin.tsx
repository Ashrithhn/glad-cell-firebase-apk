
'use client';

import * as React from 'react';
import type { IdeaData } from '@/services/ideas';
import { updateIdeaStatus } from '@/services/ideas';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from '@/hooks/use-toast';
import { MoreVertical, CheckCircle, XCircle, Clock, Loader2, User, Building2, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import Link from 'next/link';

interface IdeaListAdminProps {
  initialIdeas: IdeaData[];
}

export function IdeaListAdmin({ initialIdeas }: IdeaListAdminProps) {
  const [ideas, setIdeas] = React.useState<IdeaData[]>(initialIdeas);
  const [isUpdating, setIsUpdating] = React.useState<string | null>(null);
  const [dialogState, setDialogState] = React.useState<{ isOpen: boolean; ideaId?: string; newStatus?: IdeaData['status'] }>({ isOpen: false });

  const handleStatusChange = async () => {
    if (!dialogState.ideaId || !dialogState.newStatus) return;
    const ideaId = dialogState.ideaId;
    const newStatus = dialogState.newStatus;
    
    setIsUpdating(ideaId);
    setDialogState({ isOpen: false }); // Close dialog immediately

    try {
      const result = await updateIdeaStatus(ideaId, newStatus);
      if (result.success) {
        setIdeas(prevIdeas =>
          prevIdeas.map(idea =>
            idea.id === ideaId ? { ...idea, status: newStatus, updated_at: new Date().toISOString() } : idea
          )
        );
        toast({
          title: 'Status Updated',
          description: `Idea status changed to "${newStatus}".`,
          className: 'bg-accent text-accent-foreground',
        });
      } else {
        throw new Error(result.message || 'Failed to update status.');
      }
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const openConfirmationDialog = (ideaId: string, newStatus: IdeaData['status']) => {
    setDialogState({ isOpen: true, ideaId, newStatus });
  };
  
  const getStatusBadgeVariant = (status: IdeaData['status']) => {
    switch (status) {
      case 'Approved': return 'default';
      case 'Pending': return 'secondary';
      case 'Rejected': return 'destructive';
      case 'Implemented': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        {ideas.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Submitter</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ideas.map((idea) => (
                <TableRow key={idea.id}>
                  <TableCell className="font-medium max-w-xs truncate" title={idea.title}>{idea.title}</TableCell>
                  <TableCell><User className="h-4 w-4 inline-block mr-1" />{idea.submitter_name || 'N/A'}</TableCell>
                  <TableCell><Building2 className="h-4 w-4 inline-block mr-1" />{idea.department || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(idea.status)} className="capitalize">
                      {idea.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {idea.created_at ? format(parseISO(idea.created_at), 'MMM d, yyyy') : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={isUpdating === idea.id}>
                          {isUpdating === idea.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/ideas/${idea.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" /> Edit Idea
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openConfirmationDialog(idea.id!, 'Approved')}>
                          <CheckCircle className="mr-2 h-4 w-4 text-accent" /> Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openConfirmationDialog(idea.id!, 'Rejected')}>
                          <XCircle className="mr-2 h-4 w-4 text-destructive" /> Reject
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openConfirmationDialog(idea.id!, 'Pending')}>
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" /> Mark as Pending
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground text-center py-8">No ideas found.</p>
        )}
      </div>

      <AlertDialog open={dialogState.isOpen} onOpenChange={(isOpen) => setDialogState(prev => ({ ...prev, isOpen }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will change the idea's status to <span className={cn('font-semibold', {
                  'text-accent': dialogState.newStatus === 'Approved',
                  'text-destructive': dialogState.newStatus === 'Rejected',
              })}>{dialogState.newStatus}</span>. Do you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStatusChange}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
