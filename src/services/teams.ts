
'use server';

import type { UserProfileSupabase } from './auth';
import type { EventData, ParticipationData } from './events';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { participateInEvent, getUserProfile } from './events';
import { createNotification } from './notifications';
import { createSupabaseServerClient } from '@/lib/server-utils';
import { supabaseAdmin } from '@/lib/supabaseAdminClient';
import { sendTeamConfirmationEmail } from './email';

export interface Team {
    id: string;
    name: string;
    event_id: string;
    created_by: string;
    join_code: string;
    is_locked: boolean;
    created_at: string;
    college_id?: string | null;
}

export interface TeamMember {
    id: string;
    name?: string | null;
    email?: string | null;
    photo_url?: string | null;
}

export interface TeamJoinRequest {
    id: string;
    team_id: string;
    user_id: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    users?: Pick<UserProfileSupabase, 'id' | 'name' | 'email' | 'photo_url'> | null;
}

export interface TeamWithMembers extends Team {
    members: TeamMember[];
    events?: Pick<EventData, 'min_team_size' | 'max_team_size' | 'name' | 'venue' | 'start_date'> | null;
    join_requests?: TeamJoinRequest[];
}

// Generates a random 6-character alphanumeric join code.
function generateJoinCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const generateTicketId = () => `GECM${Date.now()}${crypto.randomBytes(2).toString('hex').toUpperCase()}A`;

/**
 * Creates a new team for an event.
 */
export async function createTeam(
  eventId: string,
  userId: string,
  teamName: string,
  collegeId?: string | null
): Promise<{ success: boolean; team?: TeamWithMembers; message?: string }> {
  const supabase = createSupabaseServerClient();
  
  if (!supabaseAdmin) {
    return { success: false, message: 'Team service is currently unavailable.' };
  }

  const joinCode = generateJoinCode();

  try {
    // Check if user is already in a team for this event
    const { data: teamsForEvent, error: eventTeamsError } = await supabase
      .from('teams')
      .select('id')
      .eq('event_id', eventId);

    if (eventTeamsError) throw eventTeamsError;

    if (teamsForEvent && teamsForEvent.length > 0) {
        const teamIdsForEvent = teamsForEvent.map(t => t.id);

        const { data: memberInEvent, error: memberCheckError } = await supabase
            .from('team_members')
            .select('team_id')
            .eq('user_id', userId)
            .in('team_id', teamIdsForEvent)
            .limit(1)
            .single();
            
        if (memberCheckError && memberCheckError.code !== 'PGRST116') throw memberCheckError;
        
        if (memberInEvent) {
            return { success: false, message: 'You are already in a team for this event.' };
        }
    }


    const { data: newTeam, error: teamError } = await supabaseAdmin
      .from('teams')
      .insert({
        name: teamName,
        event_id: eventId,
        created_by: userId,
        join_code: joinCode,
        college_id: collegeId,
      })
      .select()
      .single();

    if (teamError) throw teamError;
    if (!newTeam) throw new Error('Failed to create team.');

    const { error: memberError } = await supabaseAdmin
      .from('team_members')
      .insert({ team_id: newTeam.id, user_id: userId });

    if (memberError) throw memberError;

    const { data: teamDetails, error: finalTeamError } = await getTeamWithMembers(newTeam.id);
    if(finalTeamError || !teamDetails) throw new Error('Team created, but failed to fetch details.');
    
    // Notify the creator
    await createNotification({
      user_id: userId,
      title: "Team Created!",
      message: `You created "${teamName}". Share join code ${joinCode} to invite members.`,
      link: `/programs#${eventId}`
    });

    revalidatePath('/programs');
    return { success: true, team: teamDetails };
  } catch (error: any) {
    return { success: false, message: `Could not create team: ${error.message}` };
  }
}

/**
 * Allows a user to request to join an existing team using a join code.
 */
