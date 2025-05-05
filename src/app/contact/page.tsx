import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary">Contact Us</h1>
        <p className="text-muted-foreground mt-2">
          Get in touch with the GLAD CELL team at GEC Mosalehosahalli.
        </p>
      </div>

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
              <p className="text-muted-foreground">
                Department of Computer Science and Engineering,<br />
                Government Engineering College Mosalehosahalli,<br />
                Hassan District, Karnataka - 573131 <br/>
                India
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Mail className="h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <h3 className="font-semibold">Email</h3>
              <a href="mailto:gladcell.cse@gecmh.ac.in" className="text-primary hover:underline text-muted-foreground">
                gladcell.cse@gecmh.ac.in {/* Placeholder Email */}
              </a>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Phone className="h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <h3 className="font-semibold">Phone</h3>
              <p className="text-muted-foreground">
                +91-XXX-XXXXXXX {/* Placeholder Phone */}
              </p>
              <p className="text-xs text-muted-foreground">(Available during college working hours)</p>
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
