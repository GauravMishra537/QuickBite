const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide item name'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        description: {
            type: String,
            maxlength: [300, 'Description cannot exceed 300 characters'],
        },
        price: {
            type: Number,
            required: [true, 'Please provide item price'],
            min: [0, 'Price cannot be negative'],
        },
        discountedPrice: {
            type: Number,
            min: [0, 'Discounted price cannot be negative'],
        },
        category: {
            type: String,
            required: [true, 'Please provide item category'],
            enum: [
                'Starters',
                'Main Course',
                'Breads',
                'Rice & Biryani',
                'Desserts',
                'Beverages',
                'Thali',
                'Street Food',
                'Chinese',
                'South Indian',
                'Salads',
                'Soups',
                'Combos',
                'Snacks',
                'Pizza',
            ],
        },
        image: { type: String, default: '' },
        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
        },
        cloudKitchen: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CloudKitchen',
        },
        isVeg: { type: Boolean, default: true },
        isAvailable: { type: Boolean, default: true },
        preparationTime: { type: Number, default: 15 },
        spiceLevel: {
            type: String,
            enum: ['Mild', 'Medium', 'Spicy', 'Extra Spicy'],
            default: 'Medium',
        },
        tags: [{ type: String }],
        nutritionalInfo: {
            calories: { type: Number },
            protein: { type: String },
            carbs: { type: String },
            fat: { type: String },
        },
        rating: { type: Number, default: 0, min: 0, max: 5 },
        totalOrders: { type: Number, default: 0 },
        isBestseller: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

// Ensure an item belongs to either a restaurant or cloud kitchen
menuItemSchema.pre('validate', function (next) {
    if (!this.restaurant && !this.cloudKitchen) {
        next(new Error('Menu item must belong to a restaurant or cloud kitchen'));
    } else if (this.restaurant && this.cloudKitchen) {
        next(new Error('Menu item cannot belong to both a restaurant and cloud kitchen'));
    } else {
        next();
    }
});

menuItemSchema.index({ restaurant: 1, category: 1 });
menuItemSchema.index({ cloudKitchen: 1, category: 1 });
menuItemSchema.index({ name: 'text', tags: 'text' });

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = MenuItem;
