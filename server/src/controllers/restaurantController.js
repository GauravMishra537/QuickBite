const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');

/**
 * @desc    Create a new restaurant
 * @route   POST /api/restaurants
 * @access  Private (restaurant role)
 */
const createRestaurant = catchAsync(async (req, res, next) => {
    // Check if this user already has a restaurant
    const existingRestaurant = await Restaurant.findOne({ owner: req.user._id });
    if (existingRestaurant) {
        return next(new AppError('You already have a restaurant registered.', 400));
    }

    const data = { ...req.body, owner: req.user._id };
    if (!data.images || data.images.length === 0) {
        data.images = ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'];
    }

    const restaurant = await Restaurant.create(data);

    ApiResponse.created(res, { restaurant }, 'Restaurant created successfully');
});

/**
 * @desc    Get all restaurants (public, with filters & pagination)
 * @route   GET /api/restaurants
 * @access  Public
 */
const getAllRestaurants = catchAsync(async (req, res, next) => {
    const {
        page = 1,
        limit = 12,
        cuisine,
        city,
        search,
        sortBy = 'rating',
        isOpen,
        isVeg,
        minRating,
    } = req.query;

    const query = { isActive: true };

    if (cuisine) query.cuisine = { $in: cuisine.split(',') };
    if (city) query['address.city'] = { $regex: city, $options: 'i' };
    if (isOpen !== undefined) query.isOpen = isOpen === 'true';
    if (minRating) query.rating = { $gte: parseFloat(minRating) };
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { cuisine: { $regex: search, $options: 'i' } },
            { tags: { $regex: search, $options: 'i' } },
        ];
    }

    const sortOptions = {
        rating: { rating: -1 },
        newest: { createdAt: -1 },
        deliveryTime: { 'deliveryTime.min': 1 },
        name: { name: 1 },
    };
    const sort = sortOptions[sortBy] || { rating: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [restaurants, total] = await Promise.all([
        Restaurant.find(query)
            .populate('owner', 'name email phone')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .lean(),
        Restaurant.countDocuments(query),
    ]);

    ApiResponse.paginated(
        res,
        { restaurants },
        { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
        'Restaurants retrieved successfully'
    );
});

/**
 * @desc    Get single restaurant by ID
 * @route   GET /api/restaurants/:id
 * @access  Public
 */
const getRestaurant = catchAsync(async (req, res, next) => {
    const restaurant = await Restaurant.findById(req.params.id)
        .populate('owner', 'name email phone')
        .populate('menuItems');

    if (!restaurant) {
        return next(new AppError('Restaurant not found', 404));
    }

    ApiResponse.success(res, { restaurant }, 'Restaurant retrieved successfully');
});

/**
 * @desc    Get the logged-in restaurant owner's restaurant
 * @route   GET /api/restaurants/my/restaurant
 * @access  Private (restaurant role)
 */
const getMyRestaurant = catchAsync(async (req, res, next) => {
    const restaurant = await Restaurant.findOne({ owner: req.user._id })
        .populate('menuItems');

    if (!restaurant) {
        return next(new AppError('You have not registered a restaurant yet.', 404));
    }

    ApiResponse.success(res, { restaurant }, 'Your restaurant retrieved');
});

/**
 * @desc    Update restaurant
 * @route   PUT /api/restaurants/:id
 * @access  Private (owner or admin)
 */
const updateRestaurant = catchAsync(async (req, res, next) => {
    let restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
        return next(new AppError('Restaurant not found', 404));
    }

    // Only owner or admin can update
    if (restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new AppError('Not authorized to update this restaurant', 403));
    }

    restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    ApiResponse.success(res, { restaurant }, 'Restaurant updated successfully');
});

/**
 * @desc    Delete restaurant
 * @route   DELETE /api/restaurants/:id
 * @access  Private (owner or admin)
 */
const deleteRestaurant = catchAsync(async (req, res, next) => {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
        return next(new AppError('Restaurant not found', 404));
    }

    if (restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new AppError('Not authorized to delete this restaurant', 403));
    }

    // Delete associated menu items
    await MenuItem.deleteMany({ restaurant: restaurant._id });
    await Restaurant.findByIdAndDelete(req.params.id);

    ApiResponse.success(res, null, 'Restaurant deleted successfully');
});

/**
 * @desc    Toggle restaurant open/close status
 * @route   PATCH /api/restaurants/:id/toggle-status
 * @access  Private (owner)
 */
const toggleRestaurantStatus = catchAsync(async (req, res, next) => {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
        return next(new AppError('Restaurant not found', 404));
    }

    if (restaurant.owner.toString() !== req.user._id.toString()) {
        return next(new AppError('Not authorized', 403));
    }

    restaurant.isOpen = !restaurant.isOpen;
    await restaurant.save();

    ApiResponse.success(
        res,
        { restaurant },
        `Restaurant is now ${restaurant.isOpen ? 'open' : 'closed'}`
    );
});

/**
 * @desc    Get featured restaurants
 * @route   GET /api/restaurants/featured/list
 * @access  Public
 */
const getFeaturedRestaurants = catchAsync(async (req, res, next) => {
    const restaurants = await Restaurant.find({ isFeatured: true, isActive: true })
        .populate('owner', 'name')
        .limit(8)
        .lean();

    ApiResponse.success(res, { restaurants }, 'Featured restaurants retrieved');
});

module.exports = {
    createRestaurant,
    getAllRestaurants,
    getRestaurant,
    getMyRestaurant,
    updateRestaurant,
    deleteRestaurant,
    toggleRestaurantStatus,
    getFeaturedRestaurants,
};
