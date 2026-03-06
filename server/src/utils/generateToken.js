const jwt = require('jsonwebtoken');

/**
 * Generate JWT token and set it as an httpOnly cookie.
 * @param {Object} user - The user document
 * @param {number} statusCode - HTTP status code
 * @param {Object} res - Express response object
 */
const generateToken = (user, statusCode, res) => {
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });

    const cookieOptions = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    };

    // Remove password from output
    const userData = user.toJSON ? user.toJSON() : { ...user._doc };
    delete userData.password;

    res.status(statusCode).cookie('token', token, cookieOptions).json({
        success: true,
        message: statusCode === 201 ? 'Registration successful' : 'Login successful',
        token,
        data: { user: userData },
    });
};

module.exports = generateToken;
