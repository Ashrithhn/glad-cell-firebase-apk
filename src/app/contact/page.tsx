
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Phone, MapPin, AlertCircle } from 'lucide-react';
// import { getContent } from '@/services/content'; // Service call no longer needed for static content
// import type { ContactInfo } from '@/services/content'; 
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

<<<<<<< HEAD
// Fetch contact info on the server
async function loadContactInfo(): Promise<{ contactInfo?: ContactInfo, error?: string }> {
    const result = await getContent('contact'); // Fetch 'contact' content block
    if (result.success && typeof result.data === 'object' && result.data !== null && result.data.hasOwnProperty('address')) {
        // Check if data has 'address' to ensure it's likely a ContactInfo object
        return { contactInfo: result.data as ContactInfo };
    } else if (!result.success) {
        return { error: result.message || 'Failed to load contact info.' };
    }
    // Return updated default structure if no content exists yet or if fetched data is not valid ContactInfo
    return { 
        contactInfo: { 
            address: 'Government Engineering College Mosalehosahalli, Hassan, Karnataka', 
            email: 'gladcell2019@gmail.com', 
            phone: '7625026715, 8073682882, 9483901788' 
        } 
    };
}
=======
// Static contact info as requested
const staticContactInfo = {
  address: 'Department of Computer Science and Engineering,\nGovernment Engineering College Mosalehosahalli,\nHassan, Karnataka, India',
  email: 'gladcell2019@gmail.com',
  phone: '7625026715 / 8073682882 / 9483901788', // Combined phone numbers
};
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)


export default async function ContactPage() {
  const contactInfo = staticContactInfo; // Use static info
  const error = null; // No fetching error for static content

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary">Contact Us</h1>
        <p className="text-muted-foreground mt-2">
          Get in touch with the GLAD CELL team at GEC Mosalehosahalli.
        </p>
      </div>

       {error && ( // Keep error display in case of future dynamic content
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

          <div className="flex items-start space-x-4"> {/* Changed to items-start for multi-line phone numbers */}
            <Phone className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
            <div>
              <h3 className="font-semibold">Phone</h3>
              <p className="text-muted-foreground whitespace-pre-line"> {/* Use whitespace-pre-line to respect newlines in phone numbers */}
                 {contactInfo?.phone || 'N/A'}
              </p>
<<<<<<< HEAD
              <p className="text-xs text-muted-foreground mt-1">(Availability may vary)</p>
=======
              <p className="text-xs text-muted-foreground">(Availability may vary)</p>
>>>>>>> 0e505f8 (once scanned qr code not taken again and after all registered total participants data must available to download and more memebers can access admin login if wants make changes,in admin control panel change side bar according to the need of admin it not same as users ithink soo and manager users and other feture comimg soon tabs enable add according to your experience not same as admin dashboard simpli different,and make admin can edit some more users settings and others required things make changes,view and manged users and some more things arein feature coming soon made it available now and get things from users dashboard if there data exists,in user dashboard add terms and conditions and privacy policy with related info like relted to our app,in site setting make enable of all coming soon options and add even more,colours are actually not good add colours combinations like instagram and make loading animation if users network is slow,iam in final stage of launching my app add copyrights and reserved and any required symbols yerar and add many more that all websites doing things and clear all bugs and make evrything good for user working,)
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

