
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollText } from 'lucide-react';

export default function TermsAndConditionsPage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary">Terms and Conditions</h1>
        <p className="text-muted-foreground mt-2">
          Please read these terms and conditions carefully before using Our Service.
        </p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <ScrollText className="h-5 w-5" /> Interpretation and Definitions
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-3">
          <section>
            <h2 className="text-lg font-semibold">Interpretation</h2>
            <p>
              The words of which the initial letter is capitalized have meanings defined under the following conditions.
              The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">Definitions</h2>
            <p>For the purposes of these Terms and Conditions:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Application</strong> means the software program provided by the GLAD CELL downloaded by You on any electronic device, named GLAD CELL App.
              </li>
              <li>
                <strong>Company</strong> (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to GLAD CELL, Department of Computer Science and Engineering, Government Engineering College Mosalehosahalli.
              </li>
              <li>
                <strong>Service</strong> refers to the Application.
              </li>
              <li>
                <strong>Terms and Conditions</strong> (also referred as "Terms") mean these Terms and Conditions that form the entire agreement between You and the Company regarding the use of the Service.
              </li>
              <li>
                <strong>You</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.
              </li>
            </ul>
          </section>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Acknowledgment</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
          <p>
            These are the Terms and Conditions governing the use of this Service and the agreement that operates between You and the Company.
            These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.
          </p>
          <p>
            Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions.
            These Terms and Conditions apply to all visitors, users and others who access or use the Service.
          </p>
          <p>
            By accessing or using the Service You agree to be bound by these Terms and Conditions. If You disagree with any part of these Terms and Conditions then You may not access the Service.
          </p>
          {/* Add more sections as needed: User Accounts, Content, Termination, Limitation of Liability, Governing Law, Changes to These Terms, Contact Us etc. */}
          <p className="mt-4 font-semibold">
            [Placeholder: This is a sample Terms and Conditions page. You should replace this with your own comprehensive terms tailored to GLAD CELL.]
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
