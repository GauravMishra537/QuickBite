const mongoose = require('mongoose');

const cloudKitchenSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Cloud kitchen must belong to an owner'],
        },
        name: {
            type: String,
            required: [true, 'Please provide cloud kitchen name'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        description: {
            type: String,
            required: [true, 'Please provide cloud kitchen description'],
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
        operatingHours: {
            open: { type: String, default: '08:00' },
            close: { type: String, default: '00:00' },
        },
        deliveryTime: {
            min: { type: Number, default: 20 },
            max: { type: Number, default: 40 },
        },
        deliveryFee: { type: Number, default: 25 },
        minOrderAmount: { type: Number, default: 99 },
        isFeatured: { type: Boolean, default: false },
        isVerified: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        tags: [{ type: String }],
        specialities: [{ type: String }],
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

cloudKitchenSchema.index({ location: '2dsphere' });
cloudKitchenSchema.index({ name: 'text', cuisine: 'text', tags: 'text' });

// Virtual populate menu items
cloudKitchenSchema.virtual('menuItems', {
    ref: 'MenuItem',
    foreignField: 'cloudKitchen',
    localField: '_id',
});

const CloudKitchen = mongoose.model('CloudKitchen', cloudKitchenSchema);

module.exports = CloudKitchen;
