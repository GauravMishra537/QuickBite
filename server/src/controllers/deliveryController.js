const DeliveryPartner = require('../models/DeliveryPartner');
const Order = require('../models/Order');
const Donation = require('../models/Donation');
const Restaurant = require('../models/Restaurant');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');
const { emitOrderUpdate, emitToUser } = require('../config/socket');

/**
 * @desc    Register as delivery partner
 * @route   POST /api/deliveries/register
 * @access  Private (delivery role)
 */
const registerPartner = catchAsync(async (req, res, next) => {
    const existing = await DeliveryPartner.findOne({ user: req.user._id });
    if (existing) return next(new AppError('You are already registered as a delivery partner', 400));

    const partner = await DeliveryPartner.create({ ...req.body, user: req.user._id });
    ApiResponse.created(res, { partner }, 'Delivery partner registered successfully');
});

/**
 * @desc    Get my delivery partner profile (returns 404 if not registered)
 * @route   GET /api/deliveries/profile
 * @access  Private (delivery role)
 */
const getMyProfile = catchAsync(async (req, res, next) => {
    const partner = await DeliveryPartner.findOne({ user: req.user._id }).populate('currentOrder');
    if (!partner) return next(new AppError('You have not registered as a delivery partner yet.', 404));
    ApiResponse.success(res, { partner }, 'Profile retrieved');
});

/**
 * @desc    Update delivery partner profile
 * @route   PUT /api/deliveries/profile
 * @access  Private (delivery role)
 */
const updateProfile = catchAsync(async (req, res, next) => {
    const allowedFields = ['vehicleType', 'vehicleNumber', 'licenseNumber', 'bankDetails', 'isAvailable'];
    const updates = {};
    allowedFields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const partner = await DeliveryPartner.findOneAndUpdate(
        { user: req.user._id }, updates, { new: true, runValidators: true }
    );
    if (!partner) return next(new AppError('Profile not found', 404));
    ApiResponse.success(res, { partner }, 'Profile updated');
});

/**
 * @desc    Update current location
 * @route   PATCH /api/deliveries/location
 * @access  Private (delivery role)
 */
const updateLocation = catchAsync(async (req, res, next) => {
    const { coordinates } = req.body; // [lng, lat]
    if (!coordinates || coordinates.length !== 2) {
        return next(new AppError('Please provide valid coordinates [longitude, latitude]', 400));
    }

    const partner = await DeliveryPartner.findOneAndUpdate(
        { user: req.user._id },
        { currentLocation: { type: 'Point', coordinates } },
        { new: true }
    );
    if (!partner) return next(new AppError('Profile not found', 404));
    ApiResponse.success(res, { location: partner.currentLocation }, 'Location updated');
});

/**
 * @desc    Toggle availability
 * @route   PATCH /api/deliveries/toggle-availability
 * @access  Private (delivery role)
 */
const toggleAvailability = catchAsync(async (req, res, next) => {
    const partner = await DeliveryPartner.findOne({ user: req.user._id });
    if (!partner) return next(new AppError('Profile not found', 404));

    partner.isAvailable = !partner.isAvailable;
    await partner.save();
    ApiResponse.success(res, { partner }, `You are now ${partner.isAvailable ? 'available' : 'offline'}`);
});

/**
 * @desc    Get available deliveries (orders ready for pickup)
 * @route   GET /api/deliveries/available
 * @access  Private (delivery role)
 */
const getAvailableDeliveries = catchAsync(async (req, res, next) => {
    // Get regular orders ready for delivery
    const orders = await Order.find({ status: 'ready', deliveryPartner: null })
        .populate('restaurant', 'name address phone images')
        .populate('cloudKitchen', 'name address phone images')
        .populate('groceryShop', 'name address phone images')
        .populate('user', 'name phone')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

    // Get donation pickups ready for delivery
    const donations = await Donation.find({ status: 'readyForPickup', deliveryPartner: null })
        .populate('restaurant', 'name address phone images')
        .populate('ngo', 'name address phone')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

    // Mark donations so client can distinguish them
    const donationOrders = donations.map(d => ({
        ...d,
        _type: 'donation',
        deliveryFee: 35,
    }));

    ApiResponse.success(res, { orders, donations: donationOrders }, 'Available deliveries retrieved');
});

