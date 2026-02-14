
'use client';

import * as React from 'react';
import type { ParticipationData } from '@/services/events';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import { CheckCircle, XCircle, Download, Users, UserCheck, UserX, Loader2, UserMinus, Trash2, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { UserOptions } from 'jspdf-autotable';
import { removeTeamMember, deleteTeam, type TeamWithMembers } from '@/services/teams';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: UserOptions) => jsPDF;
}

interface ParticipantListClientProps {
  participants: ParticipationData[];
  teams: TeamWithMembers[];
  eventName: string;
}

export function ParticipantListClient({ participants: initialParticipants, teams: initialTeams, eventName }: ParticipantListClientProps) {
  const [teams, setTeams] = React.useState<TeamWithMembers[]>(initialTeams);
  const [participants, setParticipants] = React.useState<ParticipationData[]>(initialParticipants);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const { userProfile } = useAuth();
  const { toast } = useToast();

  const userTeamMap = React.useMemo(() => {
    const map = new Map<string, string>();
    teams.forEach(team => {
      team.members.forEach(member => {
        map.set(member.id, team.name);
      });
    });
    return map;
  }, [teams]);

  const totalRegistered = participants.length;
  const totalAttended = participants.filter(p => !!p.attended_at).length;
  const totalAbsent = totalRegistered - totalAttended;

  const stats = [
    { title: "Total Registered", value: totalRegistered, icon: Users },
    { title: "Attended", value: totalAttended, icon: UserCheck },
    { title: "Absent", value: totalAbsent, icon: UserX },
  ];

  const handleDownloadPdf = () => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    
    doc.setFontSize(18);
    doc.text(`Participants for: ${eventName}`, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    const date = new Date().toLocaleString();
    doc.text(`Generated on: ${date}`, 14, 30);
    
    doc.autoTable({
      startY: 35,
      head: [['#', 'Name', 'Email', 'Team Name', 'Attendance']],
      body: participants.map((p, index) => [
        index + 1,
        p.user_name,
        p.user_email,
        userTeamMap.get(p.user_id) || 'Individual',
        p.attended_at ? `Attended (${format(parseISO(p.attended_at), 'Pp')})` : 'Not Attended',
      ]),
    });

    const fileName = `participants_${eventName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  const handleDownloadXlsx = () => {
    const dataToExport = participants.map((p, index) => ({
      '#': index + 1,
      'Name': p.user_name,
      'Email': p.user_email,
      'Phone': p.user_phone,
      'Registration Number': p.user_registration_number,
      'Branch': p.user_branch,
      'Semester': p.user_semester,
      'Team Name': userTeamMap.get(p.user_id) || 'Individual',
      'Attendance': p.attended_at ? `Attended (${format(parseISO(p.attended_at), 'Pp')})` : 'Not Attended',
      'Ticket ID': p.ticket_id,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Participants');
    
    const fileName = `participants_${eventName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };
  
  const handleRemoveMember = async (teamId: string, memberId: string) => {
    if (!userProfile) return;
    if (!confirm(`Are you sure you want to remove this member from the team? This action is irreversible.`)) return;

    setIsProcessing(true);
    try {
        const result = await removeTeamMember(teamId, memberId, userProfile.id);
        if (result.success) {
            toast({ title: "Member Removed", description: result.message });
            setTeams(prev => prev.map(t => {
                if (t.id === teamId) {
                    return { ...t, members: t.members.filter(m => m.id !== memberId) };
                }
                return t;
            }));
        } else {
            throw new Error(result.message);
        }
    } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
        setIsProcessing(false);
    }
  }

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm("Are you sure you want to permanently delete this team and all its members' associations?")) return;
    setIsProcessing(true);
    try {
        const result = await deleteTeam(teamId);
        if (result.success) {
            toast({ title: "Team Deleted", description: result.message });
            setTeams(prev => prev.filter(t => t.id !== teamId));
        } else {
            throw new Error(result.message);
        }
    } catch(error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
        setIsProcessing(false);
    }
  }

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return '?';
  };


  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map(stat => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      <Card>
          <CardHeader>
              <CardTitle>All Participants</CardTitle>
              <CardDescription>A list of every individual registered for the event, including team members.</CardDescription>
              <div className="flex flex-wrap justify-end pt-2 gap-2">
                <Button onClick={handleDownloadXlsx} variant="outline" size="sm" disabled={participants.length === 0}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Export as XLSX
                </Button>
                <Button onClick={handleDownloadPdf} size="sm" disabled={participants.length === 0}>
                    <Download className="mr-2 h-4 w-4" /> Download as PDF
                </Button>
              </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {participants.length > 0 ? (
                <Table>
                    <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Team</TableHead><TableHead>Attendance Status</TableHead></TableRow></TableHeader>
                    <TableBody>
                    {participants.map((p, index) => (
                        <TableRow key={p.id}><TableCell>{index + 1}</TableCell><TableCell className="font-medium">{p.user_name}</TableCell><TableCell>{p.user_email}</TableCell><TableCell>{userTeamMap.get(p.user_id) || <span className="text-muted-foreground italic">Individual</span>}</TableCell>
                        <TableCell>
                            {p.attended_at ? (<Badge variant="default" className="bg-green-600 hover:bg-green-700"><CheckCircle className="mr-1 h-3 w-3" /> Attended</Badge>) : (<Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" /> Not Attended</Badge>)}
                            {p.attended_at && (<p className="text-xs text-muted-foreground mt-1">{format(parseISO(p.attended_at), 'Pp')}</p>)}
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            ) : (<p className="text-muted-foreground text-center py-8">No participants have registered for this event yet.</p>)}
          </CardContent>
      </Card>
      
      <Separator />

      <Card>
          <CardHeader>
              <CardTitle>Team Management</CardTitle>
              <CardDescription>View and manage all teams registered for this event. This section is only visible to admins.</CardDescription>
          </CardHeader>
          <CardContent>
            {teams.length > 0 ? (
                <div className="space-y-4">
                    {teams.map(team => (
                        <div key={team.id} className="border p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold">{team.name} {team.is_locked && <Badge>Registered</Badge>}</h3>
                                {userProfile?.role === 'Super Admin' && (
                                  <Button variant="destructive" size="sm" onClick={() => handleDeleteTeam(team.id)} disabled={isProcessing}>
                                    <Trash2 className="mr-2 h-4 w-4"/> Delete Team
                                  </Button>
                                )}
                            </div>
                            <ul className="space-y-1 text-sm">
                                {team.members.map(member => (
                                    <li key={member.id} className="flex items-center justify-between p-1 rounded hover:bg-muted">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6"><AvatarImage src={member.photo_url || ''} /><AvatarFallback>{getInitials(member.name, member.email)}</AvatarFallback></Avatar>
                                            <span>{member.name} ({member.email})</span>
                                            {team.created_by === member.id && <Badge variant="secondary" size="sm">Leader</Badge>}
                                        </div>
                                        {userProfile?.role === 'Super Admin' && team.created_by !== member.id && (
                                            <Button variant="ghost" size="sm" onClick={() => handleRemoveMember(team.id, member.id)} disabled={isProcessing}>
                                                <UserMinus className="h-4 w-4"/>
                                            </Button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            ) : (<p className="text-muted-foreground text-center py-8">No teams have been formed for this event yet.</p>)}
          </CardContent>
      </Card>
    </div>
  );
}
