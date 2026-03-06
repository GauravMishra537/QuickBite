const express = require('express');
const router = express.Router();
const {
    getPlans,
    createSubscription,
    getMySubscription,
    getSubscriptionHistory,
    cancelSubscription,
    useFreeDelivery,
    getAllSubscriptions,
} = require('../controllers/subscriptionController');
const { protect, authorize } = require('../middleware/auth');

// Public
router.get('/plans', getPlans);

// Customer
router.post('/', protect, authorize('customer'), createSubscription);
router.get('/my-subscription', protect, authorize('customer'), getMySubscription);
router.get('/history', protect, authorize('customer'), getSubscriptionHistory);
router.patch('/:id/cancel', protect, authorize('customer'), cancelSubscription);
router.patch('/use-delivery', protect, authorize('customer'), useFreeDelivery);

// Admin
router.get('/admin/all', protect, authorize('admin'), getAllSubscriptions);

module.exports = router;