/**
 * @desc    Accept a delivery
 * @route   PATCH /api/deliveries/accept/:orderId
 * @access  Private (delivery role)
 */
const acceptDelivery = catchAsync(async (req, res, next) => {
    const partner = await DeliveryPartner.findOne({ user: req.user._id });
    if (!partner) return next(new AppError('Profile not found', 404));
    if (partner.isOnDelivery) return next(new AppError('You are already on a delivery', 400));

    const order = await Order.findById(req.params.orderId)
        .populate('restaurant', 'name address phone owner')
        .populate('cloudKitchen', 'name address phone owner')
        .populate('groceryShop', 'name address phone owner');
    if (!order) return next(new AppError('Order not found', 404));
    if (order.status !== 'ready') return next(new AppError('Order is not ready for delivery', 400));
    if (order.deliveryPartner) return next(new AppError('This delivery is already assigned', 400));

    order.deliveryPartner = req.user._id;
    order.status = 'pickedUp';
    await order.save();

    partner.isOnDelivery = true;
    partner.isAvailable = false;
    partner.currentOrder = order._id;
    await partner.save();

    // ── Socket: Notify customer and business ──
    const businessName = order.restaurant?.name || order.cloudKitchen?.name || order.groceryShop?.name || 'Business';
    const socketData = {
        orderId: order._id,
        orderNumber: order._id.toString().slice(-6).toUpperCase(),
        status: 'pickedUp',
        deliveryPartner: req.user.name,
        businessName,
        message: `${req.user.name} has picked up your order from ${businessName}!`,
        updatedAt: new Date(),
    };

    try {
        emitToUser(order.user.toString(), 'orderStatusChanged', socketData);
        emitOrderUpdate(order._id.toString(), socketData);
        // Notify business owner
        const ownerId = order.restaurant?.owner || order.cloudKitchen?.owner || order.groceryShop?.owner;
        if (ownerId) emitToUser(ownerId.toString(), 'orderStatusChanged', socketData);
    } catch (e) { /* socket not ready */ }

    ApiResponse.success(res, { order }, 'Delivery accepted and picked up!');
});

/**
 * @desc    Mark order as out for delivery
 * @route   PATCH /api/deliveries/out-for-delivery/:orderId
 * @access  Private (delivery role)
 */
const markOutForDelivery = catchAsync(async (req, res, next) => {
    const order = await Order.findById(req.params.orderId)
        .populate('restaurant', 'name owner')
        .populate('cloudKitchen', 'name owner')
        .populate('groceryShop', 'name owner');
    if (!order) return next(new AppError('Order not found', 404));
    if (order.deliveryPartner.toString() !== req.user._id.toString()) {
        return next(new AppError('Not your delivery', 403));
    }
    if (order.status !== 'pickedUp') return next(new AppError('Order is not picked up yet', 400));

    order.status = 'outForDelivery';
    await order.save();

    const businessName = order.restaurant?.name || order.cloudKitchen?.name || order.groceryShop?.name || 'Business';
    const socketData = {
        orderId: order._id,
        orderNumber: order._id.toString().slice(-6).toUpperCase(),
        status: 'outForDelivery',
        deliveryPartner: req.user.name,
        businessName,
        message: `Your order is on the way! ${req.user.name} is heading to you.`,
        updatedAt: new Date(),
    };

    try {
        emitToUser(order.user.toString(), 'orderStatusChanged', socketData);
        emitOrderUpdate(order._id.toString(), socketData);
        const ownerId = order.restaurant?.owner || order.cloudKitchen?.owner || order.groceryShop?.owner;
        if (ownerId) emitToUser(ownerId.toString(), 'orderStatusChanged', socketData);
    } catch (e) { /* socket not ready */ }

    ApiResponse.success(res, { order }, 'Order is out for delivery');
});

