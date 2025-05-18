// lib/socket/actions.ts
import { getSocketInstance } from './index';
import * as EVENTS from './events';

/**
 * Emit a socket event with data
 * @param event - Event name to emit
 * @param data - Data to send with the event
 */
export const emitEvent = <T>(event: string, data?: T): void => {
  const socket = getSocketInstance();
  if (socket && socket.connected) {
    socket.emit(event, data);
  } else {
    console.warn('Socket is not connected. Cannot emit event:', event);
  }
};

/**
 * Send user status update
 * @param status - User status (online, away, offline)
 */
export const updateUserStatus = (status: 'online' | 'away' | 'offline'): void => {
  emitEvent('user:status:update', { status });
};

/**
 * Send a message to a specific user
 * @param userId - Target user ID
 * @param message - Message content
 */
export const sendMessage = (userId: string, message: string): void => {
  emitEvent('message:send', { userId, message });
};

/**
 * Join a specific room or channel
 * @param roomId - Room or channel ID
 */
export const joinRoom = (roomId: string): void => {
  emitEvent('room:join', { roomId });
};

/**
 * Leave a specific room or channel
 * @param roomId - Room or channel ID
 */
export const leaveRoom = (roomId: string): void => {
  emitEvent('room:leave', { roomId });
};

/**
 * Send typing indicator
 * @param roomId - Room or conversation ID
 * @param isTyping - Whether user is typing
 */
export const sendTypingStatus = (roomId: string, isTyping: boolean): void => {
  emitEvent('user:typing', { roomId, isTyping });
};

export default {
  emitEvent,
  updateUserStatus,
  sendMessage,
  joinRoom,
  leaveRoom,
  sendTypingStatus,
};