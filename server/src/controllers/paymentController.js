const stripe = require('../config/stripe');
const Order = require('../models/Order');
const TableBooking = require('../models/TableBooking');
const Subscription = require('../models/Subscription');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');

/**
 * @desc    Create Stripe checkout session for food/grocery orders
 * @route   POST /api/payments/create-checkout/order
 * @access  Private (customer)
 */
const createOrderCheckout = catchAsync(async (req, res, next) => {
    const { orderId } = req.body;

    const order = await Order.findById(orderId)
        .populate('restaurant', 'name')
        .populate('cloudKitchen', 'name')
        .populate('groceryShop', 'name');

    if (!order) return next(new AppError('Order not found', 404));
    if (order.user.toString() !== req.user._id.toString()) {
        return next(new AppError('Not authorized', 403));
    }
    if (order.paymentStatus === 'completed') {
        return next(new AppError('Order is already paid', 400));
    }

    const businessName = order.restaurant?.name || order.cloudKitchen?.name || order.groceryShop?.name || 'QuickBite';

    const lineItems = order.items.map((item) => ({
        price_data: {
            currency: 'inr',
            product_data: {
                name: item.name,
                description: `From ${businessName}`,
            },
            unit_amount: Math.round(item.price * 100), // Stripe uses paise
        },
        quantity: item.quantity,
    }));

    // Add delivery fee as line item
    if (order.deliveryFee > 0) {
        lineItems.push({
            price_data: {
                currency: 'inr',
                product_data: { name: 'Delivery Fee' },
                unit_amount: Math.round(order.deliveryFee * 100),
            },
            quantity: 1,
        });
    }

    // Add tax as line item
    if (order.tax > 0) {
        lineItems.push({
            price_data: {
                currency: 'inr',
                product_data: { name: 'GST (5%)' },
                unit_amount: Math.round(order.tax * 100),
            },
            quantity: 1,
        });
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: req.user.email,
        client_reference_id: orderId,
        line_items: lineItems,
        metadata: {
            type: 'order',
            orderId: orderId,
            userId: req.user._id.toString(),
        },
        success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/orders?payment=success&session_id={CHECKOUT_SESSION_ID}&type=order`,
        cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/checkout?payment=cancelled`,
    });

    ApiResponse.success(res, { sessionId: session.id, url: session.url }, 'Checkout session created');
});

/**
 * @desc    Create Stripe checkout session for table booking
 * @route   POST /api/payments/create-checkout/booking
 * @access  Private (customer)
 */
const createBookingCheckout = catchAsync(async (req, res, next) => {
    const { bookingId } = req.body;

    const booking = await TableBooking.findById(bookingId).populate('restaurant', 'name');
    if (!booking) return next(new AppError('Booking not found', 404));
    if (booking.user.toString() !== req.user._id.toString()) {
        return next(new AppError('Not authorized', 403));
    }
    if (booking.paymentStatus === 'completed') {
        return next(new AppError('Booking is already paid', 400));
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: req.user.email,
        client_reference_id: bookingId,
        line_items: [
            {
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: `Table Booking — ${booking.restaurant.name}`,
                        description: `Table ${booking.tableNumber} for ${booking.guests} guests on ${new Date(booking.date).toLocaleDateString('en-IN')}`,
                    },
                    unit_amount: Math.round(booking.bookingAmount * 100),
                },
                quantity: 1,
            },
        ],
        metadata: {
            type: 'booking',
            bookingId: bookingId,
            userId: req.user._id.toString(),
        },
        success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/bookings?payment=success&session_id={CHECKOUT_SESSION_ID}&type=booking`,
        cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/bookings/new?payment=cancelled`,
    });

    ApiResponse.success(res, { sessionId: session.id, url: session.url }, 'Booking checkout session created');
});

/**
 * @desc    Create Stripe checkout session for subscription
 * @route   POST /api/payments/create-checkout/subscription
 * @access  Private (customer)
 */
const createSubscriptionCheckout = catchAsync(async (req, res, next) => {
    const { subscriptionId } = req.body;

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) return next(new AppError('Subscription not found', 404));
    if (subscription.user.toString() !== req.user._id.toString()) {
        return next(new AppError('Not authorized', 403));
    }
    if (subscription.paymentStatus === 'completed') {
        return next(new AppError('Subscription is already paid', 400));
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: req.user.email,
        client_reference_id: subscriptionId,
        line_items: [
            {
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: `QuickBite ${subscription.planDetails.name}`,
                        description: subscription.planDetails.description || `${subscription.plan} meal subscription`,
                    },
                    unit_amount: Math.round(subscription.planDetails.price * 100),
                },
                quantity: 1,
            },
        ],
        metadata: {
            type: 'subscription',
            subscriptionId: subscriptionId,
            userId: req.user._id.toString(),
        },
        success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/subscriptions?payment=success&session_id={CHECKOUT_SESSION_ID}&type=subscription`,
        cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/subscriptions?payment=cancelled`,
    });

    ApiResponse.success(res, { sessionId: session.id, url: session.url }, 'Subscription checkout session created');
});

