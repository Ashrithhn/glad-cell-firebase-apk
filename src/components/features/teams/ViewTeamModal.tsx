
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
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
import { useAuth } from '@/hooks/use-auth';
import { Loader2, User, Copy, Users, Check, AlertTriangle, Lock, UserX, Trash2, CheckCircle, XCircle } from 'lucide-react';
import type { EventData } from '@/services/events';
import { TeamWithMembers, processFreeTeamRegistration, leaveTeam, removeTeamMember, respondToJoinRequest } from '@/services/teams';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface ViewTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventData;
  team?: TeamWithMembers;
  onTeamModified: () => void;
}

export function ViewTeamModal({ isOpen, onClose, event, team, onTeamModified }: ViewTeamModalProps) {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [dialogState, setDialogState] = React.useState<{ type: 'leave' | 'remove'; memberId?: string; memberName?: string; isOpen: boolean }>({ type: 'leave', isOpen: false });

  if (!team) return null;

  const isLeader = team.created_by === userId;
  const isTeamTooSmall = team.members.length < (event.min_team_size || 0);
  const isTeamFull = team.members.length >= (event.max_team_size || Infinity);
  const canRegister = isLeader && !team.is_locked && !isTeamTooSmall;
  
  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return '?';
  };
  
  const handleCopyCode = () => {
      navigator.clipboard.writeText(team.join_code);
      setCopied(true);
      toast({ title: "Copied!", description: "Join code copied to clipboard."});
      setTimeout(() => setCopied(false), 2000);
  }

  const handleRegisterTeam = async () => {
    if (!canRegister) return;
    setIsProcessing(true);

    if (event.fee > 0) {
      toast({ title: "Coming Soon", description: "Paid team registration will be enabled shortly.", variant: "default" });
      setIsProcessing(false);
      return;
    }

    try {
      const result = await processFreeTeamRegistration({ eventId: event.id!, teamId: team.id, eventName: event.name });
      if (result.success) {
        toast({ title: "Team Registered!", description: result.message, variant: 'default' });
        onTeamModified();
        onClose();
      } else {
        throw new Error(result.message || "An unknown error occurred during registration.");
      }
    } catch (error: any) {
      toast({ title: "Registration Failed", description: error.message, variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLeaveOrRemove = async () => {
    if (!dialogState.isOpen || !userId) return;

    setIsProcessing(true);
    let result;
    try {
      if (dialogState.type === 'leave') {
        result = await leaveTeam(team.id, userId);
      } else if (dialogState.type === 'remove' && dialogState.memberId) {
        result = await removeTeamMember(team.id, dialogState.memberId, userId);
      } else {
        throw new Error("Invalid action.");
      }
      
      if (result.success) {
        toast({ title: "Success!", description: result.message, variant: 'default' });
        onTeamModified();
        // onClose(); // Dont close, just refresh
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({ title: "Action Failed", description: error.message, variant: 'destructive' });
    } finally {
      setIsProcessing(false);
      setDialogState({ isOpen: false, type: 'leave' });
    }
  };


  const openConfirmationDialog = (type: 'leave' | 'remove', memberId?: string, memberName?: string) => {
    setDialogState({ isOpen: true, type, memberId, memberName });
  }

  const handleRequestResponse = async (requestId: string, decision: 'accept' | 'reject') => {
    if (!userId) return;
    setIsProcessing(true);
    try {
        const result = await respondToJoinRequest(requestId, decision, userId);
        if (result.success) {
            toast({ title: 'Request Handled', description: `The join request has been ${decision}ed.`});
            onTeamModified();
        } else {
            throw new Error(result.message);
        }
    } catch (error: any) {
        toast({ title: "Action Failed", description: error.message, variant: "destructive" });
    } finally {
        setIsProcessing(false);
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Users className="h-6 w-6 text-primary"/> Team: {team.name}</DialogTitle>
            <DialogDescription>
              Managing your team for the event: {event.name}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
              {isLeader && !team.is_locked && !isTeamFull && (
                  <div className="space-y-2">
                      <Label className="font-semibold">Share this code to invite members:</Label>
                      <div className="flex items-center gap-2">
                           <div className="flex-grow p-2 border rounded-md bg-muted font-mono text-lg tracking-widest text-center">
                              {team.join_code}
                          </div>
                          <Button variant="outline" size="icon" onClick={handleCopyCode}>
                              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                          </Button>
                      </div>
                  </div>
              )}
              
              <div className="space-y-3">
                   <Label className="font-semibold">Members ({team.members.length} / {event.max_team_size || '∞'})</Label>
                  <div className="space-y-2 rounded-md border p-2">
                      {team.members.map(member => (
                          <div key={member.id} className="flex items-center gap-3 p-1">
                              <Avatar className="h-8 w-8">
                                  <AvatarImage src={member.photo_url || undefined} alt={member.name || 'User avatar'} />
                                  <AvatarFallback>{getInitials(member.name, member.email)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-grow">
                                  <p className="text-sm font-medium">{member.name}</p>
                                  <p className="text-xs text-muted-foreground">{member.email}</p>
                              </div>
                              {team.created_by === member.id && <Badge variant="secondary">Leader</Badge>}
                              {isLeader && member.id !== userId && !team.is_locked && (
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openConfirmationDialog('remove', member.id, member.name || 'this member')}>
                                    <UserX className="h-4 w-4 text-destructive"/>
                                </Button>
                              )}
                          </div>
                      ))}
                  </div>
              </div>

               {isLeader && !team.is_locked && team.join_requests && team.join_requests.length > 0 && (
                <div className="space-y-3">
                    <Label className="font-semibold">Pending Requests ({team.join_requests.length})</Label>
                    <div className="space-y-2 rounded-md border p-2">
                        {team.join_requests.map(req => (
                            <div key={req.id} className="flex items-center gap-3 p-1">
                                <Avatar className="h-8 w-8"><AvatarImage src={req.users?.photo_url || ''} /><AvatarFallback>{getInitials(req.users?.name, req.users?.email)}</AvatarFallback></Avatar>
                                <div className="flex-grow">
                                    <p className="text-sm font-medium">{req.users?.name}</p>
                                    <p className="text-xs text-muted-foreground">{req.users?.email}</p>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRequestResponse(req.id, 'accept')} disabled={isProcessing}><CheckCircle className="h-5 w-5 text-green-500"/></Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRequestResponse(req.id, 'reject')} disabled={isProcessing}><XCircle className="h-5 w-5 text-destructive"/></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
               )}

              
              {isTeamTooSmall && !team.is_locked && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Team Incomplete</AlertTitle>
                    <AlertDescription>
                      Your team needs at least {event.min_team_size} members to be eligible for registration.
                    </AlertDescription>
                  </Alert>
              )}
               {team.is_locked && (
                  <Alert variant="default" className="bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700">
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <AlertTitle className="text-green-800 dark:text-green-300">Team Registered!</AlertTitle>
                      <AlertDescription className="text-green-700 dark:text-green-400">
                          This team has been successfully registered for the event.
                      </AlertDescription>
                  </Alert>
               )}
          </div>

          <DialogFooter className="pt-4 flex-col sm:flex-row sm:justify-between w-full">
              <div className="flex gap-2">
                {!isLeader && !team.is_locked && (
                  <Button variant="destructive" onClick={() => openConfirmationDialog('leave')} disabled={isProcessing} className="w-full sm:w-auto">
                    {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Leave Team
                  </Button>
                )}
                 <DialogClose asChild>
                    <Button type="button" variant="outline" className="w-full sm:w-auto">Close</Button>
                </DialogClose>
              </div>
              {isLeader && (
                  <Button onClick={handleRegisterTeam} disabled={isProcessing || !canRegister} className="w-full sm:w-auto">
                      {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {team.is_locked ? <><Lock className="mr-2 h-4 w-4" /> Team Locked</> : 'Register Team'}
                  </Button>
              )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={dialogState.isOpen} onOpenChange={(isOpen) => setDialogState(prev => ({ ...prev, isOpen }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogState.type === 'leave' ? 'You are about to leave this team. You can join another team for this event if you wish.' : `Do you really want to remove ${dialogState.memberName} from the team?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeaveOrRemove} disabled={isProcessing} className="bg-destructive hover:bg-destructive/90">
                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

const Label = ({ className, ...props }: React.ComponentProps<'label'>) => (
  <label className={className} {...props} />
);
