import { RegistrationForm } from '@/components/features/registration/registration-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function RegisterPage() {
  return (
    <div className="flex justify-center items-start py-12">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Student Registration</CardTitle>
          <CardDescription>
            Join IdeaSpark by filling out the form below. A small registration fee is required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegistrationForm />
        </CardContent>
      </Card>
    </div>
  );
}
