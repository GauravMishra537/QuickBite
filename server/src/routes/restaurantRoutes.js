const express = require('express');
const router = express.Router();
const {
    createRestaurant,
    getAllRestaurants,
    getRestaurant,
    getMyRestaurant,
    updateRestaurant,
    deleteRestaurant,
    toggleRestaurantStatus,
    getFeaturedRestaurants,
} = require('../controllers/restaurantController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllRestaurants);
router.get('/featured/list', getFeaturedRestaurants);
router.get('/:id', getRestaurant);

// Protected routes (restaurant owners)
router.post('/', protect, authorize('restaurant'), createRestaurant);
router.get('/my/restaurant', protect, authorize('restaurant'), getMyRestaurant);
router.put('/:id', protect, authorize('restaurant', 'admin'), updateRestaurant);
router.delete('/:id', protect, authorize('restaurant', 'admin'), deleteRestaurant);
router.patch('/:id/toggle-status', protect, authorize('restaurant'), toggleRestaurantStatus);

module.exports = router;
