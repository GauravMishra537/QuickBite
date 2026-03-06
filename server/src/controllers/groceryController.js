const GroceryShop = require('../models/GroceryShop');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');

/**
 * @desc    Create a new grocery shop
 * @route   POST /api/grocery
 * @access  Private (grocery role)
 */
const createGroceryShop = catchAsync(async (req, res, next) => {
    const existing = await GroceryShop.findOne({ owner: req.user._id });
    if (existing) {
        return next(new AppError('You already have a grocery shop registered.', 400));
    }

    const shop = await GroceryShop.create({ ...req.body, owner: req.user._id });
    ApiResponse.created(res, { shop }, 'Grocery shop created successfully');
});

/**
 * @desc    Get all grocery shops (public, with filters & pagination)
 * @route   GET /api/grocery
 * @access  Public
 */
const getAllGroceryShops = catchAsync(async (req, res, next) => {
    const { page = 1, limit = 12, category, city, search, sortBy = 'rating' } = req.query;
    const query = { isActive: true };

    if (category) query.categories = { $in: category.split(',') };
    if (city) query['address.city'] = { $regex: city, $options: 'i' };
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { categories: { $regex: search, $options: 'i' } },
            { tags: { $regex: search, $options: 'i' } },
        ];
    }

    const sortOptions = { rating: { rating: -1 }, newest: { createdAt: -1 }, name: { name: 1 } };
    const sort = sortOptions[sortBy] || { rating: -1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [shops, total] = await Promise.all([
        GroceryShop.find(query).populate('owner', 'name email phone').sort(sort).skip(skip).limit(parseInt(limit)).lean(),
        GroceryShop.countDocuments(query),
    ]);

    ApiResponse.paginated(res, { shops }, { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) }, 'Grocery shops retrieved');
});

/**
 * @desc    Get single grocery shop by ID
 * @route   GET /api/grocery/:id
 * @access  Public
 */
const getGroceryShop = catchAsync(async (req, res, next) => {
    const shop = await GroceryShop.findById(req.params.id).populate('owner', 'name email phone').populate('products');
    if (!shop) return next(new AppError('Grocery shop not found', 404));
    ApiResponse.success(res, { shop }, 'Grocery shop retrieved');
});

/**
 * @desc    Get owner's grocery shop
 * @route   GET /api/grocery/my/shop
 * @access  Private (grocery role)
 */
const getMyShop = catchAsync(async (req, res, next) => {
    const shop = await GroceryShop.findOne({ owner: req.user._id }).populate('products');
    if (!shop) return next(new AppError('You have not registered a grocery shop yet.', 404));
    ApiResponse.success(res, { shop }, 'Your grocery shop retrieved');
});

/**
 * @desc    Update grocery shop
 * @route   PUT /api/grocery/:id
 * @access  Private (owner or admin)
 */
const updateGroceryShop = catchAsync(async (req, res, next) => {
    let shop = await GroceryShop.findById(req.params.id);
    if (!shop) return next(new AppError('Grocery shop not found', 404));
    if (shop.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new AppError('Not authorized to update this shop', 403));
    }
    shop = await GroceryShop.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    ApiResponse.success(res, { shop }, 'Grocery shop updated');
});

/**
 * @desc    Delete grocery shop
 * @route   DELETE /api/grocery/:id
 * @access  Private (owner or admin)
 */
const deleteGroceryShop = catchAsync(async (req, res, next) => {
    const shop = await GroceryShop.findById(req.params.id);
    if (!shop) return next(new AppError('Grocery shop not found', 404));
    if (shop.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new AppError('Not authorized', 403));
    }
    await Product.deleteMany({ shop: shop._id });
    await GroceryShop.findByIdAndDelete(req.params.id);
    ApiResponse.success(res, null, 'Grocery shop deleted');
});

// ===== PRODUCT CRUD =====

/**
 * @desc    Add product to shop
 * @route   POST /api/grocery/products
 * @access  Private (grocery role)
 */
const addProduct = catchAsync(async (req, res, next) => {
    const shop = await GroceryShop.findOne({ owner: req.user._id });
    if (!shop) return next(new AppError('You do not have a registered grocery shop', 404));

    const product = await Product.create({ ...req.body, shop: shop._id });
    ApiResponse.created(res, { product }, 'Product added successfully');
});

/**
 * @desc    Get products for a shop
 * @route   GET /api/grocery/:shopId/products
 * @access  Public
 */
const getShopProducts = catchAsync(async (req, res, next) => {
    const { category, search, sortBy = 'category', isOrganic } = req.query;
    const query = { shop: req.params.shopId, isAvailable: true };

    if (category) query.category = category;
    if (isOrganic !== undefined) query.isOrganic = isOrganic === 'true';
    if (search) query.name = { $regex: search, $options: 'i' };

    const sortOptions = { category: { category: 1, name: 1 }, price_asc: { price: 1 }, price_desc: { price: -1 }, popular: { totalOrders: -1 } };
    const sort = sortOptions[sortBy] || { category: 1 };

    const items = await Product.find(query).sort(sort).lean();
    const grouped = {};
    items.forEach((item) => {
        if (!grouped[item.category]) grouped[item.category] = [];
        grouped[item.category].push(item);
    });

    ApiResponse.success(res, { products: items, grouped }, 'Products retrieved');
});

/**
 * @desc    Update product
 * @route   PUT /api/grocery/products/:id
 * @access  Private (owner or admin)
 */
const updateProduct = catchAsync(async (req, res, next) => {
    let product = await Product.findById(req.params.id);
    if (!product) return next(new AppError('Product not found', 404));

    const shop = await GroceryShop.findById(product.shop);
    if (!shop || (shop.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin')) {
        return next(new AppError('Not authorized', 403));
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    ApiResponse.success(res, { product }, 'Product updated');
});

/**
 * @desc    Delete product
 * @route   DELETE /api/grocery/products/:id
 * @access  Private (owner or admin)
 */
const deleteProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new AppError('Product not found', 404));

    const shop = await GroceryShop.findById(product.shop);
    if (!shop || (shop.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin')) {
        return next(new AppError('Not authorized', 403));
    }

    await Product.findByIdAndDelete(req.params.id);
    ApiResponse.success(res, null, 'Product deleted');
});

module.exports = {
    createGroceryShop,
    getAllGroceryShops,
    getGroceryShop,
    getMyShop,
    updateGroceryShop,
    deleteGroceryShop,
    addProduct,
    getShopProducts,
    updateProduct,
    deleteProduct,
};
