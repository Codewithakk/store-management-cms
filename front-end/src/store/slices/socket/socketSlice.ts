// store/slices/socket.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SocketState } from '@/types/socket/socket';

const initialState: SocketState = {
  connected: false,
  connecting: false,
  error: null,
  userId: null,
  lastActivity: null,
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    socketConnecting: (state, action: PayloadAction<string | null>) => {
      state.connecting = true;
      state.userId = action.payload;
      state.error = null;
    },
    socketConnected: (state) => {
      state.connected = true;
      state.connecting = false;
      state.error = null;
      state.lastActivity = new Date().toISOString();
    },
    socketDisconnected: (state) => {
      state.connected = false;
      state.connecting = false;
      state.lastActivity = new Date().toISOString();
    },
    socketError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.connecting = false;
      state.connected = false;
      state.lastActivity = new Date().toISOString();
    },
    socketReconnecting: (state) => {
      state.connecting = true;
      state.connected = false;
      state.error = null;
    },
    socketActivity: (state) => {
      state.lastActivity = new Date().toISOString();
    },
    socketReset: (state) => {
      return initialState;
    },
  },
});

export const {
  socketConnecting,
  socketConnected,
  socketDisconnected,
  socketError,
  socketReconnecting,
  socketActivity,
  socketReset,
} = socketSlice.actions;

export default socketSlice.reducer;