import { IdeaList } from '@/components/features/ideas/idea-list';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function IdeasPage() {
  // In a real app, you'd fetch ideas here, potentially based on search/filter state
  const ideas = [
    { id: '1', title: 'AI-Powered Campus Navigation', submitter: 'Alice', department: 'Computer Science', description: 'An app using AI to provide optimal routes around campus, considering accessibility.', tags: ['AI', 'Campus Life', 'Mobile App'] },
    { id: '2', title: 'Sustainable Waste Management System', submitter: 'Bob', department: 'Environmental Science', description: 'IoT sensors on bins to optimize collection routes and promote recycling.', tags: ['Sustainability', 'IoT', 'Logistics'] },
    { id: '3', title: 'Peer-to-Peer Tutoring Platform', submitter: 'Charlie', department: 'Education', description: 'Connecting students for academic help, incentivized with credits.', tags: ['EdTech', 'Community', 'Platform'] },
    { id: '4', title: 'Vertical Farming on Rooftops', submitter: 'Diana', department: 'Agriculture', description: 'Utilizing unused rooftop space for growing fresh produce for the cafeteria.', tags: ['Sustainability', 'Food Tech', 'Urban Farming'] },
    { id: '5', title: 'Gamified Language Learning App', submitter: 'Ethan', department: 'Linguistics', description: 'Making language learning fun through interactive games and challenges.', tags: ['EdTech', 'Gamification', 'Mobile App'] },
  ];


  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary">Explore Student Ideas</h1>
        <p className="text-muted-foreground mt-2">Discover the innovative projects and startups brewing in our college.</p>
      </div>

      <div className="relative w-full max-w-lg mx-auto">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
            type="search"
            placeholder="Search ideas by title, tag, or department..."
            className="pl-10"
            // Add onChange handler to implement search functionality
        />
      </div>

      {/* Add filter controls here (e.g., dropdowns for department, tags) */}
       {/*
       <div className="flex justify-center gap-4">
         <Select> ... Department Filter ... </Select>
         <Select> ... Tag Filter ... </Select>
       </div>
       */}

      <IdeaList ideas={ideas} />
    </div>
  );
}
