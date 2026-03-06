const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide product name'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        description: {
            type: String,
            maxlength: [300, 'Description cannot exceed 300 characters'],
        },
        price: {
            type: Number,
            required: [true, 'Please provide product price'],
            min: [0, 'Price cannot be negative'],
        },
        discountedPrice: {
            type: Number,
            min: [0, 'Discounted price cannot be negative'],
        },
        category: {
            type: String,
            required: [true, 'Please provide product category'],
            enum: [
                'Fruits & Vegetables',
                'Dairy & Eggs',
                'Grains & Cereals',
                'Spices & Masalas',
                'Oils & Ghee',
                'Snacks & Beverages',
                'Personal Care',
                'Household',
                'Bakery',
                'Frozen Foods',
                'Dry Fruits & Nuts',
                'Pulses & Lentils',
                'Rice & Flour',
                'Condiments & Sauces',
                'Baby Care',
            ],
        },
        image: { type: String, default: '' },
        shop: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'GroceryShop',
            required: [true, 'Product must belong to a grocery shop'],
        },
        brand: { type: String, default: '' },
        stock: {
            type: Number,
            required: [true, 'Please provide stock quantity'],
            min: [0, 'Stock cannot be negative'],
        },
        unit: {
            type: String,
            required: [true, 'Please provide product unit'],
            enum: ['kg', 'g', 'ml', 'L', 'pcs', 'pack', 'dozen', 'bottle'],
        },
        weight: { type: String },
        isAvailable: { type: Boolean, default: true },
        isOrganic: { type: Boolean, default: false },
        tags: [{ type: String }],
        rating: { type: Number, default: 0, min: 0, max: 5 },
        totalOrders: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    }
);

productSchema.index({ shop: 1, category: 1 });
productSchema.index({ name: 'text', brand: 'text', tags: 'text' });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
