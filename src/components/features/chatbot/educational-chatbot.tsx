
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Bot, User, Loader2, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { chatWithTutor } from '@/ai/flows/educational-chatbot-flow';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

const CHAT_HISTORY_KEY = 'gladly_chat_history';
const MAX_HISTORY = 20; // 10 user messages + 10 AI responses

export function EducationalChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load chat history from localStorage on initial mount
    try {
      const storedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
      if (storedHistory) {
        setChatHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
        console.error("Failed to parse chat history from localStorage", error);
        localStorage.removeItem(CHAT_HISTORY_KEY);
    }
  }, []);

  useEffect(() => {
    // Save chat history to localStorage whenever it changes
    try {
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chatHistory.slice(-MAX_HISTORY)));
    } catch (error) {
        console.error("Failed to save chat history to localStorage", error);
    }

    // Auto-scroll to bottom
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text: inputValue };
    setChatHistory(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const result = await chatWithTutor({ query: inputValue });
      const aiMessage: Message = { sender: 'ai', text: result.response };
      setChatHistory(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        sender: 'ai',
        text: 'Sorry, I encountered an error. Please try again.',
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [1, 1.15, 1], opacity: 1 }}
        transition={{
          opacity: { delay: 1, duration: 0.5 },
          scale: { delay: 1, duration: 0.5, type: 'spring' }
        }}
      >
        <Button
          className="h-14 w-14 rounded-full shadow-lg flex items-center justify-center bg-chart-3 text-white hover:bg-chart-3/90"
          onClick={() => setIsOpen(true)}
        >
          <Bot className="h-7 w-7" />
          <span className="sr-only">Open AI Tutor</span>
        </Button>
      </motion.div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md p-0 flex flex-col h-[70vh]">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-primary"/> Gladly - Your AI Tutor
            </DialogTitle>
            <DialogDescription>
              Ask me anything about your studies, projects, or career!
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {chatHistory.length === 0 && (
                <div className="text-center text-sm text-muted-foreground pt-10">
                  Your conversation history will appear here.
                </div>
              )}
              {chatHistory.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-3',
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.sender === 'ai' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'max-w-[75%] rounded-lg p-3 text-sm prose dark:prose-invert prose-p:my-0',
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                     <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
                  </div>
                  {message.sender === 'user' && (
                    <Avatar className="h-8 w-8">
                       <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3 justify-start">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                           <Bot className="h-5 w-5" />
                        </AvatarFallback>
                    </Avatar>
                    <div className="max-w-[75%] rounded-lg p-3 text-sm bg-muted flex items-center">
                        <Loader2 className="h-5 w-5 animate-spin"/>
                    </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <DialogFooter className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
              <Input
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Ask a question..."
                autoComplete="off"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
