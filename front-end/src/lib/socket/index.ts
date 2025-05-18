// lib/socket/index.ts
import { io, Socket } from 'socket.io-client';

// Define the singleton pattern for socket instance
let socket: Socket | null = null;

/**
 * Initialize and get the socket instance
 * @param userId - User ID for socket connection
 * @returns Socket instance
 */
export const getSocketInstance = (userId?: string): Socket => {
  if (!socket) {
    // Create new socket connection if it doesn't exist
    socket = io("https://back-end-71mc.onrender.com", {
      autoConnect: false, // Don't connect automatically, we'll connect manually
      withCredentials: true,
      query: userId ? { userId } : undefined,
      transports: ['websocket', 'polling'], // Prefer WebSocket, fallback to polling
      reconnectionAttempts: 5, // Try to reconnect 5 times
      reconnectionDelay: 1000, // Start with 1 second delay
      reconnectionDelayMax: 5000, // Maximum 5 seconds delay
      timeout: 20000, // Connection timeout
    });
  } else if (userId && socket.connected && socket.io.opts.query?.userId !== userId) {
    // If user ID changes, disconnect and recreate socket
    socket.disconnect();
    socket.io.opts.query = { userId };
    socket.connect();
  }
  
  return socket;
};

/**
 * Disconnect the socket instance
 */

export const disconnectSocket = (): void => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};

/**
 * Check if socket is connected
 */
export const isSocketConnected = (): boolean => {
  return !!(socket && socket.connected);
};





export default {
  getSocketInstance,
  disconnectSocket,
  isSocketConnected,
};