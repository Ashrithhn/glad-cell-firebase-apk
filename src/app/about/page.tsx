
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, Target, Lightbulb, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary">About GLAD CELL</h1>
        <p className="text-muted-foreground mt-2">
          Fostering Innovation at GEC Mosalehosahalli
        </p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2"><Building2 className="h-5 w-5" /> Our Initiative</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            The <strong className="text-primary">GECM Lab for Aspiring Developers (GLAD CELL)</strong> is a dedicated initiative established by the Department of Computer Science and Engineering at Government Engineering College, Mosalehosahalli.
          </p>
          <p>
            Our primary goal is to cultivate a vibrant ecosystem for innovation, entrepreneurship, and technological development within the college community.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2"><Target className="h-5 w-5" /> Our Mission</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>To inspire and empower students to transform their innovative ideas into tangible projects and potential startups.</li>
            <li>To provide a platform for sharing, collaborating, and refining ideathon concepts.</li>
            <li>To bridge the gap between academic learning and real-world application development.</li>
            <li>To connect students with resources, mentorship, and opportunities within the tech and startup landscape.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2"><Lightbulb className="h-5 w-5" /> What We Do</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-2">
           <p>GLAD CELL organizes various programs, workshops, and events focused on:</p>
           <ul className="list-disc list-inside ml-4">
               <li>Ideation and brainstorming techniques.</li>
               <li>Startup development fundamentals.</li>
               <li>Technical skill enhancement.</li>
               <li>Networking with industry professionals and mentors.</li>
           </ul>
           <p>We encourage students from all departments to participate and contribute their unique perspectives.</p>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2"><Users className="h-5 w-5" /> Join Us</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
           <p>Whether you have a groundbreaking idea, a passion for coding, or simply a desire to learn and collaborate, GLAD CELL welcomes you. Explore the ideas, participate in our events, and be part of the innovation journey at GECM!</p>
        </CardContent>
      </Card>
    </div>
  );
}
