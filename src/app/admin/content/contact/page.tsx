
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EditContactForm } from '@/components/features/admin/edit-contact-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Contact, AlertTriangle } from 'lucide-react';
import { getContent } from '@/services/content'; 
import type { ContactInfo } from '@/services/content';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Fetch existing content on the server (still useful for admin to manage, even if public page is static)
async function loadContactInfo(): Promise<{ contactInfo?: ContactInfo, error?: string }> {
    const result = await getContent('contact'); 
    if (result.success && typeof result.data === 'object' && result.data !== null) {
        return { contactInfo: result.data as ContactInfo };
    } else if (!result.success) {
        return { error: result.message || 'Failed to load contact info.' };
    }
    // Default values if nothing is stored yet
    return { contactInfo: { address: 'Department of Computer Science and Engineering,\nGovernment Engineering College Mosalehosahalli,\nHassan, Karnataka, India', email: 'gladcell2019@gmail.com', phone: '7625026715 / 8073682882 / 9483901788' } };
}


export default async function AdminEditContactPage() {
  const { contactInfo, error } = await loadContactInfo();

  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
       <Button asChild variant="outline" className="mb-4">
         <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4"/> Back to Dashboard
         </Link>
       </Button>

        <Alert variant="default" className="mb-6 bg-blue-50 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700">
            <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertTitle className="text-blue-700 dark:text-blue-300">Important Note</AlertTitle>
            <AlertDescription className="text-blue-600 dark:text-blue-400">
            The public "Contact Us" page currently displays hardcoded information (Email: gladcell2019@gmail.com, Address: GECM Hassan, Phone: 7625026715 / 8073682882 / 9483901788).
            Changes made here will be stored in the database for administrative purposes or future dynamic use, but will not immediately reflect on the public page unless the page is updated to fetch this data dynamically.
            </AlertDescription>
        </Alert>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
             <Contact className="h-5 w-5" /> Edit Contact Information (Database)
          </CardTitle>
          <CardDescription>
            Update the contact details stored in the database.
          </CardDescription>
        </CardHeader>
        <CardContent>
           {error && <p className="text-destructive mb-4">Error loading current contact info from database: {error}</p>}
          <EditContactForm currentInfo={contactInfo!} /> 
        </CardContent>
      </Card>
    </div>
  );
}