/**
 * @desc    Complete a delivery
 * @route   PATCH /api/deliveries/complete/:orderId
 * @access  Private (delivery role)
 */
const completeDelivery = catchAsync(async (req, res, next) => {
    const order = await Order.findById(req.params.orderId)
        .populate('restaurant', 'name owner')
        .populate('cloudKitchen', 'name owner')
        .populate('groceryShop', 'name owner');
    if (!order) return next(new AppError('Order not found', 404));
    if (order.deliveryPartner.toString() !== req.user._id.toString()) {
        return next(new AppError('Not your delivery', 403));
    }
    if (!['pickedUp', 'outForDelivery'].includes(order.status)) {
        return next(new AppError('Order is not out for delivery', 400));
    }

    order.status = 'delivered';
    order.deliveredAt = new Date();
    order.paymentStatus = 'completed';
    await order.save();

    const earningsPerDelivery = order.deliveryFee || 50;
    const partner = await DeliveryPartner.findOneAndUpdate(
        { user: req.user._id },
        {
            isOnDelivery: false,
            isAvailable: true,
            currentOrder: null,
            $inc: { totalDeliveries: 1, totalEarnings: earningsPerDelivery },
        },
        { new: true }
    );

    // ── Socket: Notify all parties ──
    const businessName = order.restaurant?.name || order.cloudKitchen?.name || order.groceryShop?.name || 'Business';
    const socketData = {
        orderId: order._id,
        orderNumber: order._id.toString().slice(-6).toUpperCase(),
        status: 'delivered',
        deliveryPartner: req.user.name,
        businessName,
        message: `Order delivered successfully! Thank you.`,
        updatedAt: new Date(),
    };

    try {
        emitToUser(order.user.toString(), 'orderStatusChanged', socketData);
        emitOrderUpdate(order._id.toString(), socketData);
        const ownerId = order.restaurant?.owner || order.cloudKitchen?.owner || order.groceryShop?.owner;
        if (ownerId) emitToUser(ownerId.toString(), 'orderStatusChanged', socketData);
    } catch (e) { /* socket not ready */ }

    ApiResponse.success(res, { order, partner }, 'Delivery completed! 🎉');
});

/**
 * @desc    Get active deliveries (currently assigned to this partner)
 * @route   GET /api/deliveries/active
 * @access  Private (delivery role)
 */
const getActiveDeliveries = catchAsync(async (req, res) => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Active regular orders
    const orders = await Order.find({
        deliveryPartner: req.user._id,
        $or: [
            { status: { $in: ['pickedUp', 'outForDelivery'] } },
            { status: 'delivered', deliveredAt: { $gte: todayStart } },
        ],
    })
        .populate('restaurant', 'name address phone')
        .populate('cloudKitchen', 'name address phone')
        .populate('groceryShop', 'name address phone')
        .populate('user', 'name phone')
        .sort({ createdAt: -1 })
        .lean();

    // Active donation deliveries
    const donations = await Donation.find({
        deliveryPartner: req.user._id,
        status: { $in: ['pickedUp', 'outForDelivery'] },
    })
        .populate('restaurant', 'name address phone')
        .populate('ngo', 'name address phone')
        .sort({ createdAt: -1 })
        .lean();

    const donationOrders = donations.map(d => ({ ...d, _type: 'donation', deliveryFee: 35 }));

    ApiResponse.success(res, { orders, donations: donationOrders }, 'Active deliveries retrieved');
});

/**
 * @desc    Get delivery history
 * @route   GET /api/deliveries/history
 * @access  Private (delivery role)
 */
