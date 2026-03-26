const User = require('../models/User');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const CloudKitchen = require('../models/CloudKitchen');
const GroceryShop = require('../models/GroceryShop');
const Review = require('../models/Review');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');

/** @desc Platform-wide stats  @route GET /api/admin/stats  @access Admin */
const getPlatformStats = catchAsync(async (req, res) => {
    const [
        totalUsers,
        totalOrders,
        totalRestaurants,
        totalKitchens,
        totalGrocery,
        totalReviews,
        revenueAgg,
        roleCounts,
        orderStatusCounts,
    ] = await Promise.all([
        User.countDocuments(),
        Order.countDocuments(),
        Restaurant.countDocuments(),
        CloudKitchen.countDocuments(),
        GroceryShop.countDocuments(),
        Review.countDocuments(),
        Order.aggregate([
            { $match: { status: 'delivered' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
        User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
        Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;
    const roles = {};
    roleCounts.forEach((r) => { roles[r._id] = r.count; });
    const orderStatuses = {};
    orderStatusCounts.forEach((s) => { orderStatuses[s._id] = s.count; });

    ApiResponse.success(res, {
        totalUsers,
        totalOrders,
        totalRestaurants,
        totalKitchens,
        totalGrocery,
        totalReviews,
        totalRevenue,
        roles,
        orderStatuses,
    }, 'Platform stats retrieved');
});

/** @desc Get all users  @route GET /api/admin/users  @access Admin */
const getAllUsers = catchAsync(async (req, res) => {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
        ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
        User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
        User.countDocuments(query),
    ]);
    ApiResponse.paginated(res, { users }, {
        total, page: parseInt(page), limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
    }, 'Users retrieved');
});

/** @desc Toggle user active status  @route PATCH /api/admin/users/:id/toggle  @access Admin */
const toggleUserStatus = catchAsync(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    ApiResponse.success(res, { user }, `User ${user.isActive ? 'activated' : 'deactivated'}`);
});

/** @desc Get all orders  @route GET /api/admin/orders  @access Admin */
const getAllOrders = catchAsync(async (req, res) => {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
        Order.find(query)
            .populate('user', 'name email')
            .populate('restaurant', 'name')
            .populate('cloudKitchen', 'name')
            .populate('groceryShop', 'name')
            .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
        Order.countDocuments(query),
    ]);
    ApiResponse.paginated(res, { orders }, {
        total, page: parseInt(page), limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
    }, 'Orders retrieved');
});

/** @desc Get all restaurants  @route GET /api/admin/restaurants  @access Admin */
const getAllRestaurants = catchAsync(async (req, res) => {
    const restaurants = await Restaurant.find()
        .populate('owner', 'name email')
        .sort({ createdAt: -1 }).lean();
    ApiResponse.success(res, { restaurants }, 'Restaurants retrieved');
});

/** @desc Toggle restaurant active  @route PATCH /api/admin/restaurants/:id/toggle  @access Admin */
const toggleRestaurantStatus = catchAsync(async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    restaurant.isActive = !restaurant.isActive;
    await restaurant.save({ validateBeforeSave: false });
    ApiResponse.success(res, { restaurant }, `Restaurant ${restaurant.isActive ? 'activated' : 'suspended'}`);
});

module.exports = {
    getPlatformStats,
    getAllUsers,
    toggleUserStatus,
    getAllOrders,
    getAllRestaurants,
    toggleRestaurantStatus,
};
