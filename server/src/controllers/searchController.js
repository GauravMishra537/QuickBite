const Restaurant = require('../models/Restaurant');
const CloudKitchen = require('../models/CloudKitchen');
const GroceryShop = require('../models/GroceryShop');
const MenuItem = require('../models/MenuItem');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');

/** @desc Unified search  @route GET /api/search?q=  @access Public */
const unifiedSearch = catchAsync(async (req, res) => {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
        return ApiResponse.success(res, { restaurants: [], kitchens: [], shops: [], menuItems: [] }, 'Provide at least 2 characters');
    }
    const regex = { $regex: q, $options: 'i' };

    const [restaurants, kitchens, shops, menuItems] = await Promise.all([
        Restaurant.find({ name: regex, isActive: true }).select('name cuisine images rating address').limit(5).lean(),
        CloudKitchen.find({ name: regex, isActive: true }).select('name cuisine images rating address').limit(5).lean(),
        GroceryShop.find({ name: regex, isActive: true }).select('name categories images rating address').limit(5).lean(),
        MenuItem.find({ name: regex, isAvailable: true }).select('name price category restaurant cloudKitchen').limit(5).lean(),
    ]);

    ApiResponse.success(res, { restaurants, kitchens, shops, menuItems }, 'Search results');
});

module.exports = { unifiedSearch };
