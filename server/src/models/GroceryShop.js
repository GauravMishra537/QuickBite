const mongoose = require('mongoose');

const groceryShopSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Grocery shop must belong to an owner'],
        },
        name: {
            type: String,
            required: [true, 'Please provide shop name'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        description: {
            type: String,
            required: [true, 'Please provide shop description'],
            maxlength: [500, 'Description cannot exceed 500 characters'],
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
            open: { type: String, default: '07:00' },
            close: { type: String, default: '22:00' },
        },
        deliveryTime: {
            min: { type: Number, default: 20 },
            max: { type: Number, default: 45 },
        },
        deliveryFee: { type: Number, default: 25 },
        minOrderAmount: { type: Number, default: 99 },
        categories: {
            type: [String],
            required: [true, 'Please provide at least one product category'],
        },
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

groceryShopSchema.index({ location: '2dsphere' });
groceryShopSchema.index({ name: 'text', categories: 'text', tags: 'text' });

groceryShopSchema.virtual('products', {
    ref: 'Product',
    foreignField: 'shop',
    localField: '_id',
});

const GroceryShop = mongoose.model('GroceryShop', groceryShopSchema);

module.exports = GroceryShop;
