
'use client';

import * as React from 'react';
import type { UserProfileSupabase as UserProfileData } from '@/services/users';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, MoreVertical, Loader2, Download, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { UserOptions } from 'jspdf-autotable';
import { deleteUser } from '@/services/users';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: UserOptions) => jsPDF;
}

interface UserListClientProps {
  initialUsers: UserProfileData[];
}

export function UserListClient({ initialUsers }: UserListClientProps) {
  const [users, setUsers] = React.useState<UserProfileData[]>([]);
  const [isActionPending, setIsActionPending] = React.useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = React.useState<{ isOpen: boolean; user?: UserProfileData }>({ isOpen: false });
  const { toast } = useToast();
  const router = useRouter();
  const { userProfile, loading: authLoading } = useAuth();

  React.useEffect(() => {
    if (!authLoading && userProfile && initialUsers) {
      if (userProfile.role === 'Admin') {
        // Admins should not see Super Admins
        setUsers(initialUsers.filter(u => u.role !== 'Super Admin'));
      } else {
        // Super Admins can see everyone
        setUsers(initialUsers);
      }
    } else {
        setUsers(initialUsers);
    }
  }, [initialUsers, userProfile, authLoading]);

  const participantUsers = users.filter(user => user.role === 'Participant');

  const handleDownloadPdf = () => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    
    doc.setFontSize(18);
    doc.text("Registered Participant List", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    const date = new Date().toLocaleString();
    doc.text(`Generated on: ${date}`, 14, 30);
    
    doc.autoTable({
        startY: 35,
        head: [['#', 'Name', 'Email', 'Reg. Number', 'Branch', 'Semester', 'Joined On']],
        body: participantUsers.map((user, index) => [
            index + 1,
            user.name || 'N/A',
            user.email || 'N/A',
            user.registration_number || 'N/A',
            user.branch || 'N/A',
            user.semester || 'N/A',
            user.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : 'N/A',
        ]),
    });

    const fileName = `participant_users_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };
  
  const handleDownloadXlsx = () => {
    const dataToExport = participantUsers.map((user, index) => ({
      '#': index + 1,
      'Name': user.name || 'N/A',
      'Email': user.email || 'N/A',
      'Registration Number': user.registration_number || 'N/A',
      'Branch': user.branch || 'N/A',
      'Semester': user.semester || 'N/A',
      'Role': user.role || 'Participant',
      'Joined On': user.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : 'N/A',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Participants');
    const fileName = `participant_users_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const confirmDeleteUser = async () => {
    if (!deleteConfirmation.user?.id) return;
    const userId = deleteConfirmation.user.id;
    const userName = deleteConfirmation.user.name;

    setIsActionPending(userId);
    setDeleteConfirmation({ isOpen: false });

    const result = await deleteUser(userId);
    if (result.success) {
      toast({ title: "User Deleted", description: `User ${userName || userId} has been permanently deleted.` });
      setUsers(prev => prev.filter(u => u.id !== userId));
      router.refresh();
    } else {
      toast({ title: "Deletion Failed", description: result.message, variant: "destructive" });
    }
    setIsActionPending(null);
  };

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return '?';
  };
  
  const getRoleBadgeVariant = (role?: string | null) => {
     switch (role) {
      case 'Super Admin': return 'destructive';
      case 'Admin': return 'default';
      default: return 'outline';
    }
  }

  return (
    <>
      <div className="flex flex-wrap justify-end mb-4 gap-2">
         <Button onClick={handleDownloadXlsx} variant="outline" size="sm" disabled={participantUsers.length === 0}>
            <FileSpreadsheet className="mr-2 h-4 w-4" /> Export as XLSX
        </Button>
        <Button onClick={handleDownloadPdf} size="sm" disabled={participantUsers.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Download as PDF
        </Button>
      </div>
      <div className="overflow-x-auto">
        {authLoading ? (
             <div className="p-4 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        ) : users.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.photo_url || undefined} alt={user.name || 'User avatar'} data-ai-hint="person avatar" />
                        <AvatarFallback>{getInitials(user.name, user.email)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium truncate max-w-[150px]">{user.name || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">{user.registration_number}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="truncate max-w-[200px]">{user.email || 'N/A'}</TableCell>
                  <TableCell><Badge variant={getRoleBadgeVariant(user.role)}>{user.role || 'Participant'}</Badge></TableCell>
                  <TableCell>
                    {user.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={!!isActionPending}>
                          {isActionPending === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/users/${user.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" /> Edit User
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteConfirmation({ isOpen: true, user })}
                          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                          disabled={isActionPending === user.id || user.id === userProfile?.id}
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

       <AlertDialog open={deleteConfirmation.isOpen} onOpenChange={(isOpen) => setDeleteConfirmation({ isOpen, user: isOpen ? deleteConfirmation.user : undefined })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user <span className="font-bold">{deleteConfirmation.user?.name}</span> ({deleteConfirmation.user?.email}) and all of their associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser} className="bg-destructive hover:bg-destructive/90">
              Yes, delete user
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
