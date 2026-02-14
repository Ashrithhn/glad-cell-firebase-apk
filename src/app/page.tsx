
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ArrowRight, Lightbulb, CalendarCheck, UserPlus, Users, Code2, Rocket, Award, ImageOff, Archive, X, Megaphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPublicActiveEvents, EventData } from '@/services/events';
import { getActivePublicPromotions, type Promotion } from '@/services/promotions';
import { getApprovedIdeas } from '@/services/ideas';
import { Skeleton } from '@/components/ui/skeleton';
import { EducationalChatbot } from '@/components/features/chatbot/educational-chatbot';
import { IdeaCard } from '@/components/features/ideas/idea-card';
import type { Idea } from '@/components/features/ideas/idea-list';
import { format, parseISO } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { TestimonialScroller } from '@/components/features/feedback/testimonial-scroller';
import { getPublicFeedback } from '@/services/feedback';
import type { FeedbackData } from '@/services/feedback';

const timelineSteps = [
    {
        icon: UserPlus,
        color: "primary",
        title: "1. Register",
        description: "Create your GLAD account to join our innovation community.",
        direction: "right",
    },
    {
        icon: CalendarCheck,
        color: "chart-3",
        title: "2. Explore Events",
        description: "Find hackathons, workshops, and challenges that ignite your passion.",
        direction: "left",
    },
    {
        icon: Users,
        color: "chart-5",
        title: "3. Form Teams",
        description: "Collaborate with peers and build your dream team for group events.",
        direction: "right",
    },
    {
        icon: Lightbulb,
        color: "chart-2",
        title: "4. Submit Ideas",
        description: "Pitch your concepts and unique solutions to defined problems.",
        direction: "left",
    },
    {
        icon: Rocket,
        color: "primary",
        title: "5. Participate & Build",
        description: "Engage in events, get feedback, and turn concepts into reality.",
        direction: "right",
    },
    {
        icon: Award,
        color: "chart-3",
        title: "6. Showcase Work",
        description: "Get recognized for your achievements and build your portfolio.",
        direction: "left",
    },
];


