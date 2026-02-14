
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Phone, MapPin, AlertCircle, ArrowLeft } from 'lucide-react';
import { getContent } from '@/services/content';
import type { ContactInfo } from '@/services/content';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Fetch contact info on the server
async function loadContactInfo(): Promise<{ contactInfo?: ContactInfo, error?: string }> {
    const result = await getContent('contact');
    if (result.success && typeof result.data === 'object' && result.data !== null) {
        return { contactInfo: result.data as ContactInfo };
    } else if (!result.success) {
        return { error: result.message || 'Failed to load contact info.' };
    }
    // Provide default values if nothing is stored in the database yet
    return { 
        contactInfo: { 
            address: 'Department of Computer Science and Engineering,\nGovernment Engineering College Mosalehosahalli,\nHassan, Karnataka, India', 
            email: 'gladcell2019@gmail.com', 
            phone: '7625026715 / 8073682882 / 9483901788' 
        } 
    };
}


export default async function ContactPage() {
  const { contactInfo, error } = await loadContactInfo();

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
       <Button asChild variant="outline" className="mb-4">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4"/> Back to Home
        </Link>
      </Button>

      <div className="text-center">
        <h1 className="text-3xl font-bold animated-gradient-text">Contact Us</h1>
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
              <p className="text-muted-foreground whitespace-pre-line">
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
              <p className="text-xs text-muted-foreground">(Availability may vary)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
