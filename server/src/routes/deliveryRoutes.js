const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/deliveryController');
const { protect, authorize } = require('../middleware/auth');

// Delivery partner routes
router.post('/register', protect, authorize('delivery'), registerPartner);
router.get('/profile', protect, authorize('delivery'), getMyProfile);
router.put('/profile', protect, authorize('delivery'), updateProfile);
router.patch('/location', protect, authorize('delivery'), updateLocation);
router.patch('/toggle-availability', protect, authorize('delivery'), toggleAvailability);
router.get('/available', protect, authorize('delivery'), getAvailableDeliveries);
router.get('/active', protect, authorize('delivery'), getActiveDeliveries);
router.patch('/accept/:orderId', protect, authorize('delivery'), acceptDelivery);
router.patch('/out-for-delivery/:orderId', protect, authorize('delivery'), markOutForDelivery);
router.patch('/complete/:orderId', protect, authorize('delivery'), completeDelivery);
router.get('/history', protect, authorize('delivery'), getDeliveryHistory);
router.get('/earnings', protect, authorize('delivery'), getEarnings);

// Donation delivery routes (surplus food → NGO)
router.patch('/donation/accept/:donationId', protect, authorize('delivery'), acceptDonationDelivery);
router.patch('/donation/out-for-delivery/:donationId', protect, authorize('delivery'), markDonationOutForDelivery);
router.patch('/donation/complete/:donationId', protect, authorize('delivery'), completeDonationDelivery);

// Admin
router.get('/admin/all', protect, authorize('admin'), getAllPartners);

module.exports = router;

