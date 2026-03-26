const Review = require('../models/Review');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const ApiResponse = require('../utils/apiResponse');

/** @desc Create review  @route POST /api/reviews  @access Private */
const createReview = catchAsync(async (req, res, next) => {
    const { entityType, entity, rating, comment } = req.body;
    if (!entityType || !entity || !rating) {
        return next(new AppError('entityType, entity, and rating are required', 400));
    }

    // Upsert: update if exists, create if not
    const review = await Review.findOneAndUpdate(
        { user: req.user._id, entity },
        { user: req.user._id, entityType, entity, rating, comment },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    ApiResponse.success(res, { review }, 'Review saved');
});

/** @desc Get reviews for entity  @route GET /api/reviews/:entityId  @access Public */
const getEntityReviews = catchAsync(async (req, res) => {
    const reviews = await Review.find({ entity: req.params.entityId })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .lean();

    const avg = reviews.length
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    ApiResponse.success(res, { reviews, averageRating: Number(avg), count: reviews.length }, 'Reviews retrieved');
});

/** @desc Delete review  @route DELETE /api/reviews/:id  @access Private (owner or admin) */
const deleteReview = catchAsync(async (req, res, next) => {
    const review = await Review.findById(req.params.id);
    if (!review) return next(new AppError('Review not found', 404));
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new AppError('Not authorized', 403));
    }
    await Review.findByIdAndDelete(req.params.id);
    ApiResponse.success(res, null, 'Review deleted');
});

module.exports = { createReview, getEntityReviews, deleteReview };
