
'use client';

import * as React from 'react';
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

interface UserListClientProps {
  users: UserProfileData[];
}

export function UserListClient({ users }: UserListClientProps) {
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
  );
}