export async function requestToJoinTeam(
  joinCode: string,
  userId: string
): Promise<{ success: boolean; message?: string }> {
  
  const supabase = createSupabaseServerClient(); // User-scoped client to respect RLS for initial checks

  if (!supabaseAdmin) {
    return { success: false, message: 'Team service is currently unavailable.' };
  }

  try {
    // First, find the team using the user's permissions. This ensures the team is visible
    // to the user, which is crucial for the foreign key constraint to pass later, even when using supabaseAdmin.
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*, events(max_team_size, name, id)')
      .eq('join_code', joinCode.toUpperCase())
      .single();

    // Give a more generic error message that covers both "not found" and "no permission" scenarios.
    if (teamError || !team) return { success: false, message: 'Invalid join code or team is not accessible.' };
    
    if (team.is_locked) return { success: false, message: 'This team is locked and cannot be joined.' };

    // Use supabaseAdmin for checks that require broader visibility, like counting all members.
    const { data: members, error: membersError } = await supabaseAdmin
        .from('team_members')
        .select('user_id', { count: 'exact' })
        .eq('team_id', team.id);
    
    if (membersError) throw membersError;

    const memberCount = members?.length ?? 0;
    if (members && members.some((m: any) => m.user_id === userId)) {
        return { success: false, message: 'You are already in this team.' };
    }
    
    const maxTeamSize = team.events?.max_team_size;
    if (maxTeamSize && memberCount >= maxTeamSize) {
      return { success: false, message: `This team is full (max ${maxTeamSize} members).` };
    }
    
    // Use admin client to check for existing requests to avoid any RLS issues on this table.
    const {data: existingRequest, error: requestCheckError} = await supabaseAdmin
      .from('team_join_requests')
      .select('id')
      .eq('team_id', team.id)
      .eq('user_id', userId)
      .eq('status', 'pending')
      .single();
    if(requestCheckError && requestCheckError.code !== 'PGRST116') throw requestCheckError;
    if(existingRequest) return {success: false, message: 'You have already sent a request to join this team.'};


    // Now, perform the insert using the ADMIN client to bypass any insert-specific RLS.
    const { error: insertError } = await supabaseAdmin
      .from('team_join_requests')
      .insert({ team_id: team.id, user_id: userId, status: 'pending' });
      
    if (insertError) throw insertError;
    
    // Notify team leader
    const { data: requestingUser } = await getUserProfile(userId);
    await createNotification({
        user_id: team.created_by,
        title: "New Join Request!",
        message: `${requestingUser?.data?.name || 'A user'} wants to join your team "${team.name}".`,
        link: `/programs#${team.event_id}`
    });
    
    revalidatePath('/programs');
    return { success: true, message: 'Your request to join has been sent.' };
  } catch (error: any) {
    return { success: false, message: `Could not send request: ${error.message}` };
  }
}

/**
 * Allows a team leader to respond to a join request.
 */
export async function respondToJoinRequest(
    requestId: string,
    decision: 'accept' | 'reject',
    leaderId: string
): Promise<{ success: boolean; message?: string }> {
    const supabase = createSupabaseServerClient();

    if (!supabaseAdmin) {
        return { success: false, message: 'Team service is currently unavailable.' };
    }

    try {
        const {data: request, error: requestError} = await supabase.from('team_join_requests').select('*, teams(created_by, name, is_locked, event_id)').eq('id', requestId).single();

        if (requestError || !request) return {success: false, message: 'Join request not found.'};
        if (request.teams?.created_by !== leaderId) return {success: false, message: 'Only the team leader can respond to requests.'};
        if (request.teams?.is_locked) return {success: false, message: 'Cannot modify a locked team.'};
        
        if (decision === 'accept') {
            const { error: memberInsertError } = await supabaseAdmin.from('team_members').insert({ team_id: request.team_id, user_id: request.user_id });
            if (memberInsertError) throw new Error(`Failed to add member: ${memberInsertError.message}`);

            await createNotification({
                user_id: request.user_id,
                title: 'Team Request Accepted!',
                message: `Your request to join "${request.teams.name}" has been accepted.`,
                link: `/programs#${request.teams.event_id}`
            });
        } else {
             await createNotification({
                user_id: request.user_id,
                title: 'Team Request Update',
                message: `Your request to join "${request.teams.name}" was not accepted.`,
                link: `/programs#${request.teams.event_id}`
            });
        }
        
        const { error: deleteError } = await supabaseAdmin.from('team_join_requests').delete().eq('id', requestId);
        if (deleteError) throw new Error(`Failed to remove request: ${deleteError.message}`);

        revalidatePath('/programs');
        return { success: true, message: `Request has been ${decision}ed.` };

    } catch (error: any) {
        return { success: false, message: `Failed to respond to request: ${error.message}` };
    }
}


/**
 * Fetches all teams a user is a member of.
 */
