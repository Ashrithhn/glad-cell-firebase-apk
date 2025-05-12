
'use client';

import * as React from 'react';
<<<<<<< HEAD
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
=======
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, MoreVertical, UserCog, ShieldAlert } from 'lucide-react';
import type { UserProfileData } from '@/services/admin'; // Type for user profile
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from '@/hooks/use-toast';
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)

interface UserListClientProps {
  users: UserProfileData[];
}

export function UserListClient({ users }: UserListClientProps) {
<<<<<<< HEAD
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
=======
  const [isActionPending, setIsActionPending] = React.useState<string | null>(null);

  const handleViewDetails = (userId: string) => {
    // Placeholder: Implement navigation to user detail page or modal
    toast({ title: "View Details", description: `Viewing details for user ID: ${userId} (Not Implemented)` });
  };

  const handleEditUser = (userId: string) => {
    // Placeholder: Implement navigation to user edit page or modal
    toast({ title: "Edit User", description: `Editing user ID: ${userId} (Not Implemented)` });
  };

  const handleDeleteUser = async (userId: string, userName?: string) => {
    // Placeholder: Implement delete user functionality with confirmation
    setIsActionPending(userId);
    toast({ title: "Delete User", description: `Attempting to delete user: ${userName || userId} (Not Implemented)`, variant: "destructive" });
    // Simulate async action
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsActionPending(null);
  };

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return '?';
  };

  return (
    <div className="overflow-x-auto">
      {users.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Semester</TableHead>
              <TableHead>Reg. No.</TableHead>
              <TableHead>Joined On</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.uid}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.photoURL || undefined} alt={user.name || 'User avatar'} data-ai-hint="person avatar" />
                      <AvatarFallback>{getInitials(user.name, user.email)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium truncate max-w-[150px]">{user.name || 'N/A'}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[150px]">{user.uid}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="truncate max-w-[200px]">{user.email || 'N/A'}</TableCell>
                <TableCell>{user.branch || 'N/A'}</TableCell>
                <TableCell>{user.semester || 'N/A'}</TableCell>
                <TableCell>{user.registrationNumber || 'N/A'}</TableCell>
                <TableCell>
                  {user.createdAt ? format(new Date(user.createdAt as string), 'MMM d, yyyy') : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={!!isActionPending}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleViewDetails(user.uid!)}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditUser(user.uid!)}>
                        <UserCog className="mr-2 h-4 w-4" /> Edit User
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                       {/* <DropdownMenuItem disabled>
                         <ShieldAlert className="mr-2 h-4 w-4" /> Manage Roles (soon)
                       </DropdownMenuItem> */}
                      <DropdownMenuItem
                        onClick={() => handleDeleteUser(user.uid!, user.name)}
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                        disabled={isActionPending === user.uid}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-muted-foreground text-center py-8">No users found.</p>
      )}
    </div>
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
  );
}
