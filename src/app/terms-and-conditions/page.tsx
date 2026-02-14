
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function TermsAndConditionsPage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
       <Button asChild variant="outline" className="mb-4">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4"/> Back to Home
        </Link>
      </Button>

      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
          <FileText className="h-8 w-8" /> Terms and Conditions
        </h1>
        <p className="text-muted-foreground mt-2">
          Please read these terms and conditions carefully before using Our Service.
        </p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Interpretation and Definitions</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-3">
          <p>The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
          
          <h3 className="font-semibold text-foreground">Definitions</h3>
          <p>For the purposes of these Terms and Conditions:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Application</strong> means the software program provided by the GLAD CELL downloaded by You on any electronic device, named GLAD CELL GECM.</li>
            <li><strong>Organization</strong> (referred to as either "the Organization", "We", "Us" or "Our" in this Agreement) refers to GLAD CELL, Department of Computer Science and Engineering, Government Engineering College Mosalehosahalli, Hassan, Karnataka.</li>
            <li><strong>Service</strong> refers to the Application.</li>
            <li><strong>Terms and Conditions</strong> (also referred to as "Terms") mean these Terms and Conditions that form the entire agreement between You and the Organization regarding the use of the Service.</li>
            <li><strong>You</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Acknowledgment</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-3">
          <p>These are the Terms and Conditions governing the use of this Service and the agreement that operates between You and the Organization. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.</p>
          <p>Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service.</p>
          <p>By accessing or using the Service You agree to be bound by these Terms and Conditions. If You disagree with any part of these Terms and Conditions then You may not access the Service.</p>
          <p>Your access to and use of the Service is also conditioned on Your acceptance of and compliance with the Privacy Policy of the Organization. Our Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your personal information when You use the Application or the Website and tells You about Your privacy rights and how the law protects You. Please read Our Privacy Policy carefully before using Our Service.</p>
        </CardContent>
      </Card>

       <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">User Accounts</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-3">
            <p>When You create an account with Us, You must provide Us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of Your account on Our Service.</p>
            <p>You are responsible for safeguarding the password that You use to access the Service and for any activities or actions under Your password. You agree not to disclose Your password to any third party. You must notify Us immediately upon becoming aware of any breach of security or unauthorized use of Your account.</p>
        </CardContent>
      </Card>


      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Intellectual Property</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-3">
          <p>The Service and its original content (excluding Content provided by You or other users), features and functionality are and will remain the exclusive property of the Organization and its licensors. The Service is protected by copyright, trademark, and other laws of both the Country and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of the Organization.</p>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Termination</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-3">
          <p>We may terminate or suspend Your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if You breach these Terms and Conditions.</p>
          <p>Upon termination, Your right to use the Service will cease immediately. If You wish to terminate Your account, You may simply discontinue using the Service.</p>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Governing Law</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-3">
          <p>The laws of India, excluding its conflicts of law rules, shall govern this Terms and Your use of the Service. Your use of the Application may also be subject to other local, state, national, or international laws.</p>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Changes to These Terms and Conditions</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-3">
          <p>We reserve the right, at Our sole discretion, to modify or replace these Terms at any time. If a revision is material We will make reasonable efforts to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at Our sole discretion.</p>
          <p>By continuing to access or use Our Service after those revisions become effective, You agree to be bound by the revised terms. If You do not agree to the new terms, in whole or in part, please stop using the website and the Service.</p>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Contact Us</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-3">
          <p>If you have any questions about these Terms and Conditions, You can contact us:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>By email: <a href="mailto:gladcell2019@gmail.com" className="text-primary hover:underline">gladcell2019@gmail.com</a></li>
            <li>By visiting our contact page: <Link href="/contact" className="text-primary hover:underline">Contact Page</Link></li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
