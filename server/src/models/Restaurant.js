const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Restaurant must belong to an owner'],
        },
        name: {
            type: String,
            required: [true, 'Please provide restaurant name'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        description: {
            type: String,
            required: [true, 'Please provide restaurant description'],
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        cuisine: {
            type: [String],
            required: [true, 'Please provide at least one cuisine type'],
        },
        address: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            zipCode: { type: String, required: true },
            country: { type: String, default: 'India' },
        },
        location: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], default: [0, 0] },
        },
        images: [{ type: String }],
        logo: { type: String, default: '' },
        phone: { type: String },
        email: { type: String },
        rating: { type: Number, default: 0, min: 0, max: 5 },
        totalReviews: { type: Number, default: 0 },
        isOpen: { type: Boolean, default: true },
        openingHours: {
            open: { type: String, default: '09:00' },
            close: { type: String, default: '23:00' },
        },
        deliveryTime: {
            min: { type: Number, default: 25 },
            max: { type: Number, default: 45 },
        },
        deliveryFee: { type: Number, default: 30 },
        minOrderAmount: { type: Number, default: 99 },
        tables: [
            {
                tableNumber: { type: Number },
                capacity: { type: Number },
                isAvailable: { type: Boolean, default: true },
                location: { type: String, enum: ['indoor', 'outdoor', 'rooftop', 'private'], default: 'indoor' },
            },
        ],
        isFeatured: { type: Boolean, default: false },
        isVerified: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        tags: [{ type: String }],
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Index for geospatial queries
restaurantSchema.index({ location: '2dsphere' });
restaurantSchema.index({ name: 'text', cuisine: 'text', tags: 'text' });

// Virtual populate menu items
restaurantSchema.virtual('menuItems', {
    ref: 'MenuItem',
    foreignField: 'restaurant',
    localField: '_id',
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
