
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2, Check, X, PlusCircle } from 'lucide-react';
import type { FeedbackData } from '@/services/feedback';
import { updateFeedbackStatus, deleteFeedback } from '@/services/feedback';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { AdminFeedbackModal } from './admin-feedback-modal';

interface FeedbackListClientProps {
  initialFeedback: FeedbackData[];
}

export function FeedbackListClient({ initialFeedback }: FeedbackListClientProps) {
  const [feedback, setFeedback] = React.useState<FeedbackData[]>(initialFeedback);
  const [isProcessing, setIsProcessing] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleStatusChange = async (feedbackItem: FeedbackData, newStatus: boolean) => {
    setIsProcessing(feedbackItem.id!);
    try {
      const result = await updateFeedbackStatus(feedbackItem.id!, newStatus);
      if (result.success) {
        setFeedback(prev => prev.map(f => f.id === feedbackItem.id ? { ...f, is_approved: newStatus } : f));
        toast({ title: `Feedback ${newStatus ? 'Approved' : 'Unapproved'}`, description: 'Status updated successfully.' });
        router.refresh();
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDelete = async (feedbackId: string) => {
    if (!confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) return;
    setIsProcessing(feedbackId);
    try {
      const result = await deleteFeedback(feedbackId);
      if (result.success) {
        setFeedback(prev => prev.filter(f => f.id !== feedbackId));
        toast({ title: 'Feedback Deleted' });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleFeedbackAdded = (newFeedback: FeedbackData) => {
    setFeedback(prev => [newFeedback, ...prev]);
    setIsModalOpen(false);
    router.refresh();
  };

  return (
    <>
      <div className="flex justify-end mb-4">
          <Button onClick={() => setIsModalOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Feedback
          </Button>
      </div>
      <div className="overflow-x-auto">
        {feedback.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Author</TableHead>
                <TableHead>Feedback</TableHead>
                <TableHead>Submitted On</TableHead>
                <TableHead className="text-center">Approved for Homepage</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedback.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium max-w-[150px] truncate">{item.author_name || 'Anonymous'}</TableCell>
                  <TableCell className="max-w-md">
                    <p className="line-clamp-3">{item.message}</p>
                  </TableCell>
                  <TableCell>{format(new Date(item.created_at!), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="text-center">
                    {isProcessing === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                    ) : (
                      <Switch
                        checked={item.is_approved}
                        onCheckedChange={(checked) => handleStatusChange(item, checked)}
                        aria-label="Toggle approval"
                      />
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id!)} disabled={isProcessing === item.id}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-muted-foreground py-8">No feedback submitted yet.</p>
        )}
      </div>
       <AdminFeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onFeedbackAdded={handleFeedbackAdded}
      />
    </>
  );
}
