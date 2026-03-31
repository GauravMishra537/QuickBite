const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        console.log(`📡 Socket connected: ${socket.id}`);

        // Join order-specific room for real-time tracking
        socket.on('joinOrder', (orderId) => {
            socket.join(`order_${orderId}`);
            console.log(`👁️ Socket ${socket.id} joined order_${orderId}`);
        });

        socket.on('leaveOrder', (orderId) => {
            socket.leave(`order_${orderId}`);
        });

        // Delivery partner sends location updates
        socket.on('locationUpdate', (data) => {
            const { orderId, lat, lng } = data;
            io.to(`order_${orderId}`).emit('deliveryLocation', { lat, lng, timestamp: Date.now() });
        });

        socket.on('disconnect', () => {
            console.log(`📡 Socket disconnected: ${socket.id}`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) throw new Error('Socket.IO not initialized');
    return io;
};

// Emit order status update to all listeners
const emitOrderUpdate = (orderId, data) => {
    if (io) {
        io.to(`order_${orderId}`).emit('orderStatusUpdate', data);
    }
};

module.exports = { initSocket, getIO, emitOrderUpdate };
