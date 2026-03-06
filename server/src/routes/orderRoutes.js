const express = require('express');
const router = express.Router();
const {
    createOrder,
    getMyOrders,
    getOrder,
    getBusinessOrders,
    updateOrderStatus,
    cancelOrder,
    getAllOrders,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

// Customer routes
router.post('/', protect, authorize('customer'), createOrder);
router.get('/my-orders', protect, authorize('customer'), getMyOrders);
router.patch('/:id/cancel', protect, authorize('customer'), cancelOrder);

// Business routes (restaurant, cloudkitchen, grocery)
router.get('/business', protect, authorize('restaurant', 'cloudkitchen', 'grocery'), getBusinessOrders);
router.patch('/:id/status', protect, authorize('restaurant', 'cloudkitchen', 'grocery', 'delivery', 'admin'), updateOrderStatus);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllOrders);

// Shared
router.get('/:id', protect, getOrder);

module.exports = router;
