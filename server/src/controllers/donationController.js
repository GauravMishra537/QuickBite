const NGO = require('../models/NGO');
const Donation = require('../models/Donation');
const Restaurant = require('../models/Restaurant');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');
const { emitToUser, notifyDeliveryPartners } = require('../config/socket');

// ===== NGO CRUD =====

/**
 * @desc    Register NGO
 * @route   POST /api/donations/ngo
 * @access  Private (ngo role)
 */
const registerNGO = catchAsync(async (req, res, next) => {
    const existing = await NGO.findOne({ owner: req.user._id });
    if (existing) return next(new AppError('You already have an NGO registered.', 400));

    const ngo = await NGO.create({ ...req.body, owner: req.user._id });
    ApiResponse.created(res, { ngo }, 'NGO registered successfully');
});

/**
 * @desc    Get all NGOs
 * @route   GET /api/donations/ngos
 * @access  Public
 */
const getAllNGOs = catchAsync(async (req, res, next) => {
    const { city, search } = req.query;
    const query = { isActive: true };
    if (city) query['address.city'] = { $regex: city, $options: 'i' };
    if (search) query.name = { $regex: search, $options: 'i' };

    const ngos = await NGO.find(query).populate('owner', 'name email phone').lean();
    ApiResponse.success(res, { ngos }, 'NGOs retrieved');
});

/**
 * @desc    Get my NGO profile
 * @route   GET /api/donations/ngo/my
 * @access  Private (ngo role)
 */
const getMyNGO = catchAsync(async (req, res, next) => {
    const ngo = await NGO.findOne({ owner: req.user._id });
    if (!ngo) return next(new AppError('You have not registered an NGO yet.', 404));
    ApiResponse.success(res, { ngo }, 'Your NGO profile retrieved');
});

/**
 * @desc    Update NGO
 * @route   PUT /api/donations/ngo/:id
 * @access  Private (ngo owner or admin)
 */
const updateNGO = catchAsync(async (req, res, next) => {
    let ngo = await NGO.findById(req.params.id);
    if (!ngo) return next(new AppError('NGO not found', 404));
    if (ngo.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new AppError('Not authorized', 403));
    }
    ngo = await NGO.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    ApiResponse.success(res, { ngo }, 'NGO updated');
});

// ===== DONATION WORKFLOW =====

/**
 * @desc    Create a surplus food donation (by restaurant)
 * @route   POST /api/donations
 * @access  Private (restaurant role)
 */
const createDonation = catchAsync(async (req, res, next) => {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return next(new AppError('You do not have a registered restaurant', 404));

    const donation = await Donation.create({
        ...req.body,
        restaurant: restaurant._id,
        pickupAddress: {
            street: restaurant.address.street,
            city: restaurant.address.city,
            state: restaurant.address.state,
            zipCode: restaurant.address.zipCode,
        },
    });

    ApiResponse.created(res, { donation }, 'Surplus food listed for donation');
});

/**
 * @desc    Get all available donations (for NGOs)
 * @route   GET /api/donations/available
 * @access  Public
 */
const getAvailableDonations = catchAsync(async (req, res, next) => {
    const donations = await Donation.find({ status: 'available', expiresAt: { $gt: new Date() } })
        .populate('restaurant', 'name address phone images')
        .sort({ createdAt: -1 })
        .lean();

    ApiResponse.success(res, { donations }, 'Available donations retrieved');
});

/**
 * @desc    Get donations by restaurant
 * @route   GET /api/donations/my-donations
 * @access  Private (restaurant role)
 */
const getMyDonations = catchAsync(async (req, res, next) => {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return next(new AppError('No restaurant found', 404));

    const donations = await Donation.find({ restaurant: restaurant._id })
        .populate('ngo', 'name contactPerson phone')
        .sort({ createdAt: -1 })
        .lean();

    ApiResponse.success(res, { donations }, 'Your donations retrieved');
});

/**
 * @desc    Request a donation (by NGO)
 * @route   PATCH /api/donations/:id/request
 * @access  Private (ngo role)
 */
const requestDonation = catchAsync(async (req, res, next) => {
    const ngo = await NGO.findOne({ owner: req.user._id });
    if (!ngo) return next(new AppError('You must register an NGO first', 404));

    const donation = await Donation.findById(req.params.id);
    if (!donation) return next(new AppError('Donation not found', 404));
    if (donation.status !== 'available') return next(new AppError('This donation is no longer available', 400));

    donation.ngo = ngo._id;
    donation.status = 'requested';
    if (req.body.deliveryAddress) {
        donation.deliveryAddress = req.body.deliveryAddress;
    }
    await donation.save();

    ApiResponse.success(res, { donation }, 'Donation requested successfully');
});

