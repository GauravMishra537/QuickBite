const mongoose = require('mongoose');

const tableBookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Booking must belong to a user'],
        },
        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: [true, 'Booking must be for a restaurant'],
        },
        tableNumber: {
            type: Number,
            required: [true, 'Please specify table number'],
        },
        date: {
            type: Date,
            required: [true, 'Please provide booking date'],
        },
        timeSlot: {
            from: { type: String, required: true },
            to: { type: String, required: true },
        },
        guests: {
            type: Number,
            required: [true, 'Please specify number of guests'],
            min: [1, 'At least 1 guest required'],
            max: [20, 'Maximum 20 guests allowed'],
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'cancelled', 'completed', 'noShow'],
            default: 'pending',
        },
        specialRequests: { type: String, maxlength: 300 },
        paymentStatus: {
            type: String,
            enum: ['pending', 'completed', 'refunded'],
            default: 'pending',
        },
        paymentId: { type: String },
        bookingAmount: { type: Number, default: 0 },
        cancelledAt: { type: Date },
        cancelReason: { type: String },
    },
    {
        timestamps: true,
    }
);

tableBookingSchema.index({ restaurant: 1, date: 1, tableNumber: 1 });
tableBookingSchema.index({ user: 1, createdAt: -1 });

const TableBooking = mongoose.model('TableBooking', tableBookingSchema);

module.exports = TableBooking;
