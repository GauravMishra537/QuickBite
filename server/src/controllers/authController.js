const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const generateToken = require('../utils/generateToken');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = catchAsync(async (req, res, next) => {
    const { name, email, password, phone, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new AppError('An account with this email already exists.', 400));
    }

    // Prevent public registration as admin
    const allowedRoles = ['customer', 'restaurant', 'cloudkitchen', 'grocery', 'ngo', 'delivery'];
    if (role && !allowedRoles.includes(role)) {
        return next(new AppError('Invalid role specified.', 400));
    }

    const user = await User.create({
        name,
        email,
        password,
        phone,
        role: role || 'customer',
    });

    generateToken(user, 201, res);
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please provide email and password.', 400));
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        return next(new AppError('Invalid email or password.', 401));
    }

    // Check if account is active
    if (!user.isActive) {
        return next(new AppError('Your account has been deactivated. Please contact support.', 401));
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return next(new AppError('Invalid email or password.', 401));
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    generateToken(user, 200, res);
});

/**
 * @desc    Logout user (clear cookie)
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = catchAsync(async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 5 * 1000), // 5 seconds
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: 'Logged out successfully',
        data: null,
    });
});

/**
 * @desc    Get current logged-in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user._id);

    res.status(200).json({
        success: true,
        message: 'User profile retrieved',
        data: { user },
    });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/update-profile
 * @access  Private
 */
const updateProfile = catchAsync(async (req, res, next) => {
    const allowedFields = ['name', 'phone', 'avatar'];
    const updates = {};

    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: { user },
    });
});

/**
 * @desc    Update password
 * @route   PUT /api/auth/update-password
 * @access  Private
 */
const updatePassword = catchAsync(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return next(new AppError('Please provide current and new password.', 400));
    }

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        return next(new AppError('Current password is incorrect.', 401));
    }

    user.password = newPassword;
    await user.save();

    generateToken(user, 200, res);
});

/**
 * @desc    Add or update address
 * @route   POST /api/auth/address
 * @access  Private
 */
const addAddress = catchAsync(async (req, res, next) => {
    const { label, street, city, state, zipCode, country, isDefault } = req.body;

    const user = await User.findById(req.user._id);

    // If new address is default, unset all other defaults
    if (isDefault) {
        user.addresses.forEach((addr) => {
            addr.isDefault = false;
        });
    }

    user.addresses.push({ label, street, city, state, zipCode, country, isDefault });
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: 'Address added successfully',
        data: { addresses: user.addresses },
    });
});

/**
 * @desc    Delete an address
 * @route   DELETE /api/auth/address/:addressId
 * @access  Private
 */
const deleteAddress = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user._id);

    user.addresses = user.addresses.filter(
        (addr) => addr._id.toString() !== req.params.addressId
    );
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: 'Address deleted successfully',
        data: { addresses: user.addresses },
    });
});

module.exports = {
    register,
    login,
    logout,
    getMe,
    updateProfile,
    updatePassword,
    addAddress,
    deleteAddress,
};
