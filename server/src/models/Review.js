const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to a user'],
        },
        entityType: {
            type: String,
            required: true,
            enum: ['Restaurant', 'CloudKitchen', 'GroceryShop'],
        },
        entity: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'entityType',
        },
        rating: {
            type: Number,
            required: [true, 'Please provide a rating'],
            min: [1, 'Rating must be at least 1'],
            max: [5, 'Rating cannot exceed 5'],
        },
        comment: {
            type: String,
            trim: true,
            maxlength: [500, 'Comment cannot exceed 500 characters'],
        },
    },
    { timestamps: true }
);

// One review per user per entity
reviewSchema.index({ user: 1, entity: 1 }, { unique: true });
reviewSchema.index({ entity: 1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
