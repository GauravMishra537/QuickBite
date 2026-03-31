const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const CloudKitchen = require('../models/CloudKitchen');
const GroceryShop = require('../models/GroceryShop');
const DeliveryPartner = require('../models/DeliveryPartner');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');
const { emitOrderUpdate } = require('../config/socket');

/**
 * @desc    Create a new order
 * @route   POST /api/orders
 * @access  Private (customer)
 */
const createOrder = catchAsync(async (req, res, next) => {
    const { orderType, items, restaurant, cloudKitchen, groceryShop, deliveryAddress, paymentMethod, notes } = req.body;

    // Calculate totals
    let itemsTotal = 0;
    items.forEach((item) => { itemsTotal += item.price * item.quantity; });

    let deliveryFee = 0;
    if (orderType === 'food') {
        if (restaurant) {
            const rest = await Restaurant.findById(restaurant);
            if (!rest) return next(new AppError('Restaurant not found', 404));
            deliveryFee = rest.deliveryFee || 30;
        } else if (cloudKitchen) {
            const kitchen = await CloudKitchen.findById(cloudKitchen);
            if (!kitchen) return next(new AppError('Cloud kitchen not found', 404));
            deliveryFee = kitchen.deliveryFee || 25;
        }
    } else if (orderType === 'grocery') {
        if (groceryShop) {
            const shop = await GroceryShop.findById(groceryShop);
            if (!shop) return next(new AppError('Grocery shop not found', 404));
            deliveryFee = shop.deliveryFee || 25;
        }
    }

    const tax = Math.round(itemsTotal * 0.05 * 100) / 100; // 5% GST
    const totalAmount = itemsTotal + deliveryFee + tax;

    const estimatedDelivery = new Date(Date.now() + 45 * 60 * 1000); // 45 mins from now

    const order = await Order.create({
        user: req.user._id,
        orderType,
        items,
        restaurant,
        cloudKitchen,
        groceryShop,
        itemsTotal,
        deliveryFee,
        tax,
        totalAmount,
        deliveryAddress,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
        estimatedDelivery,
        notes,
        statusHistory: [{ status: 'placed', timestamp: new Date() }],
    });

    ApiResponse.created(res, { order }, 'Order placed successfully');
});

/**
 * @desc    Get all orders for logged-in customer
 * @route   GET /api/orders/my-orders
 * @access  Private (customer)
 */
const getMyOrders = catchAsync(async (req, res, next) => {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
        Order.find(query)
            .populate('restaurant', 'name images phone')
            .populate('cloudKitchen', 'name images phone')
            .populate('groceryShop', 'name images phone')
            .populate('deliveryPartner', 'name phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean(),
        Order.countDocuments(query),
    ]);

    ApiResponse.paginated(res, { orders }, { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) }, 'Orders retrieved');
});

/**
 * @desc    Get single order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrder = catchAsync(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name email phone')
        .populate('restaurant', 'name address phone images')
        .populate('cloudKitchen', 'name address phone images')
        .populate('groceryShop', 'name address phone images')
        .populate('deliveryPartner', 'name phone');

    if (!order) return next(new AppError('Order not found', 404));

    // Only allow order owner, restaurant/shop owner, delivery partner, or admin
    const isOwner = order.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isDelivery = order.deliveryPartner && order.deliveryPartner._id.toString() === req.user._id.toString();

    if (!isOwner && !isAdmin && !isDelivery) {
        // Check if restaurant/shop owner
        let isBusinessOwner = false;
        if (order.restaurant) {
            const rest = await Restaurant.findById(order.restaurant._id || order.restaurant);
            isBusinessOwner = rest && rest.owner.toString() === req.user._id.toString();
        }
        if (order.cloudKitchen) {
            const ck = await CloudKitchen.findById(order.cloudKitchen._id || order.cloudKitchen);
            isBusinessOwner = ck && ck.owner.toString() === req.user._id.toString();
        }
        if (order.groceryShop) {
            const gs = await GroceryShop.findById(order.groceryShop._id || order.groceryShop);
            isBusinessOwner = gs && gs.owner.toString() === req.user._id.toString();
        }
        if (!isBusinessOwner) return next(new AppError('Not authorized to view this order', 403));
    }

    ApiResponse.success(res, { order }, 'Order retrieved');
});

/**
 * @desc    Get orders for a restaurant/kitchen/shop (business dashboard)
 * @route   GET /api/orders/business
 * @access  Private (restaurant, cloudkitchen, grocery)
 */