/**
 * @desc    Accept a donation request (by restaurant)
 * @route   PATCH /api/donations/:id/accept
 * @access  Private (restaurant role)
 */
const acceptDonation = catchAsync(async (req, res, next) => {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    const donation = await Donation.findById(req.params.id);
    if (!donation) return next(new AppError('Donation not found', 404));
    if (donation.restaurant.toString() !== restaurant._id.toString()) {
        return next(new AppError('Not authorized', 403));
    }
    if (donation.status !== 'requested') return next(new AppError('No pending request for this donation', 400));

    donation.status = 'accepted';
    await donation.save();

    ApiResponse.success(res, { donation }, 'Donation request accepted');
});

/**
 * @desc    Update donation status (pickedUp / delivered)
 * @route   PATCH /api/donations/:id/status
 * @access  Private (delivery / ngo / restaurant)
 */
const updateDonationStatus = catchAsync(async (req, res, next) => {
    const { status } = req.body;
    const validStatuses = ['preparing', 'readyForPickup', 'outForDelivery', 'delivered'];
    if (!validStatuses.includes(status)) return next(new AppError('Invalid status', 400));

    const donation = await Donation.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true, runValidators: true }
    ).populate('restaurant', 'name owner address phone')
     .populate('ngo', 'name owner');

    if (!donation) return next(new AppError('Donation not found', 404));

    // Update NGO donation count when delivered
    if (status === 'delivered' && donation.ngo) {
        await NGO.findByIdAndUpdate(donation.ngo._id, { $inc: { totalDonationsReceived: 1 } });
    }

    // ── Socket: Notify delivery partners when ready for pickup ──
    if (status === 'readyForPickup') {
        try {
            const deliveryFee = 35; // Restaurant pays delivery fee for surplus food
            notifyDeliveryPartners({
                orderId: donation._id,
                type: 'donation',
                businessName: donation.restaurant?.name || 'Restaurant',
                totalAmount: deliveryFee,
                items: donation.items,
                pickupAddress: donation.pickupAddress,
                deliveryAddress: donation.deliveryAddress,
                message: `🍲 Surplus food pickup from ${donation.restaurant?.name}! Earn ₹${deliveryFee}`,
            });
        } catch (e) { /* socket not ready */ }
    }

    // ── Socket: Notify NGO owner about status changes ──
    try {
        if (donation.ngo?.owner) {
            emitToUser(donation.ngo.owner.toString(), 'donationStatusChanged', {
                donationId: donation._id,
                status,
                restaurantName: donation.restaurant?.name,
                message: `Donation from ${donation.restaurant?.name} is now: ${status}`,
            });
        }
        // Notify restaurant owner
        if (donation.restaurant?.owner) {
            emitToUser(donation.restaurant.owner.toString(), 'donationStatusChanged', {
                donationId: donation._id,
                status,
                message: `Your donation status updated to: ${status}`,
            });
        }
    } catch (e) { /* socket not ready */ }

    ApiResponse.success(res, { donation }, `Donation status updated to ${status}`);
});

/**
 * @desc    Get NGO's received donations
 * @route   GET /api/donations/ngo/received
 * @access  Private (ngo role)
 */
const getNGODonations = catchAsync(async (req, res, next) => {
    const ngo = await NGO.findOne({ owner: req.user._id });
    if (!ngo) return next(new AppError('No NGO found', 404));

    const donations = await Donation.find({ ngo: ngo._id })
        .populate('restaurant', 'name address phone')
        .sort({ createdAt: -1 })
        .lean();

    ApiResponse.success(res, { donations }, 'NGO donations retrieved');
});

/**
 * @desc    Get single donation by ID
 * @route   GET /api/donations/:id
 * @access  Private
 */
const getDonationById = catchAsync(async (req, res, next) => {
    const donation = await Donation.findById(req.params.id)
        .populate('restaurant', 'name address phone location images')
        .populate('ngo', 'name address phone contactPerson')
        .lean();
    if (!donation) return next(new AppError('Donation not found', 404));
    ApiResponse.success(res, { donation }, 'Donation retrieved');
});

module.exports = {
    registerNGO,
    getAllNGOs,
    getMyNGO,
    updateNGO,
    createDonation,
    getAvailableDonations,
    getMyDonations,
    requestDonation,
    acceptDonation,
    updateDonationStatus,
    getNGODonations,
    getDonationById,
};
