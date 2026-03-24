const TableBooking = require('../models/TableBooking');
const Restaurant = require('../models/Restaurant');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');

/**
 * @desc    Create a table booking
 * @route   POST /api/bookings
 * @access  Private (customer)
 */
const createBooking = catchAsync(async (req, res, next) => {
    const { restaurant, tableNumber, date, timeSlot, guests, specialRequests, preOrderTotal } = req.body;

    const rest = await Restaurant.findById(restaurant);
    if (!rest) return next(new AppError('Restaurant not found', 404));

    // Check if table exists and has enough capacity
    const table = rest.tables.find((t) => t.tableNumber === tableNumber);
    if (!table) return next(new AppError('Table not found', 404));
    if (guests > table.capacity) {
        return next(new AppError(`Table ${tableNumber} has a capacity of ${table.capacity} guests`, 400));
    }

    // Check for conflicting bookings
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(bookingDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const conflicting = await TableBooking.findOne({
        restaurant,
        tableNumber,
        date: { $gte: bookingDate, $lt: nextDay },
        'timeSlot.from': timeSlot.from,
        status: { $in: ['pending', 'confirmed'] },
    });

    if (conflicting) {
        return next(new AppError('This table is already booked for the selected time slot', 409));
    }

    const baseFee = 199;
    const bookingAmount = baseFee + (Number(preOrderTotal) || 0);

    const booking = await TableBooking.create({
        user: req.user._id,
        restaurant,
        tableNumber,
        date: bookingDate,
        timeSlot,
        guests,
        specialRequests,
        bookingAmount,
    });

    ApiResponse.created(
        res,
        { booking },
        'Table booking created. Proceed to payment to confirm.'
    );
});

/**
 * @desc    Get user's bookings
 * @route   GET /api/bookings/my-bookings
 * @access  Private (customer)
 */
const getMyBookings = catchAsync(async (req, res, next) => {
    const { status } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;

    const bookings = await TableBooking.find(query)
        .populate('restaurant', 'name address phone images')
        .sort({ date: -1 })
        .lean();

    ApiResponse.success(res, { bookings }, 'Bookings retrieved');
});

/**
 * @desc    Get restaurant bookings (for restaurant owner)
 * @route   GET /api/bookings/restaurant
 * @access  Private (restaurant)
 */
const getRestaurantBookings = catchAsync(async (req, res, next) => {
    const rest = await Restaurant.findOne({ owner: req.user._id });
    if (!rest) return next(new AppError('No restaurant found', 404));

    const { status, date } = req.query;
    const query = { restaurant: rest._id };
    if (status) query.status = status;
    if (date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        const nextDay = new Date(d);
        nextDay.setDate(nextDay.getDate() + 1);
        query.date = { $gte: d, $lt: nextDay };
    }

    const bookings = await TableBooking.find(query)
        .populate('user', 'name email phone')
        .sort({ date: 1, 'timeSlot.from': 1 })
        .lean();

    ApiResponse.success(res, { bookings }, 'Restaurant bookings retrieved');
});

/**
 * @desc    Update booking status (restaurant owner)
 * @route   PATCH /api/bookings/:id/status
 * @access  Private (restaurant, admin)
 */
const updateBookingStatus = catchAsync(async (req, res, next) => {
    const { status } = req.body;
    const validStatuses = ['confirmed', 'cancelled', 'completed', 'noShow'];
    if (!validStatuses.includes(status)) return next(new AppError('Invalid status', 400));

    const booking = await TableBooking.findById(req.params.id);
    if (!booking) return next(new AppError('Booking not found', 404));

    // Verify restaurant ownership
    if (req.user.role === 'restaurant') {
        const rest = await Restaurant.findOne({ owner: req.user._id });
        if (!rest || rest._id.toString() !== booking.restaurant.toString()) {
            return next(new AppError('Not authorized', 403));
        }
    }

    booking.status = status;
    if (status === 'cancelled') {
        booking.cancelledAt = new Date();
        booking.cancelReason = req.body.cancelReason || 'Cancelled by restaurant';
    }
    await booking.save();

    ApiResponse.success(res, { booking }, `Booking ${status}`);
});

/**
 * @desc    Cancel booking (by customer)
 * @route   PATCH /api/bookings/:id/cancel
 * @access  Private (customer)
 */
const cancelBooking = catchAsync(async (req, res, next) => {
    const booking = await TableBooking.findById(req.params.id);
    if (!booking) return next(new AppError('Booking not found', 404));
    if (booking.user.toString() !== req.user._id.toString()) {
        return next(new AppError('Not authorized', 403));
    }
    if (['cancelled', 'completed'].includes(booking.status)) {
        return next(new AppError('Cannot cancel this booking', 400));
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancelReason = req.body.cancelReason || 'Cancelled by customer';
    await booking.save();

    ApiResponse.success(res, { booking }, 'Booking cancelled');
});

/**
 * @desc    Get available tables for a restaurant on a given date/time
 * @route   GET /api/bookings/available/:restaurantId
 * @access  Public
 */
const getAvailableTables = catchAsync(async (req, res, next) => {
    const { date, timeSlot } = req.query;
    if (!date) return next(new AppError('Please provide a date', 400));

    const rest = await Restaurant.findById(req.params.restaurantId);
    if (!rest) return next(new AppError('Restaurant not found', 404));

    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(bookingDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const query = {
        restaurant: req.params.restaurantId,
        date: { $gte: bookingDate, $lt: nextDay },
        status: { $in: ['pending', 'confirmed'] },
    };
    if (timeSlot) query['timeSlot.from'] = timeSlot;

    const existingBookings = await TableBooking.find(query).lean();
    const bookedTableNumbers = existingBookings.map((b) => b.tableNumber);

    const availableTables = rest.tables
        .filter((t) => !bookedTableNumbers.includes(t.tableNumber))
        .map((t) => ({
            tableNumber: t.tableNumber,
            capacity: t.capacity,
            location: t.location,
            isAvailable: true,
        }));

    ApiResponse.success(res, { availableTables, totalTables: rest.tables.length, bookedCount: bookedTableNumbers.length }, 'Available tables retrieved');
});

module.exports = {
    createBooking,
    getMyBookings,
    getRestaurantBookings,
    updateBookingStatus,
    cancelBooking,
    getAvailableTables,
};
