
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Lock, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
       <Button asChild variant="outline" className="mb-4">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4"/> Back to Home
        </Link>
      </Button>
      
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
            <ShieldCheck className="h-8 w-8" /> Privacy Policy
        </h1>
        <p className="text-muted-foreground mt-2">
          Your privacy is important to us. This policy explains how we collect, use, and protect your information.
        </p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Introduction</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-3">
          <p>Welcome to GLAD CELL GECM ("Organization", "we", "our", "us"). We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, please contact us at <a href="mailto:gladcell2019@gmail.com" className="text-primary hover:underline">gladcell2019@gmail.com</a>.</p>
          <p>This privacy notice describes how we might use your information if you:
            <ul className="list-disc list-inside ml-4">
              <li>Visit our website or use our mobile application ("Service").</li>
              <li>Engage with us in other related ways ― including any sales, marketing, or events.</li>
            </ul>
          </p>
          <p>In this privacy notice, if we refer to:
            <ul className="list-disc list-inside ml-4">
              <li>"Service," we are referring to our application and website.</li>
              <li>"Personal Information," we are referring to any information that identifies you as an individual.</li>
            </ul>
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Information We Collect</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-3">
          <p>We collect personal information that you voluntarily provide to us when you register on the Service, express an interest in obtaining information about us or our products and services, when you participate in activities on the Service or otherwise when you contact us.</p>
          <p>The personal information that we collect depends on the context of your interactions with us and the Service, the choices you make and the products and features you use. The personal information we collect may include the following:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Personal Information Provided by You:</strong> We collect names; phone numbers; email addresses; mailing addresses; usernames; passwords; contact preferences; contact or authentication data; billing addresses; registration numbers; academic details (branch, semester); college name.</li>
            <li><strong>Payment Data:</strong> We may collect data necessary to process your payment if you make purchases, such as your payment instrument number (such as a credit card number), and the security code associated with your payment instrument. All payment data is stored by our payment processor and you should review its privacy policies and contact the payment processor directly to respond to your questions.</li>
             <li><strong>Image Data:</strong> If you choose to upload a profile picture, we collect the image you provide.</li>
          </ul>
        </CardContent>
      </Card>

       <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">How We Use Your Information</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-3">
          <p>We use personal information collected via our Service for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations. We indicate the specific processing grounds we rely on next to each purpose listed below.</p>
           <ul className="list-disc list-inside space-y-1">
              <li>To facilitate account creation and logon process.</li>
              <li>To post testimonials (with your consent).</li>
              <li>Request feedback.</li>
              <li>To manage user accounts.</li>
              <li>To send administrative information to you.</li>
              <li>To protect our Services.</li>
              <li>To enforce our terms, conditions and policies for business purposes, to comply with legal and regulatory requirements or in connection with our contract.</li>
              <li>To respond to legal requests and prevent harm.</li>
              <li>Fulfill and manage your orders and event participations.</li>
              <li>To deliver and facilitate delivery of services to the user.</li>
              <li>To respond to user inquiries/offer support to users.</li>
           </ul>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2"><Lock className="h-5 w-5"/> Security of Your Information</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-3">
          <p>We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security, and improperly collect, access, steal, or modify your information. Although we will do our best to protect your personal information, transmission of personal information to and from our Service is at your own risk. You should only access the Service within a secure environment.</p>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Changes to This Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-3">
          <p>We may update this privacy notice from time to time. The updated version will be indicated by an updated "Revised" date and the updated version will be effective as soon as it is accessible. If we make material changes to this privacy notice, we may notify you either by prominently posting a notice of such changes or by directly sending you a notification. We encourage you to review this privacy notice frequently to be informed of how we are protecting your information.</p>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Contact Us</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-3">
          <p>If you have any questions or comments about this notice, you may email us at <a href="mailto:gladcell2019@gmail.com" className="text-primary hover:underline">gladcell2019@gmail.com</a> or by post to:</p>
          <p>
            GLAD CELL Initiative<br />
            Department of Computer Science and Engineering<br />
            Government Engineering College Mosalehosahalli<br />
            Hassan, Karnataka, India
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
