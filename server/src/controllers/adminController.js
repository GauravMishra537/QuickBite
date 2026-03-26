const User = require('../models/User');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const CloudKitchen = require('../models/CloudKitchen');
const GroceryShop = require('../models/GroceryShop');
const NGO = require('../models/NGO');
const DeliveryPartner = require('../models/DeliveryPartner');
const Review = require('../models/Review');
const Donation = require('../models/Donation');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');

/** @desc Platform-wide stats  @route GET /api/admin/stats  @access Admin */
const getPlatformStats = catchAsync(async (req, res) => {
    const [
        totalUsers, totalOrders, totalRestaurants, totalKitchens,
        totalGrocery, totalNGOs, totalDeliveryPartners, totalReviews, totalDonations,
        revenueAgg, roleCounts, orderStatusCounts,
    ] = await Promise.all([
        User.countDocuments(),
        Order.countDocuments(),
        Restaurant.countDocuments(),
        CloudKitchen.countDocuments(),
        GroceryShop.countDocuments(),
        NGO.countDocuments(),
        DeliveryPartner.countDocuments(),
        Review.countDocuments(),
        Donation.countDocuments(),
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
        totalUsers, totalOrders, totalRestaurants, totalKitchens,
        totalGrocery, totalNGOs, totalDeliveryPartners, totalReviews, totalDonations,
        totalRevenue, roles, orderStatuses,
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

/** @desc Get all cloud kitchens  @route GET /api/admin/cloud-kitchens  @access Admin */
const getAllCloudKitchens = catchAsync(async (req, res) => {
    const kitchens = await CloudKitchen.find()
        .populate('owner', 'name email')
        .sort({ createdAt: -1 }).lean();
    ApiResponse.success(res, { kitchens }, 'Cloud kitchens retrieved');
});

/** @desc Toggle cloud kitchen active  @route PATCH /api/admin/cloud-kitchens/:id/toggle  @access Admin */
const toggleCloudKitchenStatus = catchAsync(async (req, res) => {
    const kitchen = await CloudKitchen.findById(req.params.id);
    if (!kitchen) return res.status(404).json({ success: false, message: 'Cloud kitchen not found' });
    kitchen.isActive = !kitchen.isActive;
    await kitchen.save({ validateBeforeSave: false });
    ApiResponse.success(res, { kitchen }, `Cloud kitchen ${kitchen.isActive ? 'activated' : 'suspended'}`);
});

/** @desc Get all grocery shops  @route GET /api/admin/grocery-shops  @access Admin */
const getAllGroceryShops = catchAsync(async (req, res) => {
    const shops = await GroceryShop.find()
        .populate('owner', 'name email')
        .sort({ createdAt: -1 }).lean();
    ApiResponse.success(res, { shops }, 'Grocery shops retrieved');
});

/** @desc Toggle grocery shop active  @route PATCH /api/admin/grocery-shops/:id/toggle  @access Admin */
const toggleGroceryShopStatus = catchAsync(async (req, res) => {
    const shop = await GroceryShop.findById(req.params.id);
    if (!shop) return res.status(404).json({ success: false, message: 'Grocery shop not found' });
    shop.isActive = !shop.isActive;
    await shop.save({ validateBeforeSave: false });
    ApiResponse.success(res, { shop }, `Grocery shop ${shop.isActive ? 'activated' : 'suspended'}`);
});

/** @desc Get all NGOs  @route GET /api/admin/ngos  @access Admin */
const getAllNGOs = catchAsync(async (req, res) => {
    const ngos = await NGO.find()
        .populate('owner', 'name email')
        .sort({ createdAt: -1 }).lean();
    ApiResponse.success(res, { ngos }, 'NGOs retrieved');
});

/** @desc Toggle NGO active  @route PATCH /api/admin/ngos/:id/toggle  @access Admin */
const toggleNGOStatus = catchAsync(async (req, res) => {
    const ngo = await NGO.findById(req.params.id);
    if (!ngo) return res.status(404).json({ success: false, message: 'NGO not found' });
    ngo.isActive = !ngo.isActive;
    await ngo.save({ validateBeforeSave: false });
    ApiResponse.success(res, { ngo }, `NGO ${ngo.isActive ? 'activated' : 'suspended'}`);
});

/** @desc Get all delivery partners  @route GET /api/admin/delivery-partners  @access Admin */
const getAllDeliveryPartners = catchAsync(async (req, res) => {
    const partners = await DeliveryPartner.find()
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 }).lean();
    ApiResponse.success(res, { partners }, 'Delivery partners retrieved');
});

/** @desc Toggle delivery partner active  @route PATCH /api/admin/delivery-partners/:id/toggle  @access Admin */
const toggleDeliveryPartnerStatus = catchAsync(async (req, res) => {
    const partner = await DeliveryPartner.findById(req.params.id);
    if (!partner) return res.status(404).json({ success: false, message: 'Delivery partner not found' });
    partner.isActive = !partner.isActive;
    await partner.save({ validateBeforeSave: false });
    ApiResponse.success(res, { partner }, `Delivery partner ${partner.isActive ? 'activated' : 'suspended'}`);
});

module.exports = {
    getPlatformStats,
    getAllUsers,
    toggleUserStatus,
    getAllOrders,
    getAllRestaurants,
    toggleRestaurantStatus,
    getAllCloudKitchens,
    toggleCloudKitchenStatus,
    getAllGroceryShops,
    toggleGroceryShopStatus,
    getAllNGOs,
    toggleNGOStatus,
    getAllDeliveryPartners,
    toggleDeliveryPartnerStatus,
};
