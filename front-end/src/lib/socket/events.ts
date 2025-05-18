// lib/socket/events.ts

// Connection events
export const CONNECT = 'connect';
export const DISCONNECT = 'disconnect';
export const CONNECT_ERROR = 'connect_error';
export const RECONNECT = 'reconnect';
export const RECONNECT_ATTEMPT = 'reconnect_attempt';
export const RECONNECT_ERROR = 'reconnect_error';
export const RECONNECT_FAILED = 'reconnect_failed';

// Custom application events - update these based on your backend events
export const USER_STATUS_CHANGED = 'user:status:changed';
export const NEW_NOTIFICATION = 'notification:new';
export const MESSAGE_RECEIVED = 'message:received';
export const ACTIVITY_UPDATE = 'activity:update';

// Error event
export const ERROR = 'error';

// Event types for TypeScript
export type ConnectionEvent = 
  | typeof CONNECT
  | typeof DISCONNECT
  | typeof CONNECT_ERROR
  | typeof RECONNECT
  | typeof RECONNECT_ATTEMPT
  | typeof RECONNECT_ERROR
  | typeof RECONNECT_FAILED;

export type ApplicationEvent = 
  | typeof USER_STATUS_CHANGED
  | typeof NEW_NOTIFICATION
  | typeof MESSAGE_RECEIVED
  | typeof ACTIVITY_UPDATE;

export type ErrorEvent = typeof ERROR;

// All events combined
export type SocketEvent = ConnectionEvent | ApplicationEvent | ErrorEvent;