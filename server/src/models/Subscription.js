const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Subscription must belong to a user'],
        },
        plan: {
            type: String,
            enum: ['weekly', 'monthly', 'quarterly'],
            required: [true, 'Please select a subscription plan'],
        },
        planDetails: {
            name: { type: String },
            price: { type: Number, required: true },
            freeDeliveries: { type: Number, default: 0 },
            discount: { type: Number, default: 0 }, // percentage discount on orders
            description: { type: String },
        },
        status: {
            type: String,
            enum: ['active', 'expired', 'cancelled', 'pending'],
            default: 'pending',
        },
        startDate: { type: Date },
        endDate: { type: Date },
        autoRenew: { type: Boolean, default: true },
        paymentId: { type: String },
        paymentStatus: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: 'pending',
        },
        freeDeliveriesUsed: { type: Number, default: 0 },
        totalSavings: { type: Number, default: 0 },
        cancelledAt: { type: Date },
    },
    {
        timestamps: true,
    }
);

// Check if subscription is currently active
subscriptionSchema.methods.isCurrentlyActive = function () {
    return this.status === 'active' && this.endDate > new Date();
};

subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ endDate: 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
