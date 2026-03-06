const mongoose = require('mongoose');

const deliveryPartnerSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Delivery partner must be linked to a user account'],
            unique: true,
        },
        vehicleType: {
            type: String,
            enum: ['bicycle', 'motorcycle', 'scooter', 'car', 'van'],
            required: [true, 'Please specify vehicle type'],
        },
        vehicleNumber: {
            type: String,
            required: [true, 'Please provide vehicle number'],
            trim: true,
        },
        licenseNumber: {
            type: String,
            trim: true,
        },
        currentLocation: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], default: [0, 0] },
        },
        isAvailable: { type: Boolean, default: true },
        isOnDelivery: { type: Boolean, default: false },
        currentOrder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
        },
        totalDeliveries: { type: Number, default: 0 },
        totalEarnings: { type: Number, default: 0 },
        rating: { type: Number, default: 0, min: 0, max: 5 },
        totalRatings: { type: Number, default: 0 },
        isVerified: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        bankDetails: {
            accountNumber: { type: String },
            ifscCode: { type: String },
            bankName: { type: String },
        },
    },
    {
        timestamps: true,
    }
);

deliveryPartnerSchema.index({ currentLocation: '2dsphere' });
deliveryPartnerSchema.index({ isAvailable: 1, isActive: 1 });

const DeliveryPartner = mongoose.model('DeliveryPartner', deliveryPartnerSchema);

module.exports = DeliveryPartner;
