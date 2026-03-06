const Subscription = require('../models/Subscription');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');

// Subscription plans config
const PLANS = {
    weekly: {
        name: 'QuickBite Weekly',
        price: 149,
        freeDeliveries: 7,
        discount: 5,
        description: '7 free deliveries + 5% off on all orders for 1 week',
    },
    monthly: {
        name: 'QuickBite Monthly',
        price: 399,
        freeDeliveries: 30,
        discount: 10,
        description: '30 free deliveries + 10% off on all orders for 1 month',
    },
    quarterly: {
        name: 'QuickBite Quarterly',
        price: 999,
        freeDeliveries: 90,
        discount: 15,
        description: '90 free deliveries + 15% off on all orders for 3 months',
    },
};

/**
 * @desc    Get available subscription plans
 * @route   GET /api/subscriptions/plans
 * @access  Public
 */
const getPlans = catchAsync(async (req, res, next) => {
    ApiResponse.success(res, { plans: PLANS }, 'Subscription plans retrieved');
});

/**
 * @desc    Create a subscription (pending payment)
 * @route   POST /api/subscriptions
 * @access  Private (customer)
 */
const createSubscription = catchAsync(async (req, res, next) => {
    const { plan } = req.body;
    if (!PLANS[plan]) return next(new AppError('Invalid subscription plan', 400));

    // Check for existing active subscription
    const existing = await Subscription.findOne({
        user: req.user._id,
        status: 'active',
        endDate: { $gt: new Date() },
    });
    if (existing) {
        return next(new AppError('You already have an active subscription', 400));
    }

    const planDetails = PLANS[plan];

    const subscription = await Subscription.create({
        user: req.user._id,
        plan,
        planDetails,
        status: 'pending',
        paymentStatus: 'pending',
    });

    ApiResponse.created(
        res,
        { subscription },
        'Subscription created. Proceed to payment to activate.'
    );
});

/**
 * @desc    Get my subscription
 * @route   GET /api/subscriptions/my-subscription
 * @access  Private (customer)
 */
const getMySubscription = catchAsync(async (req, res, next) => {
    const subscription = await Subscription.findOne({
        user: req.user._id,
        status: { $in: ['active', 'pending'] },
    }).sort({ createdAt: -1 });

    if (!subscription) {
        return ApiResponse.success(res, { subscription: null }, 'No active subscription');
    }

    // Check if expired
    if (subscription.status === 'active' && subscription.endDate < new Date()) {
        subscription.status = 'expired';
        await subscription.save();
    }

    const remainingDeliveries = Math.max(0, subscription.planDetails.freeDeliveries - subscription.freeDeliveriesUsed);

    ApiResponse.success(
        res,
        { subscription, remainingDeliveries },
        'Subscription retrieved'
    );
});

/**
 * @desc    Get subscription history
 * @route   GET /api/subscriptions/history
 * @access  Private (customer)
 */
const getSubscriptionHistory = catchAsync(async (req, res, next) => {
    const subscriptions = await Subscription.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .lean();

    ApiResponse.success(res, { subscriptions }, 'Subscription history retrieved');
});

/**
 * @desc    Cancel subscription
 * @route   PATCH /api/subscriptions/:id/cancel
 * @access  Private (customer)
 */
const cancelSubscription = catchAsync(async (req, res, next) => {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) return next(new AppError('Subscription not found', 404));
    if (subscription.user.toString() !== req.user._id.toString()) {
        return next(new AppError('Not authorized', 403));
    }
    if (subscription.status !== 'active') {
        return next(new AppError('Only active subscriptions can be cancelled', 400));
    }

    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    subscription.autoRenew = false;
    await subscription.save();

    ApiResponse.success(res, { subscription }, 'Subscription cancelled');
});

/**
 * @desc    Use a free delivery (called during order placement)
 * @route   PATCH /api/subscriptions/use-delivery
 * @access  Private (customer)
 */
const useFreeDelivery = catchAsync(async (req, res, next) => {
    const subscription = await Subscription.findOne({
        user: req.user._id,
        status: 'active',
        endDate: { $gt: new Date() },
    });

    if (!subscription) {
        return next(new AppError('No active subscription found', 404));
    }

    if (subscription.freeDeliveriesUsed >= subscription.planDetails.freeDeliveries) {
        return next(new AppError('All free deliveries have been used', 400));
    }

    subscription.freeDeliveriesUsed += 1;
    await subscription.save();

    const remaining = subscription.planDetails.freeDeliveries - subscription.freeDeliveriesUsed;
    ApiResponse.success(
        res,
        { subscription, remainingDeliveries: remaining },
        `Free delivery used. ${remaining} remaining.`
    );
});

/**
 * @desc    Get all subscriptions (admin)
 * @route   GET /api/subscriptions/admin/all
 * @access  Private (admin)
 */
const getAllSubscriptions = catchAsync(async (req, res, next) => {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const subscriptions = await Subscription.find(query)
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .lean();

    ApiResponse.success(res, { subscriptions }, 'All subscriptions retrieved');
});

module.exports = {
    getPlans,
    createSubscription,
    getMySubscription,
    getSubscriptionHistory,
    cancelSubscription,
    useFreeDelivery,
    getAllSubscriptions,
    PLANS,
};
