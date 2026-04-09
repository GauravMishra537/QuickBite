const { Server } = require('socket.io');

let io;
const userSockets = new Map(); // userId -> Set<socketId>

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

        // ── User identification ──
        socket.on('joinUser', (userId) => {
            if (!userId) return;
            socket.userId = userId;
            socket.join(`user_${userId}`);
            // Track socket
            if (!userSockets.has(userId)) userSockets.set(userId, new Set());
            userSockets.get(userId).add(socket.id);
            console.log(`👤 User ${userId} joined (socket ${socket.id})`);
        });

        // ── Role-based rooms ──
        socket.on('joinRole', (role) => {
            if (!role) return;
            socket.join(`role_${role}`);
            console.log(`🏷️ Socket ${socket.id} joined role_${role}`);
        });

        // ── Order-specific room ──
        socket.on('joinOrder', (orderId) => {
            socket.join(`order_${orderId}`);
        });

        socket.on('leaveOrder', (orderId) => {
            socket.leave(`order_${orderId}`);
        });

        // ── Delivery partner location updates ──
        socket.on('locationUpdate', (data) => {
            const { orderId, lat, lng } = data;
            io.to(`order_${orderId}`).emit('deliveryLocation', { lat, lng, timestamp: Date.now() });
        });

        // ── Disconnect ──
        socket.on('disconnect', () => {
            if (socket.userId && userSockets.has(socket.userId)) {
                userSockets.get(socket.userId).delete(socket.id);
                if (userSockets.get(socket.userId).size === 0) {
                    userSockets.delete(socket.userId);
                }
            }
            console.log(`📡 Socket disconnected: ${socket.id}`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) throw new Error('Socket.IO not initialized');
    return io;
};

// ── Emit to a specific order room ──
const emitOrderUpdate = (orderId, data) => {
    if (io) {
        io.to(`order_${orderId}`).emit('orderStatusUpdate', data);
    }
};

// ── Emit to a specific user ──
const emitToUser = (userId, event, data) => {
    if (io) {
        io.to(`user_${userId}`).emit(event, data);
    }
};

// ── Emit to all users of a role (e.g. all delivery partners) ──
const emitToRole = (role, event, data) => {
    if (io) {
        io.to(`role_${role}`).emit(event, data);
    }
};

// ── Notify delivery partners about a new order ready for pickup ──
const notifyDeliveryPartners = (orderData) => {
    if (io) {
        io.to('role_delivery').emit('newDeliveryRequest', orderData);
    }
};

// ── Notify business owner about a new order ──
const notifyBusinessOwner = (ownerId, orderData) => {
    if (io) {
        io.to(`user_${ownerId}`).emit('newOrder', orderData);
    }
};

module.exports = {
    initSocket,
    getIO,
    emitOrderUpdate,
    emitToUser,
    emitToRole,
    notifyDeliveryPartners,
    notifyBusinessOwner,
};
