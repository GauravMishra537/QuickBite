const express = require('express');
const router = express.Router();
const {
    createMenuItem,
    getRestaurantMenu,
    getKitchenMenu,
    updateMenuItem,
    deleteMenuItem,
    toggleAvailability,
} = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/restaurant/:restaurantId', getRestaurantMenu);
router.get('/kitchen/:kitchenId', getKitchenMenu);

// Protected routes (restaurant / cloudkitchen owners)
router.post('/', protect, authorize('restaurant', 'cloudkitchen'), createMenuItem);
router.put('/:id', protect, authorize('restaurant', 'cloudkitchen', 'admin'), updateMenuItem);
router.delete('/:id', protect, authorize('restaurant', 'cloudkitchen', 'admin'), deleteMenuItem);
router.patch('/:id/toggle-availability', protect, authorize('restaurant', 'cloudkitchen'), toggleAvailability);

module.exports = router;
