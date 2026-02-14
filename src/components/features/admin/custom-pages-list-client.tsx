
// This file is new
'use client';

import * as React from 'react';
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
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { MoreVertical, Loader2, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import type { CustomPage } from '@/services/custom-pages';
import { deleteCustomPage } from '@/services/custom-pages';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';

interface CustomPagesListClientProps {
  pages: CustomPage[];
}

export function CustomPagesListClient({ pages: initialPages }: CustomPagesListClientProps) {
  const [pages, setPages] = React.useState<CustomPage[]>(initialPages);
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);
  const [dialogState, setDialogState] = React.useState<{ isOpen: boolean; page?: CustomPage }>({ isOpen: false });

  const openDeleteDialog = (page: CustomPage) => {
    setDialogState({ isOpen: true, page });
  };

  const handleDelete = async () => {
    if (!dialogState.page) return;
    const { id, title } = dialogState.page;
    
    setIsDeleting(id);
    setDialogState({ isOpen: false });

    try {
      const result = await deleteCustomPage(id);
      if (result.success) {
        setPages(prevPages => prevPages.filter(p => p.id !== id));
        toast({ title: 'Page Deleted', description: `Page "${title}" has been deleted.` });
      } else {
        throw new Error(result.message || 'Failed to delete page.');
      }
    } catch (error) {
      toast({ title: 'Deletion Failed', description: error instanceof Error ? error.message : 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        {pages.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>URL Path</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell>
                    <Link href={`/${page.slug}`} target="_blank" className="text-primary hover:underline">
                      /{page.slug}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={page.is_published ? 'default' : 'secondary'}>
                      {page.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(page.updated_at), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm" className="mr-2">
                        <Link href={`/admin/pages/${page.id}/edit`}>
                            <Edit className="mr-1 h-3 w-3"/> Edit
                        </Link>
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(page)} disabled={isDeleting === page.id}>
                      {isDeleting === page.id ? <Loader2 className="animate-spin h-3 w-3" /> : <Trash2 className="mr-1 h-3 w-3" />}
                       Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground text-center py-8">No custom pages created yet.</p>
        )}
      </div>

      <AlertDialog open={dialogState.isOpen} onOpenChange={(isOpen) => setDialogState({ isOpen, page: isOpen ? dialogState.page : undefined })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the page "{dialogState.page?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
