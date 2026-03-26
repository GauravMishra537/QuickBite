const express = require('express');
const router = express.Router();
const {
    getPlatformStats,
    getAllUsers,
    toggleUserStatus,
    getAllOrders,
    getAllRestaurants,
    toggleRestaurantStatus,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/toggle', toggleUserStatus);
router.get('/orders', getAllOrders);
router.get('/restaurants', getAllRestaurants);
router.patch('/restaurants/:id/toggle', toggleRestaurantStatus);

module.exports = router;
