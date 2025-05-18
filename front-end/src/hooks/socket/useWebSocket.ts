import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { Socket } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';

import {
  socketConnecting,
  socketConnected,
  socketDisconnected,
  socketError,
  socketReconnecting,
  socketActivity,
} from '@/store/slices/socket/socketSlice';
import { getSocketInstance, disconnectSocket } from '@/lib/socket';
import * as EVENTS from '@/lib/socket/events';
import { SocketHookOptions, SocketHookResult, SocketConnectionStatus } from '@/types/socket/socket';



export const useWebSocket = (options: SocketHookOptions = {}): SocketHookResult => {
  const {
    userId,
    autoConnect = true,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const dispatch = useAppDispatch();
  const socketState = useAppSelector((state) => state.socket);
  const socketRef = useRef<Socket | null>(null);
  const [status, setStatus] = useState<SocketConnectionStatus>({
    isConnected: false,
    isConnecting: false,
    isReconnecting: false,
    lastConnected: null,
    error: null,
  });
  const initialConnectionAttempted = useRef(false);





  

  // Memoize the connect function to prevent unnecessary recreations
  const connect = useCallback((newUserId?: string) => {
    const userIdToUse = newUserId || userId;
    
    if (!userIdToUse) {
      console.warn('Cannot connect without a userId');
      return;
    }

    // Only connect if not already connected or connecting
    if (socketRef.current?.connected || status.isConnecting) {
      return;
    }

    try {
      dispatch(socketConnecting(userIdToUse));
      setStatus(prev => ({ 
        ...prev, 
        isConnecting: true, 
        error: null 
      }));
      
      const socket = getSocketInstance(userIdToUse);
      socketRef.current = socket;
      
      if (!socket.connected) {
        socket.connect();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error connecting to socket';
      dispatch(socketError(errorMessage));
      setStatus(prev => ({
        ...prev,
        isConnecting: false,
        isReconnecting: false,
        error: error as Error,
      }));
      
      onError?.(error as Error);
    }
  }, [userId, dispatch, onError, status.isConnecting]);

  const disconnect = useCallback(() => {
    if (!socketRef.current) return;
    
    disconnectSocket();
    socketRef.current = null;
    dispatch(socketDisconnected());
    setStatus(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      isReconnecting: false,
    }));
  }, [dispatch]);




  // In your useWebSocket hook, add this useEffect:
useEffect(() => {
  return () => {
    // Cleanup on unmount
    if (socketRef.current?.connected) {
      disconnect();
    }
  };
}, [disconnect]);
  console.log('socketState  after logout here ,the socket was discounnnected.: ', socketState);

  const emit = useCallback(<T>(event: string, data?: T) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
      dispatch(socketActivity());
    } else {
      console.warn(`Cannot emit event ${event}: Socket not connected`);
    }
  }, [dispatch]);

  const on = useCallback(<T>(event: EVENTS.ApplicationEvent, callback: (data: T) => void) => {
    socketRef.current?.on(event, callback);
  }, []);

  const off = useCallback((event: EVENTS.ApplicationEvent, callback?: Function) => {
    socketRef.current?.off(event, callback as (...args: any[]) => void);
  }, []);

  // Main connection effect - runs only when userId changes
  useEffect(() => {
    if (!autoConnect || !userId) return;

    // Only attempt initial connection once per userId
    if (!initialConnectionAttempted.current) {
      initialConnectionAttempted.current = true;
      
      if (!socketRef.current?.connected && !status.isConnecting) {
        connect(userId);
      }
    }

    return () => {
      // Clean up listeners but don't disconnect the socket
      socketRef.current?.removeAllListeners();
      initialConnectionAttempted.current = false;
    };
  }, [userId]); // Only depend on userId

  
  // Event listeners setup effect - runs once on mount
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleConnect = () => {
      dispatch(socketConnected());
      setStatus(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        isReconnecting: false,
        lastConnected: new Date(),
        error: null,
      }));
      onConnect?.();
    };

    const handleDisconnect = (reason: string) => {

      console.log('socket disconnected:', reason);

      dispatch(socketDisconnected());
      setStatus(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        isReconnecting: false,
      }));
      onDisconnect?.(reason);
    };

    const handleError = (error: Error) => {
      const errorMessage = error?.message || 'Unknown socket error';
      dispatch(socketError(errorMessage));
      setStatus(prev => ({
        ...prev,
        error,
        isConnecting: false,
        isReconnecting: false,
      }));
      onError?.(error);
    };

    const handleReconnectAttempt = () => {
      dispatch(socketReconnecting());
      setStatus(prev => ({
        ...prev,
        isReconnecting: true,
        isConnected: false,
      }));
    };

    socket.on(EVENTS.CONNECT, handleConnect);
    socket.on(EVENTS.DISCONNECT, handleDisconnect);
    socket.on(EVENTS.CONNECT_ERROR, handleError);
    socket.on(EVENTS.ERROR, handleError);
    socket.on(EVENTS.RECONNECT_ATTEMPT, handleReconnectAttempt);

    return () => {
      socket.off(EVENTS.CONNECT, handleConnect);
      socket.off(EVENTS.DISCONNECT, handleDisconnect);
      socket.off(EVENTS.CONNECT_ERROR, handleError);
      socket.off(EVENTS.ERROR, handleError);
      socket.off(EVENTS.RECONNECT_ATTEMPT, handleReconnectAttempt);
    };
  }, [dispatch, onConnect, onDisconnect, onError]);

  return useMemo(() => ({
    socket: socketRef.current,
    status,
    connect,
    disconnect,
    isConnected: status.isConnected,
    emit,
    on,
    off,
  }), [status, connect, disconnect, emit, on, off]);
};

export default useWebSocket;