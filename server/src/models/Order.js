const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Order must belong to a user'],
        },
        orderType: {
            type: String,
            enum: ['food', 'grocery'],
            required: [true, 'Please specify order type'],
        },
        items: [
            {
                item: { type: mongoose.Schema.Types.ObjectId, refPath: 'items.itemModel' },
                itemModel: { type: String, enum: ['MenuItem', 'Product'] },
                name: { type: String, required: true },
                price: { type: Number, required: true },
                quantity: { type: Number, required: true, min: 1 },
                image: { type: String },
            },
        ],
        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
        },
        cloudKitchen: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CloudKitchen',
        },
        groceryShop: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'GroceryShop',
        },
        itemsTotal: { type: Number, required: true },
        deliveryFee: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        totalAmount: { type: Number, required: true },
        deliveryAddress: {
            label: { type: String },
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            zipCode: { type: String, required: true },
            country: { type: String, default: 'India' },
        },
        status: {
            type: String,
            enum: ['placed', 'confirmed', 'preparing', 'ready', 'pickedUp', 'outForDelivery', 'delivered', 'cancelled'],
            default: 'placed',
        },
        paymentMethod: {
            type: String,
            enum: ['stripe', 'cod'],
            required: [true, 'Please specify payment method'],
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: 'pending',
        },
        deliveryPartner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        estimatedDelivery: { type: Date },
        deliveredAt: { type: Date },
        cancelledAt: { type: Date },
        cancelReason: { type: String },
        notes: { type: String, maxlength: 300 },
        statusHistory: [
            {
                status: { type: String },
                timestamp: { type: Date, default: Date.now },
                note: { type: String },
            },
        ],
    },
    {
        timestamps: true,
    }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ restaurant: 1, status: 1 });
orderSchema.index({ cloudKitchen: 1, status: 1 });
orderSchema.index({ groceryShop: 1, status: 1 });
orderSchema.index({ deliveryPartner: 1, status: 1 });
orderSchema.index({ status: 1, createdAt: -1 });

// Auto-push status changes to history
orderSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        this.statusHistory.push({ status: this.status, timestamp: new Date() });
    }
    next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
