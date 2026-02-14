
"use client";

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, MessageCircle, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getContent } from '@/services/content';
import type { SiteLinks } from '@/services/content';
import { FeedbackModal } from '@/components/features/feedback/feedback-modal';

export function CommunityDropdown() {
    const { toast } = useToast();
    const [links, setLinks] = React.useState<SiteLinks | null>(null);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = React.useState(false);

    React.useEffect(() => {
        async function fetchLinks() {
            const result = await getContent('links');
            if (result.success && typeof result.data === 'object' && result.data !== null) {
                setLinks(result.data as SiteLinks);
            }
        }
        fetchLinks();
    }, []);

    const handleFeedbackClick = () => {
       setIsFeedbackModalOpen(true);
   }

   const whatsappLink = links?.whatsappCommunity;

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-5 w-5" />
                        <span className="sr-only">Community links</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Community</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {whatsappLink && (
                        <DropdownMenuItem asChild>
                            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-full flex items-center cursor-pointer">
                                <MessageCircle className="mr-2 h-4 w-4" />
                                <span>WhatsApp Channel</span>
                            </a>
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleFeedbackClick} className="cursor-pointer">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        <span>Give Feedback</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <FeedbackModal
                isOpen={isFeedbackModalOpen}
                onClose={() => setIsFeedbackModalOpen(false)}
            />
        </>
    );
}