const getDeliveryHistory = catchAsync(async (req, res, next) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
        Order.find({ deliveryPartner: req.user._id, status: 'delivered' })
            .populate('restaurant', 'name')
            .populate('cloudKitchen', 'name')
            .populate('groceryShop', 'name')
            .populate('user', 'name')
            .sort({ deliveredAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean(),
        Order.countDocuments({ deliveryPartner: req.user._id, status: 'delivered' }),
    ]);

    // Also get donation delivery history
    const donationHistory = await Donation.find({
        deliveryPartner: req.user._id,
        status: 'delivered',
    })
        .populate('restaurant', 'name')
        .populate('ngo', 'name')
        .sort({ updatedAt: -1 })
        .lean();

    const allHistory = [
        ...orders.map(o => ({ ...o, _type: 'order' })),
        ...donationHistory.map(d => ({ ...d, _type: 'donation', deliveryFee: 35 })),
    ].sort((a, b) => new Date(b.deliveredAt || b.updatedAt) - new Date(a.deliveredAt || a.updatedAt));

    ApiResponse.paginated(res, { orders: allHistory }, { total: total + donationHistory.length, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil((total + donationHistory.length) / parseInt(limit)) }, 'Delivery history retrieved');
});

/**
 * @desc    Get earnings summary
 * @route   GET /api/deliveries/earnings
 * @access  Private (delivery role)
 */
const getEarnings = catchAsync(async (req, res, next) => {
    const partner = await DeliveryPartner.findOne({ user: req.user._id });
    if (!partner) return next(new AppError('Profile not found', 404));

    // Get today's deliveries & earnings
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayOrders = await Order.countDocuments({
        deliveryPartner: req.user._id,
        status: 'delivered',
        deliveredAt: { $gte: todayStart },
    });

    // Count donation deliveries today
    const todayDonations = await Donation.countDocuments({
        deliveryPartner: req.user._id,
        status: 'delivered',
        updatedAt: { $gte: todayStart },
    });

    ApiResponse.success(res, {
        totalDeliveries: partner.totalDeliveries,
        totalEarnings: partner.totalEarnings,
        todayDeliveries: todayOrders + todayDonations,
        todayEarnings: (todayOrders * 50) + (todayDonations * 35),
        rating: partner.rating,
        isAvailable: partner.isAvailable,
    }, 'Earnings retrieved');
});

/**
 * @desc    Get all delivery partners (admin)
 * @route   GET /api/deliveries/admin/all
 * @access  Private (admin)
 */
const getAllPartners = catchAsync(async (req, res, next) => {
    const partners = await DeliveryPartner.find()
        .populate('user', 'name email phone')
        .populate('currentOrder')
        .lean();

    ApiResponse.success(res, { partners }, 'All partners retrieved');
});

// ===== DONATION DELIVERY ENDPOINTS =====

/**
 * @desc    Accept a donation delivery
 * @route   PATCH /api/deliveries/donation/accept/:donationId
 * @access  Private (delivery role)
 */
const acceptDonationDelivery = catchAsync(async (req, res, next) => {
    const partner = await DeliveryPartner.findOne({ user: req.user._id });
    if (!partner) return next(new AppError('Profile not found', 404));
    if (partner.isOnDelivery) return next(new AppError('You are already on a delivery', 400));

    const donation = await Donation.findById(req.params.donationId)
        .populate('restaurant', 'name address phone owner')
        .populate('ngo', 'name address phone owner');
    if (!donation) return next(new AppError('Donation not found', 404));
    if (donation.status !== 'readyForPickup') return next(new AppError('Donation is not ready for pickup', 400));
    if (donation.deliveryPartner) return next(new AppError('This donation delivery is already assigned', 400));

    donation.deliveryPartner = req.user._id;
    donation.status = 'pickedUp';
    await donation.save();

    partner.isOnDelivery = true;
    partner.isAvailable = false;
    await partner.save();

    // Socket: Notify restaurant owner and NGO
    try {
        const socketData = {
            donationId: donation._id,
            status: 'pickedUp',
            deliveryPartner: req.user.name,
            message: `${req.user.name} has picked up the surplus food donation!`,
        };
        if (donation.restaurant?.owner) emitToUser(donation.restaurant.owner.toString(), 'donationStatusChanged', socketData);
        if (donation.ngo?.owner) emitToUser(donation.ngo.owner.toString(), 'donationStatusChanged', socketData);
    } catch (e) { /* socket not ready */ }

    ApiResponse.success(res, { donation }, 'Donation delivery accepted! Heading to pickup 🍲');
});