/**
 * @desc    Handle successful payment (redirect callback)
 * @route   GET /api/payments/success
 * @access  Public (Stripe redirects here)
 */
const paymentSuccess = catchAsync(async (req, res, next) => {
    const { session_id, type } = req.query;

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {
        const { orderId, bookingId, subscriptionId } = session.metadata;

        if (type === 'order' && orderId) {
            await Order.findByIdAndUpdate(orderId, {
                paymentStatus: 'completed',
                paymentMethod: 'stripe',
            });
        }

        if (type === 'booking' && bookingId) {
            await TableBooking.findByIdAndUpdate(bookingId, {
                paymentStatus: 'completed',
                paymentId: session.payment_intent,
                status: 'confirmed',
            });
        }

        if (type === 'subscription' && subscriptionId) {
            const sub = await Subscription.findById(subscriptionId);
            if (sub) {
                const startDate = new Date();
                let endDate = new Date();
                if (sub.plan === 'weekly') endDate.setDate(endDate.getDate() + 7);
                else if (sub.plan === 'monthly') endDate.setMonth(endDate.getMonth() + 1);
                else if (sub.plan === 'quarterly') endDate.setMonth(endDate.getMonth() + 3);

                sub.paymentStatus = 'completed';
                sub.paymentId = session.payment_intent;
                sub.status = 'active';
                sub.startDate = startDate;
                sub.endDate = endDate;
                await sub.save();
            }
        }
    }

    // In production, redirect to frontend success page
    res.json({ success: true, message: 'Payment successful', sessionId: session_id, type });
});

/**
 * @desc    Handle cancelled payment
 * @route   GET /api/payments/cancel
 * @access  Public
 */
const paymentCancel = catchAsync(async (req, res, next) => {
    const { type, orderId, bookingId } = req.query;
    res.json({ success: false, message: 'Payment was cancelled', type, orderId, bookingId });
});

/**
 * @desc    Get Stripe publishable key for frontend
 * @route   GET /api/payments/config
 * @access  Public
 */
const getStripeConfig = catchAsync(async (req, res, next) => {
    ApiResponse.success(
        res,
        { publishableKey: process.env.STRIPE_PUBLISHABLE_KEY },
        'Stripe config retrieved'
    );
});

/**
 * @desc    Create a payment intent (for custom integration)
 * @route   POST /api/payments/create-intent
 * @access  Private (customer)
 */
const createPaymentIntent = catchAsync(async (req, res, next) => {
    const { amount, currency = 'inr', metadata = {} } = req.body;

    if (!amount || amount < 1) {
        return next(new AppError('Please provide a valid amount', 400));
    }

    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to paise
        currency,
        metadata: { ...metadata, userId: req.user._id.toString() },
        automatic_payment_methods: { enabled: true },
    });

    ApiResponse.success(
        res,
        { clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id },
        'Payment intent created'
    );
});

/**
 * @desc    Request refund
 * @route   POST /api/payments/refund
 * @access  Private (admin)
 */
const processRefund = catchAsync(async (req, res, next) => {
    const { paymentIntentId, amount, reason, type, entityId } = req.body;

    if (!paymentIntentId) {
        return next(new AppError('Payment intent ID is required', 400));
    }

    const refundParams = { payment_intent: paymentIntentId };
    if (amount) refundParams.amount = Math.round(amount * 100);
    if (reason) refundParams.reason = reason;

    const refund = await stripe.refunds.create(refundParams);

    // Update entity payment status
    if (type === 'order' && entityId) {
        await Order.findByIdAndUpdate(entityId, { paymentStatus: 'refunded' });
    }
    if (type === 'booking' && entityId) {
        await TableBooking.findByIdAndUpdate(entityId, { paymentStatus: 'refunded', status: 'cancelled' });
    }
    if (type === 'subscription' && entityId) {
        await Subscription.findByIdAndUpdate(entityId, { paymentStatus: 'refunded', status: 'cancelled' });
    }

    ApiResponse.success(res, { refund }, 'Refund processed successfully');
});

module.exports = {
    createOrderCheckout,
    createBookingCheckout,
    createSubscriptionCheckout,
    paymentSuccess,
    paymentCancel,
    getStripeConfig,
    createPaymentIntent,
    processRefund,
};
