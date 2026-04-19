import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000');

let socket = null;

export const getSocket = () => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            withCredentials: true,
            autoConnect: true,
        });
    }
    return socket;
};

export const joinOrderRoom = (orderId) => {
    const s = getSocket();
    s.emit('joinOrder', orderId);
};

export const leaveOrderRoom = (orderId) => {
    const s = getSocket();
    s.emit('leaveOrder', orderId);
};

export const sendLocationUpdate = (orderId, lat, lng) => {
    const s = getSocket();
    s.emit('locationUpdate', { orderId, lat, lng });
};

export default getSocket;
