const CloudKitchen = require('../models/CloudKitchen');
const MenuItem = require('../models/MenuItem');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');

/**
 * @desc    Create a new cloud kitchen
 * @route   POST /api/cloud-kitchens
 * @access  Private (cloudkitchen role)
 */
const createCloudKitchen = catchAsync(async (req, res, next) => {
    const existing = await CloudKitchen.findOne({ owner: req.user._id });
    if (existing) {
        return next(new AppError('You already have a cloud kitchen registered.', 400));
    }

    const data = { ...req.body, owner: req.user._id };
    if (!data.images || data.images.length === 0) {
        data.images = ['https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=800'];
    }

    const kitchen = await CloudKitchen.create(data);

    ApiResponse.created(res, { kitchen }, 'Cloud kitchen created successfully');
});

/**
 * @desc    Get all cloud kitchens (public, with filters & pagination)
 * @route   GET /api/cloud-kitchens
 * @access  Public
 */
const getAllCloudKitchens = catchAsync(async (req, res, next) => {
    const { page = 1, limit = 12, cuisine, city, search, sortBy = 'rating' } = req.query;

    const query = { isActive: true };

    if (cuisine) query.cuisine = { $in: cuisine.split(',') };
    if (city) query['address.city'] = { $regex: city, $options: 'i' };
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

    const [kitchens, total] = await Promise.all([
        CloudKitchen.find(query)
            .populate('owner', 'name email phone')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .lean(),
        CloudKitchen.countDocuments(query),
    ]);

    ApiResponse.paginated(
        res,
        { kitchens },
        { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
        'Cloud kitchens retrieved successfully'
    );
});

/**
 * @desc    Get single cloud kitchen by ID
 * @route   GET /api/cloud-kitchens/:id
 * @access  Public
 */
const getCloudKitchen = catchAsync(async (req, res, next) => {
    const kitchen = await CloudKitchen.findById(req.params.id)
        .populate('owner', 'name email phone')
        .populate('menuItems');

    if (!kitchen) {
        return next(new AppError('Cloud kitchen not found', 404));
    }

    ApiResponse.success(res, { kitchen }, 'Cloud kitchen retrieved successfully');
});

/**
 * @desc    Get logged-in owner's cloud kitchen
 * @route   GET /api/cloud-kitchens/my/kitchen
 * @access  Private (cloudkitchen role)
 */
const getMyKitchen = catchAsync(async (req, res, next) => {
    const kitchen = await CloudKitchen.findOne({ owner: req.user._id })
        .populate('menuItems');

    if (!kitchen) {
        return next(new AppError('You have not registered a cloud kitchen yet.', 404));
    }

    ApiResponse.success(res, { kitchen }, 'Your cloud kitchen retrieved');
});

/**
 * @desc    Update cloud kitchen
 * @route   PUT /api/cloud-kitchens/:id
 * @access  Private (owner or admin)
 */
const updateCloudKitchen = catchAsync(async (req, res, next) => {
    let kitchen = await CloudKitchen.findById(req.params.id);

    if (!kitchen) {
        return next(new AppError('Cloud kitchen not found', 404));
    }

    if (kitchen.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new AppError('Not authorized to update this cloud kitchen', 403));
    }

    kitchen = await CloudKitchen.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    ApiResponse.success(res, { kitchen }, 'Cloud kitchen updated successfully');
});

/**
 * @desc    Delete cloud kitchen
 * @route   DELETE /api/cloud-kitchens/:id
 * @access  Private (owner or admin)
 */
const deleteCloudKitchen = catchAsync(async (req, res, next) => {
    const kitchen = await CloudKitchen.findById(req.params.id);

    if (!kitchen) {
        return next(new AppError('Cloud kitchen not found', 404));
    }

    if (kitchen.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new AppError('Not authorized to delete this cloud kitchen', 403));
    }

    await MenuItem.deleteMany({ cloudKitchen: kitchen._id });
    await CloudKitchen.findByIdAndDelete(req.params.id);

    ApiResponse.success(res, null, 'Cloud kitchen deleted successfully');
});

/**
 * @desc    Toggle cloud kitchen open/close
 * @route   PATCH /api/cloud-kitchens/:id/toggle-status
 * @access  Private (owner)
 */
const toggleKitchenStatus = catchAsync(async (req, res, next) => {
    const kitchen = await CloudKitchen.findById(req.params.id);

    if (!kitchen) {
        return next(new AppError('Cloud kitchen not found', 404));
    }

    if (kitchen.owner.toString() !== req.user._id.toString()) {
        return next(new AppError('Not authorized', 403));
    }

    kitchen.isOpen = !kitchen.isOpen;
    await kitchen.save();

    ApiResponse.success(
        res,
        { kitchen },
        `Cloud kitchen is now ${kitchen.isOpen ? 'open' : 'closed'}`
    );
});

module.exports = {
    createCloudKitchen,
    getAllCloudKitchens,
    getCloudKitchen,
    getMyKitchen,
    updateCloudKitchen,
    deleteCloudKitchen,
    toggleKitchenStatus,
};
