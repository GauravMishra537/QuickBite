const express = require('express');
const router = express.Router();
const {
    createOrderCheckout,
    createBookingCheckout,
    createSubscriptionCheckout,
    paymentSuccess,
    paymentCancel,
    getStripeConfig,
    createPaymentIntent,
    processRefund,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

// Public
router.get('/config', getStripeConfig);
router.get('/success', paymentSuccess);
router.get('/cancel', paymentCancel);

// Customer checkout sessions
router.post('/create-checkout/order', protect, authorize('customer'), createOrderCheckout);
router.post('/create-checkout/booking', protect, authorize('customer'), createBookingCheckout);
router.post('/create-checkout/subscription', protect, authorize('customer'), createSubscriptionCheckout);

// Custom payment intent
router.post('/create-intent', protect, authorize('customer'), createPaymentIntent);

// Admin refund
router.post('/refund', protect, authorize('admin'), processRefund);

module.exports = router;
