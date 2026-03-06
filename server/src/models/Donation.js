const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
    {
        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: [true, 'Donation must come from a restaurant'],
        },
        ngo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'NGO',
        },
        items: [
            {
                name: { type: String, required: true },
                quantity: { type: Number, required: true },
                unit: { type: String, default: 'servings' },
                description: { type: String },
            },
        ],
        status: {
            type: String,
            enum: ['available', 'requested', 'accepted', 'pickedUp', 'delivered', 'expired'],
            default: 'available',
        },
        totalServings: { type: Number, default: 0 },
        pickupAddress: {
            street: { type: String },
            city: { type: String },
            state: { type: String },
            zipCode: { type: String },
        },
        pickupTime: { type: Date },
        deliveryPartner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        notes: { type: String, maxlength: 300 },
        expiresAt: {
            type: Date,
            required: [true, 'Please provide expiry time for surplus food'],
        },
    },
    {
        timestamps: true,
    }
);

donationSchema.index({ status: 1, createdAt: -1 });
donationSchema.index({ restaurant: 1 });
donationSchema.index({ ngo: 1 });

const Donation = mongoose.model('Donation', donationSchema);

module.exports = Donation;