const TimelineStep = ({ icon: Icon, color, title, description, direction, isLast }: any) => {
    const cardVariants = {
        offscreen: { y: 50, opacity: 0 },
        onscreen: { y: 0, opacity: 1, transition: { type: 'spring', bounce: 0.4, duration: 0.8 } },
    };
    
    const arrowPath = "M 1 0 V 50 C 1 70, 40 70, 40 90 S 1 110, 1 130 V 180";

    const content = (
        <motion.div variants={cardVariants}>
             <Card className="animated-rainbow-border text-left shadow-lg">
                <CardHeader className="p-4">
                    <CardTitle className="text-xl font-semibold">{title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <p className="text-muted-foreground mt-1">{description}</p>
                </CardContent>
            </Card>
        </motion.div>
    );

    return (
        <div className="relative w-full">
            <div className="flex items-center">
                <div className={`w-1/2 ${direction === 'right' ? 'pr-4 md:pr-8' : 'pl-4 md:pl-8'}`}>
                    {direction === 'right' && content}
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 bg-background p-1 rounded-full z-10">
                    <div
                        className="h-12 w-12 rounded-full bg-card flex items-center justify-center border-2"
                        style={{ borderColor: `hsl(var(--${color}))` }}
                    >
                        <Icon className="h-6 w-6" style={{ color: `hsl(var(--${color}))` }} />
                    </div>
                </div>
                <div className={`w-1/2 ${direction === 'left' ? 'pl-4 md:pl-8' : 'pr-4 md:pr-8'}`}>
                    {direction === 'left' && content}
                </div>
            </div>

            {!isLast && (
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 h-full w-10 flex justify-center ${direction === 'left' ? 'transform -scale-x-100' : ''}`}>
                     <motion.svg
                        width="42"
                        height="100%"
                        viewBox="0 0 42 180"
                        fill="none"
                        preserveAspectRatio="none"
                        className="h-full"
                        initial="offscreen"
                        whileInView="onscreen"
                        viewport={{ once: true, amount: 0.4 }}
                    >
                        <motion.path
                            d={arrowPath}
                            stroke="hsl(var(--border))"
                            strokeWidth="3"
                            strokeDasharray="1 8"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            variants={{
                                offscreen: { pathLength: 0 },
                                onscreen: { pathLength: 1 }
                            }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                        />
                    </motion.svg>
                </div>
            )}
        </div>
    );
};


export default function Home() {
  const [featuredIdeas, setFeaturedIdeas] = useState<Idea[]>([]);
  const [latestEvent, setLatestEvent] = useState<EventData | null>(null);
  const [feedbackItems, setFeedbackItems] = useState<FeedbackData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [promoQueue, setPromoQueue] = useState<Promotion[]>([]);
  const [currentPromo, setCurrentPromo] = useState<Promotion | null>(null);
  const [isPromoVisible, setIsPromoVisible] = useState(false);
  const { userId, loading: authLoading } = useAuth();


  useEffect(() => {
    async function loadHomepageData() {
      setLoading(true);
      setError(null);
      try {
        const [eventsResult, ideasResult, feedbackResult] = await Promise.all([
          getPublicActiveEvents(),
          getApprovedIdeas(),
          getPublicFeedback(),
        ]);

        if (eventsResult.success && eventsResult.events && eventsResult.events.length > 0) {
            setLatestEvent(eventsResult.events[0]);
        } else {
             console.warn("Could not load latest event:", eventsResult.message);
        }

        if (ideasResult.success && ideasResult.ideas) {
            const mappedIdeas = ideasResult.ideas.slice(0, 3).map(idea => ({
              id: idea.id!,
              title: idea.title,
              submitter: idea.submitter_name || 'Admin Submitted',
              department: idea.department || 'N/A',
              description: idea.description,
              tags: idea.tags || [],
            }));
            setFeaturedIdeas(mappedIdeas);
        } else {
            console.warn("Could not load featured ideas:", ideasResult.message);
        }

        if (feedbackResult.success && feedbackResult.feedback) {
            setFeedbackItems(feedbackResult.feedback);
        } else {
            console.warn("Could not load feedback items:", feedbackResult.message);
        }

      } catch (err: any) {
        setError("Failed to load homepage content. Please try again later.");
        console.error("Homepage data loading error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHomepageData();
  }, []);

  const handlePromotions = useCallback(async () => {
    const SEEN_PROMOS_KEY = 'seenPromos_session';
    const seenPromos = JSON.parse(sessionStorage.getItem(SEEN_PROMOS_KEY) || '[]');
    const finalQueue: Promotion[] = [];

    const eventsResult = await getPublicActiveEvents();
    if (eventsResult.success && eventsResult.events && eventsResult.events.length > 0) {
      const fallbackEvent = eventsResult.events[0];
      const eventAsPromo: Promotion = {
        id: `event-${fallbackEvent.id!}`,
        title: `Check out our latest event!`,
        description: fallbackEvent.name,
        cta_link: `/programs#${fallbackEvent.id}`,
        cta_text: 'View Event',
        is_active: true,
        display_order: -1,
        image_url: fallbackEvent.image_url,
        storage_path: fallbackEvent.image_storage_path || '',
      };
      
      finalQueue.push(eventAsPromo);
    }

    const promotionsResult = await getActivePublicPromotions();
    if (promotionsResult.success && promotionsResult.promotions) {
      const customUnseenPromos = promotionsResult.promotions
        .filter(p => !seenPromos.includes(p.id!))
        .sort((a, b) => a.display_order - b.display_order);
      finalQueue.push(...customUnseenPromos);
    }

    setPromoQueue(finalQueue);
  }, []);

  // Effect to handle showing promotions after login
  useEffect(() => {
    if (!authLoading && userId) {
      const timer = setTimeout(() => {
        handlePromotions();
      }, 100); // Reduced delay to 100ms

      return () => clearTimeout(timer);
    }
  }, [userId, authLoading, handlePromotions]);
  
  // Effect to display the next promotion from the queue
  useEffect(() => {
    if (promoQueue.length > 0) {
        setCurrentPromo(promoQueue[0]);
        setIsPromoVisible(true);
    } else {
        setIsPromoVisible(false);
        setCurrentPromo(null);
    }
  }, [promoQueue]);

  const handleClosePromotion = () => {
    if (!currentPromo) return;

    if (!currentPromo.id?.startsWith('event-')) {
        const SEEN_PROMOS_KEY = 'seenPromos_session';
        const seenPromos = JSON.parse(sessionStorage.getItem(SEEN_PROMOS_KEY) || '[]');
        sessionStorage.setItem(SEEN_PROMOS_KEY, JSON.stringify([...seenPromos, currentPromo.id!]));
    }
    
    setPromoQueue(prev => prev.slice(1));
  };


  const cardVariants = {
    offscreen: { y: 50, opacity: 0 },
    onscreen: { y: 0, opacity: 1, transition: { type: 'spring', bounce: 0.4, duration: 0.8 } },
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-16 md:space-y-24 py-8 md:py-12">
      
      {/* Hero Section */}
      <div className="text-center space-y-4 px-4">
        <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-6xl font-bold tracking-tight animated-gradient-text">
          Innovate, Collaborate, Create
        </motion.h1>
        <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto text-glow">
          Welcome to GLAD CELL, the hub for innovation at the <span className="font-semibold text-primary/90">Department of Computer Science and Engineering, GECM</span>.
        </motion.p>
        <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.4 }}>
            <Button asChild size="lg" className="mt-4 group">
                <Link href="/ideas">
                    Explore Ideas 
                    <motion.span whileHover={{ x: 5 }} transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </motion.span>
                </Link>
            </Button>
        </motion.div>
      </div>

      {/* Key Features Section */}
      <motion.div initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.3 }} className="w-full max-w-5xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div variants={cardVariants} className="h-full">
                <Link href="/ideas" className="block h-full">
                    <Card className="animated-rainbow-border p-6 h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                        <Lightbulb className="h-10 w-10 mx-auto text-primary mb-4" />
                        <h3 className="text-xl font-semibold">Submit Ideas</h3>
                        <p className="text-muted-foreground mt-2">Have a groundbreaking concept? Share it with the community and get valuable feedback.</p>
                    </Card>
                </Link>
            </motion.div>
            <motion.div variants={cardVariants} className="h-full">
                <Link href="/programs" className="block h-full">
                    <Card className="animated-rainbow-border p-6 h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                        <CalendarCheck className="h-10 w-10 mx-auto text-primary mb-4" />
                        <h3 className="text-xl font-semibold">Join Events</h3>
                        <p className="text-muted-foreground mt-2">Participate in hackathons, workshops, and seminars to build your skills and network.</p>
                    </Card>
                </Link>
            </motion.div>
             <motion.div variants={cardVariants} className="h-full">
                <Link href="/programs" className="block h-full">
                    <Card className="animated-rainbow-border p-6 h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                        <Users className="h-10 w-10 mx-auto text-primary mb-4" />
                        <h3 className="text-xl font-semibold">Form Teams</h3>
                        <p className="text-muted-foreground mt-2">Collaborate with peers on projects and compete in group-based events.</p>
                    </Card>
                </Link>
            </motion.div>
        </div>
      </motion.div>

      {/* How It Works Section */}
       <div className="w-full max-w-3xl px-4 space-y-8 text-center">
            <h2 className="text-3xl font-bold">Your Journey to Innovation</h2>
            <p className="text-muted-foreground">A simple path from a concept to a real-world project.</p>
            <div className="relative mt-8 flex flex-col items-center">
                <div className="space-y-12">
                     {timelineSteps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial="offscreen"
                            whileInView="onscreen"
                            viewport={{ once: true, amount: 0.3 }}
                        >
                            <TimelineStep
                                {...step}
                                isLast={index === timelineSteps.length - 1}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
      
      {/* Featured Event Section */}
       <div className="w-full max-w-5xl px-4 space-y-8">
            <h2 className="text-3xl font-bold text-center">Featured Event</h2>
            {loading ? (
                <Skeleton className="h-72 w-full rounded-lg" />
            ) : latestEvent ? (
                <Card className="animated-rainbow-border overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col md:flex-row">
                    <div className="w-full md:w-1/2 aspect-video md:aspect-auto bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                        <Image src={latestEvent.image_url || 'https://placehold.co/500x300.png'} alt={`Poster for ${latestEvent.name}`} width={500} height={300} className="object-cover w-full h-full" data-ai-hint="event poster conference" />
                    </div>
                    <div className="flex flex-col flex-grow p-6 md:p-8 justify-center">
                        <CardHeader className="p-0 mb-4">
                            <CardTitle className="text-3xl text-primary">{latestEvent.name}</CardTitle>
                            <CardDescription className="pt-1 text-base">{latestEvent.description.substring(0, 150)}...</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <p className="text-sm text-muted-foreground mb-4">
                                Join us at <span className="font-semibold text-foreground">{latestEvent.venue}</span> starting from <span className="font-semibold text-foreground">{format(parseISO(latestEvent.start_date), 'MMM d, yyyy')}</span>.
                            </p>
                            <Button asChild size="lg">
                                <Link href="/programs">
                                    View Details & Register 
                                    <motion.span whileHover={{ x: 5 }} transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
                                      <ArrowRight className="ml-2 h-5 w-5"/>
                                    </motion.span>
                                </Link>
                            </Button>
                        </CardContent>
                    </div>
                </Card>
            ) : (
                <p className="text-center text-muted-foreground">No featured event at the moment. Check back soon!</p>
            )}
        </div>


       {/* Featured Ideas Section */}
       <div className="w-full max-w-5xl px-4 space-y-8">
            <h2 className="text-3xl font-bold text-center">Latest Innovations</h2>
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i} className="flex flex-col h-full"><CardHeader><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/2 mt-2" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent><CardFooter><Skeleton className="h-8 w-full" /></CardFooter></Card>
                    ))}
                </div>
            ) : featuredIdeas.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredIdeas.map(idea => <IdeaCard key={idea.id} idea={idea} />)}
                </div>
            ) : (
                <p className="text-center text-muted-foreground">No approved ideas yet. Be the first to have yours featured!</p>
            )}
            <div className="text-center">
                 <Button asChild variant="outline">
                    <Link href="/ideas">
                        View All Ideas 
                        <motion.span whileHover={{ x: 5 }} transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </motion.span>
                    </Link>
                </Button>
            </div>
       </div>

      {/* Testimonials Section */}
      <div className="w-full max-w-7xl px-4 space-y-8">
            <h2 className="text-3xl font-bold text-center">What People Are Saying</h2>
            <p className="text-muted-foreground text-center">Feedback from our community members and participants.</p>
            <TestimonialScroller items={feedbackItems} />
      </div>
       
      {/* Past Events Section */}
      <div className="w-full max-w-5xl px-4 text-center">
          <motion.div initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.3 }} className="animated-rainbow-border rounded-lg p-8 md:p-12 shadow-lg">
              <motion.div variants={cardVariants}>
                  <Archive className="h-12 w-12 mx-auto text-primary mb-4" />
                  <h2 className="text-3xl font-bold">Explore Our History</h2>
                  <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                      Look back at our successful past events, workshops, and hackathons. See the journey and the milestones we've achieved together as a community.
                  </p>
                  <Button asChild variant="secondary" className="mt-6">
                    <Link href="/programs/archive">View Past Events</Link>
                  </Button>
              </motion.div>
          </motion.div>
      </div>

      {/* Developer Cell Section */}
      <div className="w-full max-w-5xl px-4 text-center">
          <motion.div initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.3 }} className="animated-rainbow-border rounded-lg p-8 md:p-12 shadow-lg">
              <motion.div variants={cardVariants}>
                  <Code2 className="h-12 w-12 mx-auto text-primary mb-4" />
                  <h2 className="text-3xl font-bold">Meet the Developer Cell</h2>
                  <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                      This platform was proudly designed, developed, and is maintained by the student-led Developer Cell of the CSE Department at GECM. We build solutions to empower our community.
                  </p>
              </motion.div>
          </motion.div>
      </div>


      {/* Final CTA Section */}
      <div className="animated-rainbow-border w-full max-w-4xl px-4 text-center p-8 md:p-12 rounded-xl shadow-lg">
         <h2 className="text-3xl font-bold">Ready to Innovate?</h2>
         <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Join a vibrant community of creators, thinkers, and builders. Register now to submit your ideas, join events, and start your journey.</p>
         <Button asChild size="lg" className="mt-6 animated-border-button">
            <Link href="/register">
                <UserPlus className="mr-2 h-5 w-5" /> Join GLAD Cell Today
            </Link>
        </Button>
      </div>

      <EducationalChatbot />

      <Dialog open={isPromoVisible} onOpenChange={(open) => !open && handleClosePromotion()}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-primary/20 bg-background/95 backdrop-blur-sm" onInteractOutside={(e) => e.preventDefault()}>
          <AnimatePresence mode="wait">
            {currentPromo && (
              <motion.div
                key={currentPromo.id}
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -50 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <div className="aspect-video w-full relative">
                    <Image src={currentPromo.image_url || 'https://placehold.co/400x225.png'} alt={currentPromo.title} layout="fill" objectFit="cover" data-ai-hint="promotion event" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                </div>
                <DialogHeader className="p-6 pt-4 text-left">
                  <DialogTitle className="text-primary text-2xl flex items-center gap-2">
                    <Megaphone className="h-6 w-6 animate-pulse" />
                    {currentPromo.title}
                  </DialogTitle>
                </DialogHeader>
                <div className="px-6 pb-6 space-y-4">
                  <p className="text-sm text-muted-foreground">{currentPromo.description}</p>
                  <DialogFooter className="sm:justify-start gap-2 pt-4">
                    {currentPromo.cta_link && currentPromo.cta_text && (
                        <Button type="button" asChild className="animated-border-button">
                            <Link href={currentPromo.cta_link}>{currentPromo.cta_text}</Link>
                        </Button>
                    )}
                    <Button type="button" variant="ghost" onClick={handleClosePromotion}>
                      Close
                    </Button>
                  </DialogFooter>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

    </div>
  );
}
