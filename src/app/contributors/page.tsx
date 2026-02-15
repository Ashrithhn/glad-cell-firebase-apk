import { getAllIdeas } from '@/services/ideas';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { HeartHandshake } from 'lucide-react';

export default async function ContributorsPage() {
    const { ideas } = await getAllIdeas();

    // Group ideas by submitter to find top contributors
    const contributorsMap = new Map<string, { name: string; count: number; department?: string | null }>();

    ideas?.forEach((idea) => {
        if (idea.submitter_name) {
            const current = contributorsMap.get(idea.submitter_name) || { name: idea.submitter_name, count: 0, department: idea.department };
            contributorsMap.set(idea.submitter_name, { ...current, count: current.count + 1 });
        }
    });

    const contributors = Array.from(contributorsMap.values()).sort((a, b) => b.count - a.count);

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <HeartHandshake className="h-8 w-8 text-primary" /> Active Contributors
            </h1>
            <p className="text-muted-foreground mb-8">Recognizing our community members who actively submit ideas and drive innovation.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contributors.map((contributor) => (
                    <Card key={contributor.name} className="flex items-center p-6 space-x-4 hover:shadow-lg transition-all hover:-translate-y-1">
                        <Avatar className="h-14 w-14 border-2 border-primary/20">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${contributor.name}`} />
                            <AvatarFallback>{contributor.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <CardTitle className="text-lg font-semibold">{contributor.name}</CardTitle>
                            {contributor.department && <p className="text-xs text-muted-foreground mb-1">{contributor.department}</p>}
                            <Badge variant="secondary" className="mt-1">
                                {contributor.count} {contributor.count === 1 ? 'Idea' : 'Ideas'} Submitted
                            </Badge>
                        </div>
                    </Card>
                ))}
                {!contributors.length && <p className="text-muted-foreground col-span-full text-center py-10">No active contributors found yet. Be the first to submit an idea!</p>}
            </div>
        </div>
    );
}
