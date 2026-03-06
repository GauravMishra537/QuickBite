const mongoose = require('mongoose');

const ngoSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'NGO must belong to a registered user'],
        },
        name: {
            type: String,
            required: [true, 'Please provide NGO name'],
            trim: true,
            maxlength: [150, 'Name cannot exceed 150 characters'],
        },
        description: {
            type: String,
            required: [true, 'Please provide NGO description'],
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        registrationNumber: {
            type: String,
            required: [true, 'Please provide NGO registration number'],
            unique: true,
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
        contactPerson: {
            type: String,
            required: [true, 'Please provide contact person name'],
        },
        phone: {
            type: String,
            required: [true, 'Please provide contact phone number'],
        },
        email: { type: String },
        website: { type: String },
        logo: { type: String, default: '' },
        areasServed: [{ type: String }],
        totalDonationsReceived: { type: Number, default: 0 },
        isVerified: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        tags: [{ type: String }],
    },
    {
        timestamps: true,
    }
);

ngoSchema.index({ location: '2dsphere' });
ngoSchema.index({ name: 'text', areasServed: 'text' });

const NGO = mongoose.model('NGO', ngoSchema);

module.exports = NGO;
