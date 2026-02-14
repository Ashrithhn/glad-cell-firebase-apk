
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { updateUserProfile } from '@/services/users';
import type { UserProfileSupabase } from '@/services/auth';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

// Define roles that can be assigned
const assignableRoles = z.enum(['Participant', 'Admin', 'Super Admin']);

const formSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  role: assignableRoles,
});

type FormData = z.infer<typeof formSchema>;

interface EditUserFormProps {
  user: UserProfileSupabase;
}

export function EditUserForm({ user }: EditUserFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();
  const { userProfile: adminProfile } = useAuth(); // Get the current admin's profile

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name || '',
      role: (user.role as 'Participant' | 'Admin' | 'Super Admin') || 'Participant',
    },
  });

  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    
    // Prevent a non-Super Admin from creating another Super Admin or Admin
    if (adminProfile?.role !== 'Super Admin' && (values.role === 'Admin' || values.role === 'Super Admin')) {
        toast({ title: 'Permission Denied', description: 'Only a Super Admin can create or modify administrator accounts.', variant: 'destructive' });
        setIsSubmitting(false);
        return;
    }

    try {
      const result = await updateUserProfile(user.id, values);

      if (result.success) {
        toast({
          title: 'User Updated',
          description: `Profile for ${values.name} has been successfully updated.`,
        });
        router.push('/admin/users');
        router.refresh();
      } else {
        throw new Error(result.message || 'Failed to update user profile.');
      }
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const isRoleDropdownDisabled = adminProfile?.role !== 'Super Admin';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                    <Input value={user.email || 'N/A'} disabled />
                </FormControl>
                <FormDescription>Email cannot be changed.</FormDescription>
            </FormItem>
            <FormItem>
                <FormLabel>Registration Number</FormLabel>
                <FormControl>
                    <Input value={user.registration_number || 'N/A'} disabled />
                </FormControl>
                 <FormDescription>Registration Number cannot be changed.</FormDescription>
            </FormItem>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="User's full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isRoleDropdownDisabled}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {assignableRoles.options.map(role => (
                          <SelectItem 
                            key={role} 
                            value={role}
                            disabled={role === 'Super Admin' && adminProfile?.role !== 'Super Admin'}
                          >
                            {role}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {isRoleDropdownDisabled ? 'Only Super Admins can change user roles.' : 'Defines the user\'s access level.'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Changes
        </Button>
      </form>
    </Form>
  );
}