export async function getTeamsForUser(userId: string): Promise<{ success: boolean; teams?: TeamWithMembers[]; message?: string }> {
  const supabase = createSupabaseServerClient();
  
  try {
    const { data: memberOf, error: memberError } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId);

    if (memberError) throw memberError;
    if (!memberOf || memberOf.length === 0) {
      return { success: true, teams: [] };
    }

    const teamIds = memberOf.map(m => m.team_id);

    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        members:team_members(users(id, name, email, photo_url)),
        events(min_team_size, max_team_size, name, venue, start_date),
        join_requests:team_join_requests(*, users(id, name, email, photo_url))
      `)
      .in('id', teamIds);
      
    if (error) throw error;
    
    const formattedData = data?.map(team => ({
        ...team,
        members: team.members.map((m: any) => m.users)
    })) || [];

    return { success: true, teams: formattedData as TeamWithMembers[] };
  } catch (error: any) {
    return { success: false, message: `Could not fetch teams: ${error.message}` };
  }
}


/**
 * Fetches a single team with its members.
 */
export async function getTeamWithMembers(teamId: string): Promise<{ success: boolean; data?: TeamWithMembers; message?: string }> {
    const supabase = createSupabaseServerClient();
    
    try {
        const { data, error } = await supabase
            .from('teams')
            .select(`
                *,
                members:team_members(users(id, name, email, photo_url)),
                events(min_team_size, max_team_size, name, venue, start_date),
                join_requests:team_join_requests(*, users(id, name, email, photo_url))
            `)
            .eq('id', teamId)
            .single();

        if (error) throw error;
        
        const formattedData = {
            ...data,
            members: data.members.map((m: any) => m.users)
        };

        return { success: true, data: formattedData as TeamWithMembers };
    } catch (error: any) {
        return { success: false, message: `Could not fetch team details: ${error.message}` };
    }
}

/**
 * Fetches all teams and their members for a specific event.
 */
export async function getTeamsAndMembersForEvent(eventId: string): Promise<{ success: boolean; teams?: TeamWithMembers[]; message?: string }> {
  const supabase = createSupabaseServerClient();
  
  try {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        members:team_members(users(id, name, email, photo_url))
      `)
      .eq('event_id', eventId);
      
    if (error) throw error;
    
    const formattedData = data?.map(team => ({
        ...team,
        members: team.members.map((m: any) => m.users)
    })) || [];

    return { success: true, teams: formattedData as TeamWithMembers[] };
  } catch (error: any) {
    return { success: false, message: `Could not fetch teams for event: ${error.message}` };
  }
}

/**
 * Registers a team for a free event. Creates participation records for all members.
 */
export async function processFreeTeamRegistration(details: {
  eventId: string;
  teamId: string;
  eventName: string;
}): Promise<{ success: boolean; message?: string }> {
  if (!supabaseAdmin) {
    return { success: false, message: 'Team service is currently unavailable.' };
  }
  const { eventId, teamId, eventName } = details;
  
  try {
    const { data: teamWithDetails, error: teamError } = await getTeamWithMembers(teamId);
    if (teamError || !teamWithDetails) {
      throw new Error(`Failed to fetch team details for team ID: ${teamId}`);
    }

    const { name: teamName, events: eventDetails } = teamWithDetails;

    for (const member of teamWithDetails.members) {
      const profileResult = await getUserProfile(member.id);
      if (!profileResult.success || !profileResult.data) {
        console.warn(`Could not find profile for team member ${member.id}, skipping their registration.`);
        continue;
      }
      const userDetails = profileResult.data;

      const participationId = crypto.randomUUID();
      const qrDataString = JSON.stringify({ orderId: participationId, eventId, userId: member.id, timestamp: Date.now() });
      const qrCodeDataUri = await QRCode.toDataURL(qrDataString);

      const participationPayload: ParticipationData = {
        id: participationId,
        ticket_id: generateTicketId(),
        user_id: userDetails.id,
        event_id: eventId,
        event_name: eventName,
        user_name: userDetails.name || '',
        user_email: userDetails.email || '',
        user_phone: (userDetails as any).phone || '',
        user_branch: userDetails.branch || '',
        user_semester: parseInt(String(userDetails.semester), 10) || 0,
        user_registration_number: userDetails.registration_number || '',
        payment_details: null,
        qr_code_data_uri: qrCodeDataUri || null,
      };

      await participateInEvent(participationPayload);

      // Send confirmation email
      await sendTeamConfirmationEmail({
          to: userDetails.email!,
          participantName: userDetails.name!,
          eventName: eventDetails?.name!,
          teamName: teamName,
          venue: eventDetails?.venue!,
          startDate: eventDetails?.start_date!
      });

      // Create in-app notification
      await createNotification({
        user_id: userDetails.id,
        title: "Your Team is Registered!",
        message: `Your team "${teamName}" has been registered for the event: ${eventName}.`,
        link: '/profile'
      });
    }

    await supabaseAdmin.from('teams').update({ is_locked: true }).eq('id', teamId);
    
    revalidatePath('/programs');
    revalidatePath('/profile');
    
    return { success: true, message: 'Team registered successfully! All members will receive a confirmation email and can find their tickets in their profile.' };
  } catch (error: any) {
    return { success: false, message: `Error processing free team registration: ${error.message}.` };
  }
}

