const express = require('express');
const router = express.Router();
const {
    createBooking,
    getMyBookings,
    getRestaurantBookings,
    updateBookingStatus,
    cancelBooking,
    getAvailableTables,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

// Public
router.get('/available/:restaurantId', getAvailableTables);

// Customer
router.post('/', protect, authorize('customer'), createBooking);
router.get('/my-bookings', protect, authorize('customer'), getMyBookings);
router.patch('/:id/cancel', protect, authorize('customer'), cancelBooking);

// Restaurant owner
router.get('/restaurant', protect, authorize('restaurant'), getRestaurantBookings);
router.patch('/:id/status', protect, authorize('restaurant', 'admin'), updateBookingStatus);

module.exports = router;
