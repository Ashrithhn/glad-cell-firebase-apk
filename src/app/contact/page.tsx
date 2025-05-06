
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Phone, MapPin, AlertCircle } from 'lucide-react';
import { getContent } from '@/services/content'; // Import service
import type { ContactInfo } from '@/services/content'; // Import type
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// Fetch contact info on the server
async function loadContactInfo(): Promise<{ contactInfo?: ContactInfo, error?: string }> {
    const result = await getContent('contact'); // Fetch 'contact' content block
    if (result.success && typeof result.data === 'object' && result.data !== null) {
        return { contactInfo: result.data as ContactInfo };
    } else if (!result.success) {
        return { error: result.message || 'Failed to load contact info.' };
    }
    // Return default empty structure if no content exists yet
    return { contactInfo: { address: 'Address not set.', email: 'Email not set.', phone: 'Phone not set.' } };
}


export default async function ContactPage() {
  const { contactInfo, error } = await loadContactInfo();

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary">Contact Us</h1>
        <p className="text-muted-foreground mt-2">
          Get in touch with the GLAD CELL team at GEC Mosalehosahalli.
        </p>
      </div>

       {error && (
         <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Contact Info</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
         </Alert>
      )}

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Contact Information</CardTitle>
          <CardDescription>We'd love to hear from you. Reach out via the methods below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-4">
            <MapPin className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
            <div>
              <h3 className="font-semibold">Address</h3>
              <p className="text-muted-foreground whitespace-pre-line"> {/* Use whitespace-pre-line to respect newlines */}
                {contactInfo?.address || 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Mail className="h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <h3 className="font-semibold">Email</h3>
              <a href={`mailto:${contactInfo?.email}`} className="text-primary hover:underline text-muted-foreground">
                {contactInfo?.email || 'N/A'}
              </a>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Phone className="h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <h3 className="font-semibold">Phone</h3>
              <p className="text-muted-foreground">
                 {contactInfo?.phone || 'N/A'}
              </p>
              {/* You might want a separate field for availability */}
              <p className="text-xs text-muted-foreground">(Availability may vary)</p>
            </div>
          </div>
        </CardContent>
      </Card>

       {/* Optional: Add a contact form component here later */}
      {/*
      <Card>
        <CardHeader>
          <CardTitle>Send us a Message</CardTitle>
        </CardHeader>
        <CardContent>
          // Contact Form Component
        </CardContent>
      </Card>
      */}
    </div>
  );
}
