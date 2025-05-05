import { IdeaCard } from './idea-card';

export interface Idea {
  id: string;
  title: string;
  submitter: string;
  department: string;
  description: string;
  tags?: string[]; // Optional tags
}

interface IdeaListProps {
  ideas: Idea[];
}

export function IdeaList({ ideas }: IdeaListProps) {
  if (!ideas || ideas.length === 0) {
    return <p className="text-center text-muted-foreground mt-10">No ideas submitted yet. Be the first!</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {ideas.map((idea) => (
        <IdeaCard key={idea.id} idea={idea} />
      ))}
    </div>
  );
}
