'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getSocketInstance, disconnectSocket } from '@/lib/socket';
import { Socket } from 'socket.io-client';
import { toast } from 'react-toastify';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS' | 'SYSTEM';
  createdAt: string;
  workspaceId: number;
}

export default function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const newSocket = getSocketInstance(user.id);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO server:', newSocket.id);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket.IO connection error:', err.message);
    });
    newSocket.on('order:new', (data) => {
      toast.info(
        `:shopping_trolley: New order received from ${data.user.name} - $${data.totalAmount}`
      );
    });

    newSocket.on('order:statusUpdated', (payload) => {
      toast.info(`Order ${payload.orderId} updated to ${payload.status}`);
    });

    newSocket.on('order:updated', (data) => {
      toast.info(`:package: Order ${data.id} updated to ${data.status}`);
    });

    newSocket.on('order:created', (payload) => {
      console.log(':new: New order created:', payload);
    });
    newSocket.on('receive-notification', (notification: Notification) => {
      console.log('Received notification:', notification);
      setNotifications((prev) => [...prev, notification]);
    });

    return () => {
      disconnectSocket();
      setSocket(null);
    };
  }, [user?.id]);

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="relative">
      {children}
      {notifications.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg shadow-lg flex justify-between items-center ${
                notification.type === 'SUCCESS'
                  ? 'bg-green-500 text-white'
                  : notification.type === 'ERROR'
                    ? 'bg-red-500 text-white'
                    : notification.type === 'WARNING'
                      ? 'bg-yellow-500 text-black'
                      : 'bg-blue-500 text-white'
              }`}
            >
              <div>
                <strong>{notification.title}</strong>: {notification.message}
                <div className="text-sm mt-1">
                  {new Date(notification.createdAt).toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => dismissNotification(notification.id)}
                className="ml-4 text-sm underline hover:text-gray-200"
              >
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}