/**
 * @desc    Mark donation as out for delivery
 * @route   PATCH /api/deliveries/donation/out-for-delivery/:donationId
 * @access  Private (delivery role)
 */
const markDonationOutForDelivery = catchAsync(async (req, res, next) => {
    const donation = await Donation.findById(req.params.donationId)
        .populate('restaurant', 'name owner')
        .populate('ngo', 'name owner');
    if (!donation) return next(new AppError('Donation not found', 404));
    if (!donation.deliveryPartner || donation.deliveryPartner.toString() !== req.user._id.toString()) {
        return next(new AppError('Not your delivery', 403));
    }
    if (donation.status !== 'pickedUp') return next(new AppError('Donation is not picked up yet', 400));

    donation.status = 'outForDelivery';
    await donation.save();

    try {
        const socketData = {
            donationId: donation._id,
            status: 'outForDelivery',
            deliveryPartner: req.user.name,
            message: `Surplus food is on the way to ${donation.ngo?.name || 'the NGO'}!`,
        };
        if (donation.restaurant?.owner) emitToUser(donation.restaurant.owner.toString(), 'donationStatusChanged', socketData);
        if (donation.ngo?.owner) emitToUser(donation.ngo.owner.toString(), 'donationStatusChanged', socketData);
    } catch (e) { /* socket not ready */ }

    ApiResponse.success(res, { donation }, 'Donation is out for delivery');
});

/**
 * @desc    Complete a donation delivery (restaurant pays ₹35 delivery fee)
 * @route   PATCH /api/deliveries/donation/complete/:donationId
 * @access  Private (delivery role)
 */
const completeDonationDelivery = catchAsync(async (req, res, next) => {
    const donation = await Donation.findById(req.params.donationId)
        .populate('restaurant', 'name owner')
        .populate('ngo', 'name owner');
    if (!donation) return next(new AppError('Donation not found', 404));
    if (!donation.deliveryPartner || donation.deliveryPartner.toString() !== req.user._id.toString()) {
        return next(new AppError('Not your delivery', 403));
    }
    if (!['pickedUp', 'outForDelivery'].includes(donation.status)) {
        return next(new AppError('Donation is not out for delivery', 400));
    }

    donation.status = 'delivered';
    await donation.save();

    // Update NGO donation count
    if (donation.ngo) {
        const NGO = require('../models/NGO');
        await NGO.findByIdAndUpdate(donation.ngo._id, { $inc: { totalDonationsReceived: 1 } });
    }

    // ₹35 delivery fee paid by restaurant
    const donationDeliveryFee = 35;
    const partner = await DeliveryPartner.findOneAndUpdate(
        { user: req.user._id },
        {
            isOnDelivery: false,
            isAvailable: true,
            currentOrder: null,
            $inc: { totalDeliveries: 1, totalEarnings: donationDeliveryFee },
        },
        { new: true }
    );

    try {
        const socketData = {
            donationId: donation._id,
            status: 'delivered',
            deliveryPartner: req.user.name,
            message: `Surplus food delivered successfully to ${donation.ngo?.name || 'NGO'}! 🎉`,
        };
        if (donation.restaurant?.owner) emitToUser(donation.restaurant.owner.toString(), 'donationStatusChanged', socketData);
        if (donation.ngo?.owner) emitToUser(donation.ngo.owner.toString(), 'donationStatusChanged', socketData);
    } catch (e) { /* socket not ready */ }

    ApiResponse.success(res, { donation, partner, earnings: donationDeliveryFee }, `Donation delivered! ₹${donationDeliveryFee} earned (paid by restaurant) 🎉`);
});

module.exports = {
    registerPartner,
    getMyProfile,
    updateProfile,
    updateLocation,
    toggleAvailability,
    getAvailableDeliveries,
    getActiveDeliveries,
    acceptDelivery,
    markOutForDelivery,
    completeDelivery,
    getDeliveryHistory,
    getEarnings,
    getAllPartners,
    // Donation delivery endpoints
    acceptDonationDelivery,
    markDonationOutForDelivery,
    completeDonationDelivery,
};
