const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const CloudKitchen = require('../models/CloudKitchen');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');

/**
 * @desc    Create menu item for a restaurant or cloud kitchen
 * @route   POST /api/menu
 * @access  Private (restaurant or cloudkitchen role)
 */
const createMenuItem = catchAsync(async (req, res, next) => {
    let entityId;
    let entityField;

    if (req.user.role === 'restaurant') {
        let restaurant = await Restaurant.findOne({ owner: req.user._id });
        if (!restaurant) {
            restaurant = await Restaurant.create({
                owner: req.user._id,
                name: `${req.user.name}'s Restaurant`,
                description: 'A new restaurant on QuickBite',
                cuisine: ['Multi-Cuisine'],
                address: { street: 'Address pending', city: 'City', state: 'State', zipCode: '000000' },
                tables: [
                    { tableNumber: 1, capacity: 2, location: 'indoor' },
                    { tableNumber: 2, capacity: 4, location: 'indoor' },
                    { tableNumber: 3, capacity: 6, location: 'outdoor' },
                ],
            });
        }
        entityId = restaurant._id;
        entityField = 'restaurant';
    } else if (req.user.role === 'cloudkitchen') {
        let kitchen = await CloudKitchen.findOne({ owner: req.user._id });
        if (!kitchen) {
            kitchen = await CloudKitchen.create({
                owner: req.user._id,
                name: `${req.user.name}'s Cloud Kitchen`,
                description: 'A new cloud kitchen on QuickBite',
                cuisine: ['Multi-Cuisine'],
                address: { street: 'Address pending', city: 'City', state: 'State', zipCode: '000000' },
            });
        }
        entityId = kitchen._id;
        entityField = 'cloudKitchen';
    } else {
        return next(new AppError('Only restaurants and cloud kitchens can create menu items', 403));
    }

    const item = await MenuItem.create({
        ...req.body,
        [entityField]: entityId,
    });

    ApiResponse.created(res, { item }, 'Menu item created successfully');
});

/**
 * @desc    Get all menu items for a restaurant
 * @route   GET /api/menu/restaurant/:restaurantId
 * @access  Public
 */
const getRestaurantMenu = catchAsync(async (req, res, next) => {
    const { category, isVeg, search, sortBy = 'category' } = req.query;

    const query = { restaurant: req.params.restaurantId, isAvailable: true };
    if (category) query.category = category;
    if (isVeg !== undefined) query.isVeg = isVeg === 'true';
    if (search) query.name = { $regex: search, $options: 'i' };

    const sortOptions = {
        category: { category: 1, name: 1 },
        price_asc: { price: 1 },
        price_desc: { price: -1 },
        popular: { totalOrders: -1 },
        rating: { rating: -1 },
    };
    const sort = sortOptions[sortBy] || { category: 1 };

    const items = await MenuItem.find(query).sort(sort).lean();

    // Group items by category
    const grouped = {};
    items.forEach((item) => {
        if (!grouped[item.category]) grouped[item.category] = [];
        grouped[item.category].push(item);
    });

    ApiResponse.success(res, { items, grouped }, 'Menu items retrieved');
});

/**
 * @desc    Get all menu items for a cloud kitchen
 * @route   GET /api/menu/kitchen/:kitchenId
 * @access  Public
 */
const getKitchenMenu = catchAsync(async (req, res, next) => {
    const { category, isVeg, search, sortBy = 'category' } = req.query;

    const query = { cloudKitchen: req.params.kitchenId, isAvailable: true };
    if (category) query.category = category;
    if (isVeg !== undefined) query.isVeg = isVeg === 'true';
    if (search) query.name = { $regex: search, $options: 'i' };

    const sortOptions = {
        category: { category: 1, name: 1 },
        price_asc: { price: 1 },
        price_desc: { price: -1 },
        popular: { totalOrders: -1 },
    };
    const sort = sortOptions[sortBy] || { category: 1 };

    const items = await MenuItem.find(query).sort(sort).lean();

    const grouped = {};
    items.forEach((item) => {
        if (!grouped[item.category]) grouped[item.category] = [];
        grouped[item.category].push(item);
    });

    ApiResponse.success(res, { items, grouped }, 'Menu items retrieved');
});

/**
 * @desc    Update menu item
 * @route   PUT /api/menu/:id
 * @access  Private (owner)
 */
const updateMenuItem = catchAsync(async (req, res, next) => {
    let item = await MenuItem.findById(req.params.id);
    if (!item) return next(new AppError('Menu item not found', 404));

    // Verify ownership
    const isOwner = await verifyMenuItemOwnership(item, req.user);
    if (!isOwner && req.user.role !== 'admin') {
        return next(new AppError('Not authorized to update this item', 403));
    }

    item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    ApiResponse.success(res, { item }, 'Menu item updated successfully');
});

/**
 * @desc    Delete menu item
 * @route   DELETE /api/menu/:id
 * @access  Private (owner)
 */
const deleteMenuItem = catchAsync(async (req, res, next) => {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return next(new AppError('Menu item not found', 404));

    const isOwner = await verifyMenuItemOwnership(item, req.user);
    if (!isOwner && req.user.role !== 'admin') {
        return next(new AppError('Not authorized to delete this item', 403));
    }

    await MenuItem.findByIdAndDelete(req.params.id);
    ApiResponse.success(res, null, 'Menu item deleted successfully');
});

/**
 * @desc    Toggle item availability
 * @route   PATCH /api/menu/:id/toggle-availability
 * @access  Private (owner)
 */
const toggleAvailability = catchAsync(async (req, res, next) => {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return next(new AppError('Menu item not found', 404));

    const isOwner = await verifyMenuItemOwnership(item, req.user);
    if (!isOwner) return next(new AppError('Not authorized', 403));

    item.isAvailable = !item.isAvailable;
    await item.save();

    ApiResponse.success(
        res,
        { item },
        `Item is now ${item.isAvailable ? 'available' : 'unavailable'}`
    );
});

// ----- Helper -----
async function verifyMenuItemOwnership(item, user) {
    if (item.restaurant) {
        const restaurant = await Restaurant.findById(item.restaurant);
        return restaurant && restaurant.owner.toString() === user._id.toString();
    }
    if (item.cloudKitchen) {
        const kitchen = await CloudKitchen.findById(item.cloudKitchen);
        return kitchen && kitchen.owner.toString() === user._id.toString();
    }
    return false;
}

module.exports = {
    createMenuItem,
    getRestaurantMenu,
    getKitchenMenu,
    updateMenuItem,
    deleteMenuItem,
    toggleAvailability,
};
