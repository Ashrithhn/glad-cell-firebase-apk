
'use client';

import React, { useState, useEffect, useTransition, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  getNotificationsForUser,
  markNotificationsAsRead,
  Notification,
} from '@/services/notifications';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Bell, Loader2, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export function NotificationBell() {
  const { userId, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const result = await getNotificationsForUser(userId);
      if (result.success && result.notifications) {
        setNotifications(result.notifications);
        setUnreadCount(result.notifications.filter(n => !n.is_read).length);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const startPolling = () => {
      setIsLoading(true);
      fetchNotifications(); // Initial fetch
      
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    };

    const stopPolling = () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
    };

    if (userId && !authLoading) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [userId, authLoading, fetchNotifications]);

  const handleOpenChange = (open: boolean) => {
    // When the popover is opened, mark all visible unread notifications as read
    if (open && unreadCount > 0) {
      startTransition(async () => {
        const unreadIds = notifications
          .filter(n => !n.is_read)
          .map(n => n.id);
        
        if (unreadIds.length > 0) {
            const result = await markNotificationsAsRead(unreadIds);
            if (result.success) {
              // Optimistically update the UI
              setUnreadCount(0);
              setNotifications(prev =>
                prev.map(n => (unreadIds.includes(n.id) ? { ...n, is_read: true } : n))
              );
            }
        }
      });
    }
  };

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-bold animate-pulse">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Open notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">Notifications</h3>
            {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground"/>}
        </div>
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="p-4 flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notif, index) => (
              <React.Fragment key={notif.id}>
                <NotificationItem notification={notif} />
                {index < notifications.length - 1 && <Separator />}
              </React.Fragment>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground h-full flex items-center justify-center">
              You have no new notifications.
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function NotificationItem({ notification }: { notification: Notification }) {
    const content = (
        <div className="p-4 hover:bg-muted/50 transition-colors">
            {!notification.is_read && (
                 <div className="absolute left-2 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
            )}
            <div className="pl-4">
                <p className="font-semibold text-sm">{notification.title}</p>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </p>
            </div>
        </div>
    );

    if (notification.link) {
        return <Link href={notification.link} className="relative block">{content}</Link>;
    }
    return <div className="relative">{content}</div>;
}
