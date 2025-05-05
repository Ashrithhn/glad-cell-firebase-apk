import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Building2, Tag } from 'lucide-react';
import type { Idea } from './idea-list'; // Import the Idea type

interface IdeaCardProps {
  idea: Idea;
}

export function IdeaCard({ idea }: IdeaCardProps) {
  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-primary">{idea.title}</CardTitle>
        <CardDescription className="flex items-center gap-4 text-sm pt-1">
           <span className='flex items-center gap-1'><User className="h-4 w-4" /> {idea.submitter}</span>
           <span className='flex items-center gap-1'><Building2 className="h-4 w-4" /> {idea.department}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">{idea.description}</p>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 items-center pt-4">
        <Tag className="h-4 w-4 text-muted-foreground mr-1" />
        {idea.tags && idea.tags.length > 0 ? (
          idea.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))
        ) : (
          <span className="text-xs text-muted-foreground italic">No tags</span>
        )}
      </CardFooter>
    </Card>
  );
}
