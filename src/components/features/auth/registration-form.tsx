
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
import { Loader2, ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { registerUser } from '@/services/auth';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Progress } from '@/components/ui/progress';
import { AnimatePresence, motion } from 'framer-motion';
import { PasswordStrength } from './password-strength';

const branches = [
  "Computer Science and Engineering",
  "Information Science and Engineering",
  "Electronics and Communication Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical and Electronics Engineering",
  "Artificial Intelligence and Machine Learning",
  "Aeronautical Engineering",
  "Biotechnology Engineering",
  "Chemical Engineering",
  "Industrial Engineering and Management",
  "Other",
] as const;

// The schema remains the same, as we submit all data at the end.
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }).max(100),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
    .regex(/[0-9]/, { message: "Password must contain at least one number." })
    .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character." }),
  
  phone: z.string().min(10, { message: 'Please enter a valid 10-digit phone number.' }).max(13, { message: 'Phone number is too long.' }).regex(/^(?:\+91)?[6-9]\d{9}$/, { message: 'Please enter a valid Indian phone number (e.g., 9876543210 or +919876543210).' }),
  registrationNumber: z.string().min(1, 'Registration number is required.').max(20, 'Registration number is too long.').regex(/^[a-zA-Z0-9]+$/, 'Registration number can only contain letters and numbers.'),
  branch: z.enum(branches, { required_error: 'Please select your branch.'}),
  semester: z.coerce.number().min(1, { message: 'Semester must be between 1 and 8.' }).max(8, { message: 'Semester must be between 1 and 8.' }),

  collegeName: z.string().min(1, { message: 'College name is required.' }).max(150),
  city: z.string().min(1, { message: 'City is required.' }).max(100),
});

type FormData = z.infer<typeof formSchema>;

const steps = [
  {
    id: 'account',
    title: 'Account Credentials',
    fields: ['name', 'email', 'password', 'phone'],
  },
  {
    id: 'academic',
    title: 'Academic Details',
    fields: ['registrationNumber', 'branch', 'semester'],
  },
  {
    id: 'location',
    title: 'Location Information',
    fields: ['collegeName', 'city'],
  },
];


export function RegistrationForm() {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [direction, setDirection] = React.useState(1);
  const router = useRouter();
  const { authError } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      registrationNumber: '',
      branch: undefined,
      semester: undefined,
      collegeName: 'Government Engineering College, Mosalehosahalli',
      city: '',
    },
  });

  const processForm = async (values: FormData) => {
    setIsSubmitting(true);
    const registrationData = { ...values, role: 'Participant' };
    try {
      if (authError) {
          throw new Error(`Cannot register: ${authError.message}`);
      }
      const result = await registerUser(registrationData);
      if (result.success) {
        toast({
          title: 'Registration Successful!',
          description: result.message || 'Your account has been created. Please check your email to verify your account.',
          className: 'bg-accent text-accent-foreground border-accent',
        });
        router.push('/login');
      } else {
        throw new Error(result.message || 'Registration failed.');
      }
    } catch (error) {
      console.error('Registration Error:', error);
      toast({
        title: 'Registration Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  type FieldName = keyof FormData;

  const nextStep = async () => {
    const fields = steps[currentStep].fields as FieldName[];
    const output = await form.trigger(fields, { shouldFocus: true });

    if (!output) return;

    setDirection(1);
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setDirection(-1);
    setCurrentStep(prev => prev - 1);
  };

  const isDisabled = isSubmitting || !!authError;
  const progress = ((currentStep + 1) / (steps.length + 1)) * 100;

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(processForm)} className="space-y-6">
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm font-medium text-muted-foreground">
              Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
            </p>
          </div>

          <div className="relative overflow-hidden" style={{ minHeight: '520px' }}>
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentStep}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="absolute w-full"
              >
                  <fieldset disabled={isDisabled} className="space-y-4">
                  {currentStep === 0 && (
                      <div className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Enter your full name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="Enter your email address" {...field} /></FormControl><FormDescription>(Please provide a valid and accessible email address.)</FormDescription><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" placeholder="+91 98765 43210" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <div className="relative">
                                  <FormControl>
                                    <Input
                                      type={showPassword ? 'text' : 'password'}
                                      placeholder="Create a secure password"
                                      {...field}
                                      className="pr-10"
                                    />
                                  </FormControl>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                                    onClick={() => setShowPassword(prev => !prev)}
                                    tabIndex={-1}
                                  >
                                    {showPassword ? <EyeOff /> : <Eye />}
                                    <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                                  </Button>
                                </div>
                                <FormMessage />
                                <PasswordStrength password={field.value} />
                            </FormItem>
                            )}
                        />
                      </div>
                  )}

                  {currentStep === 1 && (
                      <div className="space-y-4">
                        <FormField control={form.control} name="registrationNumber" render={({ field }) => (<FormItem><FormLabel>Unique Registration Number</FormLabel><FormControl><Input placeholder="Enter your USN or Reg No." {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="branch" render={({ field }) => (<FormItem><FormLabel>Branch</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select your branch" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Computer Science and Engineering">Computer Science</SelectItem><SelectItem value="Information Science and Engineering">Information Science</SelectItem><SelectItem value="Electronics and Communication Engineering">Electronics & Communication</SelectItem><SelectItem value="Mechanical Engineering">Mechanical</SelectItem><SelectItem value="Civil Engineering">Civil</SelectItem><SelectItem value="Electrical and Electronics Engineering">Electrical & Electronics</SelectItem><SelectItem value="Artificial Intelligence and Machine Learning">AI & ML</SelectItem><SelectItem value="Aeronautical Engineering">Aeronautical</SelectItem><SelectItem value="Biotechnology Engineering">Biotechnology</SelectItem><SelectItem value="Chemical Engineering">Chemical</SelectItem><SelectItem value="Industrial Engineering and Management">Industrial</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="semester" render={({ field }) => (<FormItem><FormLabel>Semester</FormLabel><FormControl><Input type="number" min="1" max="8" placeholder="1-8" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                      </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <FormField control={form.control} name="collegeName" render={({ field }) => (<FormItem><FormLabel>College Name</FormLabel><FormControl><Input placeholder="Enter your college name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>College City</FormLabel><FormControl><Input placeholder="Enter college city" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                  )}
                  </fieldset>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-between pt-4">
              {currentStep > 0 && (
                <Button type="button" onClick={prevStep} variant="outline" disabled={isDisabled}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
              )}

              {currentStep < steps.length - 1 && (
                <Button type="button" onClick={nextStep} className="ml-auto" disabled={isDisabled}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}

              {currentStep === steps.length - 1 && (
                <Button type="submit" className="w-full animated-border-button" disabled={isDisabled}>
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...</> : 'Register Account'}
                </Button>
              )}
          </div>
        </form>
      </Form>
  );
}
