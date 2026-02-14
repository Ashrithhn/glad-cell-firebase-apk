
'use client';

import { cn } from "@/lib/utils";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { FeedbackData } from "@/services/feedback";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const TestimonialScroller = ({
  items,
  speed = 15000,
  className,
}: {
  items: FeedbackData[];
  speed?: number;
  className?: string;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [direction, setDirection] = useState(1);

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % (items.length || 1));
  }, [items.length]);

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + (items.length || 1)) % (items.length || 1));
  };

  const startAutoScroll = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (items.length > 1) {
      intervalRef.current = setInterval(handleNext, speed);
    }
  }, [handleNext, speed, items.length]);

  useEffect(() => {
    if (!isHovering) {
      startAutoScroll();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovering, startAutoScroll]);


  const handleMouseEnter = () => {
    setIsHovering(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    startAutoScroll();
  };

  // The conditional return must be AFTER all hook calls.
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-10 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">No public feedback available yet.</p>
      </div>
    );
  }
  
  const slideVariants = {
      hidden: (direction: number) => ({
          x: direction > 0 ? '100%' : '-100%',
          opacity: 0,
          scale: 0.95,
          transition: { type: "tween", duration: 0.3, ease: "easeOut"}
      }),
      visible: {
          x: 0,
          opacity: 1,
          scale: 1,
          transition: { type: "tween", duration: 0.4, ease: "easeIn"}
      },
      exit: (direction: number) => ({
          x: direction < 0 ? '100%' : '-100%',
          opacity: 0,
          scale: 0.95,
          transition: { type: "tween", duration: 0.3, ease: "easeOut"}
      })
  };

  return (
    <div 
        className={cn("relative w-full max-w-xl mx-auto h-64 overflow-hidden", className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute w-full h-full p-2"
        >
            <Card className="h-full flex flex-col justify-between">
                <CardContent className="p-6">
                    <blockquote className="text-muted-foreground">
                        <p>"{items[currentIndex].message}"</p>
                    </blockquote>
                </CardContent>
                <CardFooter className="flex items-center gap-4 p-6 pt-0">
                    <div className="text-sm">
                        <p className="font-semibold text-foreground">{items[currentIndex].author_name}</p>
                        <p className="text-muted-foreground">{items[currentIndex].author_designation || "Community Member"}</p>
                    </div>
                </CardFooter>
            </Card>
        </motion.div>
      </AnimatePresence>
      
      {items.length > 1 && (
        <>
            <Button
                variant="outline"
                size="icon"
                className="absolute top-1/2 -translate-y-1/2 left-0 z-10 rounded-full h-8 w-8"
                onClick={handlePrev}
            >
                <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
                variant="outline"
                size="icon"
                className="absolute top-1/2 -translate-y-1/2 right-0 z-10 rounded-full h-8 w-8"
                onClick={handleNext}
            >
                <ArrowRight className="h-4 w-4" />
            </Button>
        </>
      )}
    </div>
  );
};
