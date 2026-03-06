const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const TableBooking = require('../models/TableBooking');
const Subscription = require('../models/Subscription');
const connectDB = require('../config/db');

dotenv.config();

const seedBookingsAndSubscriptions = async () => {
    try {
        await connectDB();

        await TableBooking.deleteMany({});
        await Subscription.deleteMany({});
        console.log('🗑️  Cleared existing bookings and subscriptions');

        const customers = await User.find({ role: 'customer' });
        const restaurants = await Restaurant.find();

        if (customers.length < 3 || restaurants.length < 2) {
            console.error('❌ Need seeded users and restaurants first.');
            process.exit(1);
        }

        // =============================
        // TABLE BOOKINGS (8)
        // =============================
        const now = new Date();
        const futureDate = (daysAhead) => { const d = new Date(now); d.setDate(d.getDate() + daysAhead); d.setHours(0, 0, 0, 0); return d; };
        const pastDate = (daysAgo) => { const d = new Date(now); d.setDate(d.getDate() - daysAgo); d.setHours(0, 0, 0, 0); return d; };

        const bookings = await TableBooking.create([
            {
                user: customers[0]._id,
                restaurant: restaurants[0]._id,
                tableNumber: 5,
                date: futureDate(2),
                timeSlot: { from: '19:00', to: '21:00' },
                guests: 4,
                status: 'confirmed',
                paymentStatus: 'completed',
                bookingAmount: 199,
                specialRequests: 'Window seat preferred, celebrating anniversary',
            },
            {
                user: customers[1]._id,
                restaurant: restaurants[2]._id,
                tableNumber: 3,
                date: futureDate(3),
                timeSlot: { from: '12:30', to: '14:00' },
                guests: 2,
                status: 'pending',
                paymentStatus: 'pending',
                bookingAmount: 199,
                specialRequests: 'Vegetarian thali setup please',
            },
            {
                user: customers[2]._id,
                restaurant: restaurants[3]._id,
                tableNumber: 4,
                date: futureDate(1),
                timeSlot: { from: '20:00', to: '22:00' },
                guests: 6,
                status: 'confirmed',
                paymentStatus: 'completed',
                bookingAmount: 199,
                specialRequests: 'Birthday celebration, please arrange cake cutting',
            },
            {
                user: customers[3]._id,
                restaurant: restaurants[0]._id,
                tableNumber: 6,
                date: futureDate(5),
                timeSlot: { from: '19:30', to: '21:30' },
                guests: 8,
                status: 'confirmed',
                paymentStatus: 'completed',
                bookingAmount: 199,
                specialRequests: 'Private dining area for family dinner',
            },
            {
                user: customers[4]._id,
                restaurant: restaurants[5] ? restaurants[5]._id : restaurants[0]._id,
                tableNumber: 2,
                date: futureDate(4),
                timeSlot: { from: '13:00', to: '14:30' },
                guests: 2,
                status: 'pending',
                paymentStatus: 'pending',
                bookingAmount: 199,
            },
            // Past bookings
            {
                user: customers[0]._id,
                restaurant: restaurants[2]._id,
                tableNumber: 1,
                date: pastDate(3),
                timeSlot: { from: '19:00', to: '20:30' },
                guests: 2,
                status: 'completed',
                paymentStatus: 'completed',
                bookingAmount: 199,
            },
            {
                user: customers[1]._id,
                restaurant: restaurants[3]._id,
                tableNumber: 2,
                date: pastDate(5),
                timeSlot: { from: '20:00', to: '21:30' },
                guests: 4,
                status: 'completed',
                paymentStatus: 'completed',
                bookingAmount: 199,
            },
            {
                user: customers[2]._id,
                restaurant: restaurants[0]._id,
                tableNumber: 3,
                date: pastDate(1),
                timeSlot: { from: '13:00', to: '14:30' },
                guests: 3,
                status: 'cancelled',
                paymentStatus: 'refunded',
                bookingAmount: 199,
                cancelledAt: pastDate(2),
                cancelReason: 'Plans changed due to weather',
            },
        ]);

        console.log(`✅ ${bookings.length} table bookings seeded`);

        // =============================
        // SUBSCRIPTIONS (6)
        // =============================
        const subStartDate = (daysAgo) => { const d = new Date(now); d.setDate(d.getDate() - daysAgo); return d; };
        const subEndDate = (start, plan) => {
            const d = new Date(start);
            if (plan === 'weekly') d.setDate(d.getDate() + 7);
            else if (plan === 'monthly') d.setMonth(d.getMonth() + 1);
            else if (plan === 'quarterly') d.setMonth(d.getMonth() + 3);
            return d;
        };

        const subscriptions = await Subscription.create([
            // Active subscriptions
            {
                user: customers[0]._id,
                plan: 'monthly',
                planDetails: { name: 'QuickBite Monthly', price: 399, freeDeliveries: 30, discount: 10, description: '30 free deliveries + 10% off on all orders for 1 month' },
                status: 'active',
                startDate: subStartDate(10),
                endDate: subEndDate(subStartDate(10), 'monthly'),
                paymentStatus: 'completed',
                paymentId: 'pi_simulated_001',
                freeDeliveriesUsed: 8,
                totalSavings: 320,
                autoRenew: true,
            },
            {
                user: customers[1]._id,
                plan: 'quarterly',
                planDetails: { name: 'QuickBite Quarterly', price: 999, freeDeliveries: 90, discount: 15, description: '90 free deliveries + 15% off on all orders for 3 months' },
                status: 'active',
                startDate: subStartDate(30),
                endDate: subEndDate(subStartDate(30), 'quarterly'),
                paymentStatus: 'completed',
                paymentId: 'pi_simulated_002',
                freeDeliveriesUsed: 22,
                totalSavings: 1540,
                autoRenew: true,
            },
            {
                user: customers[2]._id,
                plan: 'weekly',
                planDetails: { name: 'QuickBite Weekly', price: 149, freeDeliveries: 7, discount: 5, description: '7 free deliveries + 5% off on all orders for 1 week' },
                status: 'active',
                startDate: subStartDate(3),
                endDate: subEndDate(subStartDate(3), 'weekly'),
                paymentStatus: 'completed',
                paymentId: 'pi_simulated_003',
                freeDeliveriesUsed: 3,
                totalSavings: 90,
                autoRenew: false,
            },
            // Expired subscription
            {
                user: customers[3]._id,
                plan: 'weekly',
                planDetails: { name: 'QuickBite Weekly', price: 149, freeDeliveries: 7, discount: 5, description: '7 free deliveries + 5% off on all orders for 1 week' },
                status: 'expired',
                startDate: subStartDate(14),
                endDate: subStartDate(7),
                paymentStatus: 'completed',
                paymentId: 'pi_simulated_004',
                freeDeliveriesUsed: 7,
                totalSavings: 210,
            },
            // Cancelled subscription
            {
                user: customers[4]._id,
                plan: 'monthly',
                planDetails: { name: 'QuickBite Monthly', price: 399, freeDeliveries: 30, discount: 10, description: '30 free deliveries + 10% off on all orders for 1 month' },
                status: 'cancelled',
                startDate: subStartDate(20),
                endDate: subEndDate(subStartDate(20), 'monthly'),
                paymentStatus: 'completed',
                paymentId: 'pi_simulated_005',
                freeDeliveriesUsed: 12,
                totalSavings: 360,
                cancelledAt: subStartDate(5),
            },
            // Pending subscription (awaiting payment)
            {
                user: customers[4]._id,
                plan: 'quarterly',
                planDetails: { name: 'QuickBite Quarterly', price: 999, freeDeliveries: 90, discount: 15, description: '90 free deliveries + 15% off on all orders for 3 months' },
                status: 'pending',
                paymentStatus: 'pending',
            },
        ]);

        console.log(`✅ ${subscriptions.length} subscriptions seeded`);

        // Summary
        console.log('\n📊 Seeding Summary:');
        console.log(`   Table Bookings: ${bookings.length}`);
        console.log(`   Subscriptions: ${subscriptions.length}`);
        console.log('\n🍽️  Bookings by status:');
        const bStatus = {};
        bookings.forEach((b) => { bStatus[b.status] = (bStatus[b.status] || 0) + 1; });
        Object.entries(bStatus).forEach(([s, c]) => console.log(`   • ${s}: ${c}`));
        console.log('\n💎 Subscriptions by status:');
        const sStatus = {};
        subscriptions.forEach((s) => { sStatus[s.status] = (sStatus[s.status] || 0) + 1; });
        Object.entries(sStatus).forEach(([s, c]) => console.log(`   • ${s}: ${c}`));

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    }
};

seedBookingsAndSubscriptions();
