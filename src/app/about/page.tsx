
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, Target, Lightbulb, Users, AlertCircle } from 'lucide-react';
import { getContent } from '@/services/content'; // Import service to fetch content
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import ReactMarkdown from 'react-markdown'; // Assuming you might use markdown
import remarkGfm from 'remark-gfm'; // For GitHub Flavored Markdown support

// Fetch about content on the server
async function loadAboutContent(): Promise<{ content?: string, error?: string }> {
    const result = await getContent('about'); // Fetch 'about' content block
    if (result.success && typeof result.data === 'string') {
        return { content: result.data };
    } else if (!result.success) {
        return { error: result.message || 'Failed to load about content.' };
    }
    return { content: 'Default About Us content. Please update via admin panel.' }; // Default content
}

export default async function AboutPage() {
  const { content, error } = await loadAboutContent();

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary">About GLAD CELL</h1>
        <p className="text-muted-foreground mt-2">
          Fostering Innovation at GEC Mosalehosahalli
        </p>
      </div>

      {error && (
         <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Content</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
         </Alert>
      )}

      {/* Display fetched content */}
      <Card className="shadow-md">
        <CardHeader>
          {/* You might keep a static title or make it dynamic too */}
          <CardTitle className="text-xl flex items-center gap-2"><Building2 className="h-5 w-5" /> Our Initiative</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
           {/* Use ReactMarkdown to render fetched content */}
           <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || ''}</ReactMarkdown>
        </CardContent>
      </Card>

      {/* You might remove the static cards below if all content is managed via admin */}

      {/*
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2"><Target className="h-5 w-5" /> Our Mission</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>To inspire and empower students...</li>
            </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2"><Lightbulb className="h-5 w-5" /> What We Do</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-2">
           <p>GLAD CELL organizes various programs...</p>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2"><Users className="h-5 w-5" /> Join Us</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
           <p>Whether you have a groundbreaking idea...</p>
        </CardContent>
      </Card>
       */}
    </div>
  );
}
