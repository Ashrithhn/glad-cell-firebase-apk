
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
import { MoreHorizontal, MessageCircle, MessageSquare, Users, HeartHandshake } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { getContent } from '@/services/content';
import type { SiteLinks } from '@/services/content';
import { FeedbackModal } from '@/components/features/feedback/feedback-modal';

export function CommunityDropdown() {
    const { toast } = useToast();
    const [links, setLinks] = React.useState<SiteLinks | null>(null);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = React.useState(false);
    const [isOpen, setIsOpen] = React.useState(false);

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
        setIsOpen(false);
    }

    const whatsappLink = links?.whatsappCommunity;

    return (
        <>
            <div
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
            >
                <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
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
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/users" className="cursor-pointer w-full flex items-center">
                                <Users className="mr-2 h-4 w-4" />
                                <span>Registered Users</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/contributors" className="cursor-pointer w-full flex items-center">
                                <HeartHandshake className="mr-2 h-4 w-4" />
                                <span>Active Contributors</span>
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <FeedbackModal
                isOpen={isFeedbackModalOpen}
                onClose={() => setIsFeedbackModalOpen(false)}
            />
        </>
    );
}
