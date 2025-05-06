
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary">Privacy Policy</h1>
        <p className="text-muted-foreground mt-2">
          Your privacy is important to us. This policy explains how we collect, use, and protect your information.
        </p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" /> Introduction
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-3">
          <p>
            GLAD CELL ("us", "we", or "our") operates the GLAD CELL mobile application (the "Service").
            This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
            We use your data to provide and improve the Service. By using the Service, you agree to the collection and use of information in accordance with this policy.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Information Collection and Use</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-3">
          <p>
            We collect several different types of information for various purposes to provide and improve our Service to you.
          </p>
          <section>
            <h2 className="text-lg font-semibold">Types of Data Collected</h2>
            <h3 className="text-md font-semibold mt-2">Personal Data</h3>
            <p>
              While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data").
              Personally identifiable information may include, but is not limited to:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Email address</li>
              <li>Full name</li>
              <li>Phone number</li>
              <li>Branch, Semester, Registration Number</li>
              <li>College Name, City, Pincode</li>
              <li>Usage Data</li>
            </ul>
            <h3 className="text-md font-semibold mt-2">Usage Data</h3>
            <p>
              We may also collect information how the Service is accessed and used ("Usage Data").
              This Usage Data may include information such as your device's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers and other diagnostic data.
            </p>
          </section>
        </CardContent>
      </Card>
       {/* Add more sections as needed: Use of Data, Transfer Of Data, Disclosure Of Data, Security Of Data, Service Providers, Links To Other Sites, Children's Privacy, Changes To This Privacy Policy, Contact Us etc. */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Contact Us</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
            <p>If you have any questions about this Privacy Policy, please contact us:</p>
            <ul className="list-disc pl-5">
                <li>By email: [Your Contact Email for GLAD CELL]</li>
                <li>By visiting this page on our website: [Link to Contact Page if applicable]</li>
            </ul>
             <p className="mt-4 font-semibold">
            [Placeholder: This is a sample Privacy Policy page. You should replace this with your own comprehensive policy tailored to GLAD CELL and consult with legal counsel if necessary.]
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
