const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

/**
 * Protect routes - Verify JWT token from cookie or Authorization header
 */
const protect = catchAsync(async (req, res, next) => {
    let token;

    // Check for token in cookies first, then Authorization header
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('Not authorized. Please log in to access this resource.', 401));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
        return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // Check if user is active
    if (!user.isActive) {
        return next(new AppError('Your account has been deactivated. Please contact support.', 401));
    }

    // Grant access
    req.user = user;
    next();
});

/**
 * Authorize specific roles
 * @param  {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(`Role '${req.user.role}' is not authorized to access this resource.`, 403)
            );
        }
        next();
    };
};

module.exports = { protect, authorize };