const getBusinessOrders = catchAsync(async (req, res, next) => {
    const { status, page = 1, limit = 10 } = req.query;
    let query = {};

    if (req.user.role === 'restaurant') {
        const rest = await Restaurant.findOne({ owner: req.user._id });
        if (!rest) return next(new AppError('No restaurant found', 404));
        query.restaurant = rest._id;
    } else if (req.user.role === 'cloudkitchen') {
        const ck = await CloudKitchen.findOne({ owner: req.user._id });
        if (!ck) return next(new AppError('No cloud kitchen found', 404));
        query.cloudKitchen = ck._id;
    } else if (req.user.role === 'grocery') {
        const gs = await GroceryShop.findOne({ owner: req.user._id });
        if (!gs) return next(new AppError('No grocery shop found', 404));
        query.groceryShop = gs._id;
    }

    if (status) query.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
        Order.find(query)
            .populate('user', 'name email phone')
            .populate('deliveryPartner', 'name phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean(),
        Order.countDocuments(query),
    ]);

    ApiResponse.paginated(res, { orders }, { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) }, 'Business orders retrieved');
});

/**
 * @desc    Update order status (business or delivery)
 * @route   PATCH /api/orders/:id/status
 * @access  Private (restaurant, cloudkitchen, grocery, delivery, admin)
 */
const updateOrderStatus = catchAsync(async (req, res, next) => {
    const { status } = req.body;
    const validTransitions = {
        placed: ['confirmed', 'cancelled'],
        confirmed: ['preparing', 'cancelled'],
        preparing: ['ready', 'cancelled'],
        ready: ['outForDelivery'],
        outForDelivery: ['delivered'],
    };

    const order = await Order.findById(req.params.id);
    if (!order) return next(new AppError('Order not found', 404));

    const allowed = validTransitions[order.status];
    if (!allowed || !allowed.includes(status)) {
        return next(new AppError(`Cannot transition from '${order.status}' to '${status}'`, 400));
    }

    order.status = status;
    if (status === 'delivered') {
        order.deliveredAt = new Date();
        order.paymentStatus = 'completed';
    }
    if (status === 'cancelled') {
        order.cancelledAt = new Date();
        order.cancelReason = req.body.cancelReason || 'Cancelled by business';
    }
    await order.save();

    // Emit real-time update via Socket.IO
    try { emitOrderUpdate(order._id.toString(), { status: order.status, updatedAt: new Date() }); } catch (e) { /* socket not ready */ }

    ApiResponse.success(res, { order }, `Order status updated to ${status}`);
});

/**
 * @desc    Cancel order (by customer)
 * @route   PATCH /api/orders/:id/cancel
 * @access  Private (customer)
 */
const cancelOrder = catchAsync(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    if (!order) return next(new AppError('Order not found', 404));
    if (order.user.toString() !== req.user._id.toString()) {
        return next(new AppError('Not authorized', 403));
    }
    if (!['placed', 'confirmed'].includes(order.status)) {
        return next(new AppError('Order cannot be cancelled at this stage', 400));
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancelReason = req.body.cancelReason || 'Cancelled by customer';
    await order.save();

    ApiResponse.success(res, { order }, 'Order cancelled successfully');
});

/**
 * @desc    Get all orders (admin)
 * @route   GET /api/orders/admin/all
 * @access  Private (admin)
 */
const getAllOrders = catchAsync(async (req, res, next) => {
    const { status, orderType, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (orderType) query.orderType = orderType;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
        Order.find(query)
            .populate('user', 'name email')
            .populate('restaurant', 'name')
            .populate('cloudKitchen', 'name')
            .populate('groceryShop', 'name')
            .populate('deliveryPartner', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean(),
        Order.countDocuments(query),
    ]);

    ApiResponse.paginated(res, { orders }, { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) }, 'All orders retrieved');
});

module.exports = {
    createOrder,
    getMyOrders,
    getOrder,
    getBusinessOrders,
    updateOrderStatus,
    cancelOrder,
    getAllOrders,
};
