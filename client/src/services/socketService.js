import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

let socket = null;
let listeners = new Map(); // event -> Set<callback>

/**
 * Connect to socket server and join user/role rooms
 */
export const connectSocket = (userId, role) => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
  });

  socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket.id);
    if (userId) socket.emit('joinUser', userId);
    if (role) socket.emit('joinRole', role);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Socket disconnected:', reason);
  });

  socket.on('reconnect', () => {
    if (userId) socket.emit('joinUser', userId);
    if (role) socket.emit('joinRole', role);
  });

  return socket;
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    listeners.clear();
  }
};

/**
 * Get the current socket instance
 */
export const getSocket = () => socket;

/**
 * Subscribe to a socket event. Returns an unsubscribe function.
 */
export const onSocketEvent = (event, callback) => {
  if (!socket) return () => {};

  socket.on(event, callback);

  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event).add(callback);

  // Return unsubscribe
  return () => {
    if (socket) socket.off(event, callback);
    listeners.get(event)?.delete(callback);
  };
};

/**
 * Emit a socket event
 */
export const emitSocketEvent = (event, data) => {
  if (socket?.connected) {
    socket.emit(event, data);
  }
};

/**
 * Join an order room for real-time tracking
 */
export const joinOrderRoom = (orderId) => {
  if (socket?.connected) {
    socket.emit('joinOrder', orderId);
  }
};

/**
 * Leave an order room
 */
export const leaveOrderRoom = (orderId) => {
  if (socket?.connected) {
    socket.emit('leaveOrder', orderId);
  }
};

export default {
  connectSocket,
  disconnectSocket,
  getSocket,
  onSocketEvent,
  emitSocketEvent,
  joinOrderRoom,
  leaveOrderRoom,
};
