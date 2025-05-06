
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EditContactForm } from '@/components/features/admin/edit-contact-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Contact } from 'lucide-react';
import { getContent } from '@/services/content'; // Import service to fetch content
import type { ContactInfo } from '@/services/content';

// Fetch existing content on the server
async function loadContactInfo(): Promise<{ contactInfo?: ContactInfo, error?: string }> {
    const result = await getContent('contact'); // Fetch 'contact' content block
    if (result.success && typeof result.data === 'object' && result.data !== null) {
        return { contactInfo: result.data as ContactInfo };
    } else if (!result.success) {
        return { error: result.message || 'Failed to load contact info.' };
    }
    // Return default empty structure if no content exists yet
    return { contactInfo: { address: '', email: '', phone: '' } };
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

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
             <Contact className="h-5 w-5" /> Edit Contact Information
          </CardTitle>
          <CardDescription>
            Update the contact details displayed on the public "Contact Us" page.
          </CardDescription>
        </CardHeader>
        <CardContent>
           {error && <p className="text-destructive mb-4">Error loading current contact info: {error}</p>}
          <EditContactForm currentInfo={contactInfo!} /> {/* Pass non-null default */}
        </CardContent>
      </Card>
    </div>
  );
}