/**
 * Allows a team member to leave a team.
 */
export async function leaveTeam(teamId: string, userId: string): Promise<{ success: boolean; message?: string }> {
    const supabase = createSupabaseServerClient();
    if (!supabaseAdmin) {
        return { success: false, message: 'Team service is currently unavailable.' };
    }

    try {
        const { data: team } = await supabase.from('teams').select('is_locked, created_by, name').eq('id', teamId).single();
        if (!team) return { success: false, message: 'Team not found.' };
        if (team.is_locked) return { success: false, message: 'Cannot leave a team that is already registered for an event.' };
        if (team.created_by === userId) return { success: false, message: 'Team leader cannot leave the team. Please transfer leadership or delete the team.' };

        const { error } = await supabaseAdmin.from('team_members').delete().match({ team_id: teamId, user_id: userId });
        if (error) throw error;
        
        const { data: leavingUser } = await getUserProfile(userId);
        await createNotification({
            user_id: team.created_by,
            title: "A Member Left Your Team",
            message: `${leavingUser?.data?.name || 'A member'} has left your team "${team.name}".`
        });

        revalidatePath('/programs');
        return { success: true, message: 'You have left the team.' };
    } catch (error: any) {
        return { success: false, message: `Could not leave team: ${error.message}` };
    }
}

/**
 * Allows a team leader or admin to remove a member from a team.
 */
export async function removeTeamMember(teamId: string, memberIdToRemove: string, requesterId: string): Promise<{ success: boolean; message?: string }> {
    const supabase = createSupabaseServerClient();
    if (!supabaseAdmin) {
        return { success: false, message: 'Team service is currently unavailable.' };
    }
    try {
        const { data: team, error: teamFetchError } = await supabase.from('teams').select('is_locked, created_by, name, event_id').eq('id', teamId).single();
        if (teamFetchError || !team) return { success: false, message: 'Team not found.' };
        
        const { data: requesterProfile, error: requesterProfileError } = await supabase.from('users').select('role').eq('id', requesterId).single();
        if (requesterProfileError || !requesterProfile) return { success: false, message: 'Could not verify your identity.' };

        const isLeader = team.created_by === requesterId;
        const isAdmin = requesterProfile.role === 'Super Admin';

        if (!isLeader && !isAdmin) return { success: false, message: 'You do not have permission to remove members from this team.' };
        if (team.is_locked) return { success: false, message: 'Cannot remove members from a team that is already registered.' };
        if (memberIdToRemove === team.created_by) return { success: false, message: 'The team leader cannot be removed.' };

        const { error: deleteError } = await supabaseAdmin.from('team_members').delete().match({ team_id: teamId, user_id: memberIdToRemove });
        if (deleteError) throw deleteError;

        await createNotification({
            user_id: memberIdToRemove,
            title: "You've Been Removed from a Team",
            message: `You have been removed from the team "${team.name}".`
        });

        revalidatePath('/programs');
        revalidatePath(`/admin/events/${team.event_id}/participants`);
        return { success: true, message: 'Team member removed.' };
    } catch (error: any) {
        return { success: false, message: `Could not remove member: ${error.message}` };
    }
}

/**
 * Allows an admin to delete a team entirely.
 */
export async function deleteTeam(teamId: string): Promise<{ success: boolean; message?: string }> {
    if (!supabaseAdmin) {
        return { success: false, message: 'Team service is currently unavailable.' };
    }
    try {
        const { error } = await supabaseAdmin.from('teams').delete().eq('id', teamId);
        if (error) throw error;
        
        revalidatePath('/programs');
        // Assuming admin page revalidation is needed
        // revalidatePath('/admin/some-page');
        return { success: true, message: 'Team has been deleted.' };
    } catch (error: any) {
        return { success: false, message: `Could not delete team: ${error.message}` };
    }
}
