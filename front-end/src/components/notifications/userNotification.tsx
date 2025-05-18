'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { BellIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import axiosInstance from '@/api/axios-config';

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const observer = useRef<IntersectionObserver | null>(null);

  const fetchNotifications = async (offset: number) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/notifications`, {
        params: {
          limit: 10,
          offset: offset,
          isRead: false,
        },
      });

      const newNotifications = response.data.notifications || [];
      setNotifications((prev) => [...prev, ...newNotifications]);
      setHasMore(newNotifications.length === 10);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setIsLoading(false);
    }
  };

  const lastElementObserver = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || !node) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 10);
        }
      });
      observer.current.observe(node);
    },
    [isLoading, hasMore]
  );

  // Mark component as mounted after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch notifications when dropdown opens, only after mount
  useEffect(() => {
    if (isMounted && isOpen) {
      setNotifications([]);
      setPage(0);
      fetchNotifications(0);
    }
  }, [isOpen, isMounted]);

  // Fetch additional pages
  useEffect(() => {
    if (isMounted && page > 0) {
      fetchNotifications(page);
    }
  }, [page, isMounted]);

  // Render nothing or a fallback during server-side rendering
  if (!isMounted) {
    return (
      <div className="relative inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 cursor-pointer">
        <BellIcon className="w-5 h-5 text-gray-500" />
      </div>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <div className="relative inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 cursor-pointer">
          <BellIcon className="w-5 h-5 text-gray-500" />
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-2">
        <h3 className="text-lg font-semibold px-2 mb-2">Notifications</h3>
        <ScrollArea className="h-96 pr-2">
          {notifications.length === 0 && !isLoading && (
            <div className="p-2 text-center text-sm text-gray-500">
              No notifications
            </div>
          )}
          {notifications.map((noti, index) => (
            <div
              key={noti.id}
              ref={
                index === notifications.length - 1 ? lastElementObserver : null
              }
              className="p-2 border-b cursor-pointer hover:bg-muted"
            >
              <p className="font-medium">{noti.title}</p>
              <p className="text-sm text-gray-500">{noti.message}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(noti.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
          {isLoading && <div className="p-2 text-center">Loading...</div>}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Notifications;
