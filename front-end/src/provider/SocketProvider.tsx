// components/SocketProvider.tsx
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useWebSocket } from '@/hooks/socket/useWebSocket';
import { useAppDispatch } from '@/hooks/redux';
import { socketActivity } from '@/store/slices/socket/socketSlice';
import * as EVENTS from '@/lib/socket/events';
import { SocketHookResult } from '@/types/socket/socket';

// Create context for the socket
const SocketContext = createContext<SocketHookResult | null>(null);

interface SocketProviderProps {
  children: ReactNode;
  userId?: string;
  autoConnect?: boolean;
}

/**
 * Socket Provider component
 * 
 * Wraps the application with a socket connection context
 * for easy access to socket functionality throughout the app
 */
export const SocketProvider: React.FC<SocketProviderProps> = ({
  children,
  userId,
  autoConnect = true,
}) => {
  const dispatch = useAppDispatch();
  
  // Initialize the socket connection
  const socketHook = useWebSocket({
    userId,
    autoConnect,
    onConnect: () => {
      console.log('Socket connected successfully with user ID:', userId);
    },
    onDisconnect: (reason) => {
      console.log(`Socket disconnected: ${reason}`);
    },
    onError: (error) => {
      console.error('Socket error:', error);
    },
  });

  // Setup global event listeners
  useEffect(() => {
    if (socketHook.socket) {
      // Track all socket activity in Redux
      const handleActivity = () => {
        dispatch(socketActivity());
      };

      // Add global event listeners for common events
      socketHook.socket.onAny(handleActivity);

      // Example of listening for specific events
      socketHook.on(EVENTS.USER_STATUS_CHANGED, (data) => {
        console.log('User status changed:', data);
        // Handle user status changes
      });

      socketHook.on(EVENTS.NEW_NOTIFICATION, (data) => {
        console.log('New notification:', data);
        // Handle notifications
      });

      socketHook.on(EVENTS.MESSAGE_RECEIVED, (data) => {
        console.log('Message received:', data);
        // Handle messages
      });

      return () => {
        // Remove all listeners when component unmounts
        socketHook.socket?.offAny(handleActivity);
        socketHook.off(EVENTS.USER_STATUS_CHANGED);
        socketHook.off(EVENTS.NEW_NOTIFICATION);
        socketHook.off(EVENTS.MESSAGE_RECEIVED);
      };
    }
  }, [socketHook.socket, socketHook.on, socketHook.off, dispatch]);

  // Improved reconnection logic
  useEffect(() => {
    if (userId) {
      console.log('Socket connection status:', socketHook.isConnected);
      
      if (!socketHook.isConnected) {
        socketHook.connect(userId);
      }
    }
  }, [userId, socketHook]);

  return (
    <SocketContext.Provider value={socketHook}>
      {children}
    </SocketContext.Provider>
  );
};
/**
 * Custom hook to access the socket context
 * 
 * @returns Socket context value
 */
export const useSocket = (): SocketHookResult => {
  const context = useContext(SocketContext);
  
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  
  return context;
};

export default SocketProvider;