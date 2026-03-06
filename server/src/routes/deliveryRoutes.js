const express = require('express');
const router = express.Router();
const {
    registerPartner,
    getMyProfile,
    updateProfile,
    updateLocation,
    toggleAvailability,
    getAvailableDeliveries,
    acceptDelivery,
    completeDelivery,
    getDeliveryHistory,
    getEarnings,
    getAllPartners,
} = require('../controllers/deliveryController');
const { protect, authorize } = require('../middleware/auth');

// Delivery partner routes
router.post('/register', protect, authorize('delivery'), registerPartner);
router.get('/profile', protect, authorize('delivery'), getMyProfile);
router.put('/profile', protect, authorize('delivery'), updateProfile);
router.patch('/location', protect, authorize('delivery'), updateLocation);
router.patch('/toggle-availability', protect, authorize('delivery'), toggleAvailability);
router.get('/available', protect, authorize('delivery'), getAvailableDeliveries);
router.patch('/accept/:orderId', protect, authorize('delivery'), acceptDelivery);
router.patch('/complete/:orderId', protect, authorize('delivery'), completeDelivery);
router.get('/history', protect, authorize('delivery'), getDeliveryHistory);
router.get('/earnings', protect, authorize('delivery'), getEarnings);

// Admin
router.get('/admin/all', protect, authorize('admin'), getAllPartners);

module.exports = router;
