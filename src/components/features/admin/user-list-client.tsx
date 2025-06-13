
'use client';

import * as React from 'react';
import type { UserProfileSupabase as UserProfileData } from '@/services/users'; // Changed type import
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Loader2, Mail, Building, Hash } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
// import { deleteUserAccountAction, updateUserRoleAction } from '@/services/users'; // Placeholder for future actions

interface UserListClientProps {
  users: UserProfileData[];
}

export function UserListClient({ users }: UserListClientProps) {
  const [isProcessing, setIsProcessing] = React.useState<string | null>(null); // Store user ID (string for Supabase)
  const router = useRouter();

  const handleViewDetails = (userId: string) => {
    // Navigate to a detailed user view page (to be created)
    // router.push(`/admin/users/${userId}`);
    toast({ title: "View Details", description: `Feature to view details for user ${userId} coming soon.`});
  };

  const handleEditUser = (userId: string) => {
    // Navigate to an edit user page (to be created)
    // router.push(`/admin/users/edit/${userId}`);
     toast({ title: "Edit User", description: `Feature to edit user ${userId} coming soon.`});
  };

  const handleDeleteUser = async (userId: string, userName?: string | null) => {
    setIsProcessing(userId);
    // const confirmDelete = window.confirm(`Are you sure you want to delete user ${userName || userId}? This action cannot be undone.`);
    // if (!confirmDelete) {
    //     setIsProcessing(null);
    //     return;
    // }
    // try {
    //   const result = await deleteUserAccountAction(userId); // Placeholder for actual delete action
    //   if (result.success) {
    //     toast({ title: 'User Deleted', description: `User ${userName || userId} has been deleted.` });
    //     router.refresh();
    //   } else {
    //     throw new Error(result.message || 'Failed to delete user.');
    //   }
    // } catch (error) {
    //   toast({ title: 'Error Deleting User', description: error instanceof Error ? error.message : 'An unexpected error occurred.', variant: 'destructive' });
    // } finally {
    //   setIsProcessing(null);
    // }
     toast({ title: "Delete User", description: `Feature to delete user ${userId} coming soon.`, variant: 'destructive'});
     setIsProcessing(null);
  };
  
  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return '?';
  };


  return (
    <>
      {users.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Avatar</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="hidden md:table-cell">Branch</TableHead>
                <TableHead className="hidden lg:table-cell">Reg. No.</TableHead>
                <TableHead className="hidden lg:table-cell">Auth Provider</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}><TableCell>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.photo_url || undefined} alt={user.name || 'User avatar'} />
                      <AvatarFallback>{getInitials(user.name, user.email)}</AvatarFallback>
                    </Avatar>
                  </TableCell><TableCell className="font-medium">{user.name || 'N/A'}
                  </TableCell><TableCell>
                    <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-muted-foreground"/> {user.email || 'N/A'}
                    </div>
                  </TableCell><TableCell className="hidden md:table-cell">
                     <div className="flex items-center gap-1">
                        <Building className="h-3 w-3 text-muted-foreground"/> {user.branch || 'N/A'}
                    </div>
                  </TableCell><TableCell className="hidden lg:table-cell">
                     <div className="flex items-center gap-1">
                        <Hash className="h-3 w-3 text-muted-foreground"/> {user.registration_number || 'N/A'}
                    </div>
                  </TableCell><TableCell className="hidden lg:table-cell">
                    <Badge variant={user.auth_provider === 'google' ? 'default' : 'secondary'}>
                        {user.auth_provider || 'email'}
                    </Badge>
                  </TableCell><TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="icon" onClick={() => handleViewDetails(user.id!)} title="View Details" disabled={isProcessing === user.id}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleEditUser(user.id!)} title="Edit User" disabled={isProcessing === user.id}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDeleteUser(user.id!, user.name)} title="Delete User" disabled={isProcessing === user.id}>
                        {isProcessing === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-8">No registered users found.</p>
      )}
    </>
  );
}
