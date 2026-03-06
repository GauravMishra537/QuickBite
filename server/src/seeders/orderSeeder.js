const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const CloudKitchen = require('../models/CloudKitchen');
const GroceryShop = require('../models/GroceryShop');
const MenuItem = require('../models/MenuItem');
const Product = require('../models/Product');
const Order = require('../models/Order');
const DeliveryPartner = require('../models/DeliveryPartner');
const connectDB = require('../config/db');

dotenv.config();

const seedOrdersAndDelivery = async () => {
    try {
        await connectDB();

        await Order.deleteMany({});
        await DeliveryPartner.deleteMany({});
        console.log('🗑️  Cleared existing orders and delivery partners');

        const customers = await User.find({ role: 'customer' });
        const deliveryUsers = await User.find({ role: 'delivery' });
        const restaurants = await Restaurant.find();
        const kitchens = await CloudKitchen.find();
        const groceryShops = await GroceryShop.find();

        // Get some menu items and products for order items
        const menuItems = await MenuItem.find().limit(20).lean();
        const products = await Product.find().limit(10).lean();

        if (customers.length < 2 || deliveryUsers.length < 2 || restaurants.length < 2) {
            console.error('❌ Need seeded users, restaurants first. Run userSeeder & restaurantSeeder.');
            process.exit(1);
        }

        // =============================
        // DELIVERY PARTNERS (2)
        // =============================
        const partners = await DeliveryPartner.create([
            {
                user: deliveryUsers[0]._id,
                vehicleType: 'motorcycle',
                vehicleNumber: 'DL 05 AB 1234',
                licenseNumber: 'DL-0520190012345',
                currentLocation: { type: 'Point', coordinates: [77.2295, 28.6129] },
                isAvailable: true,
                isOnDelivery: false,
                totalDeliveries: 145,
                totalEarnings: 7250,
                rating: 4.6,
                totalRatings: 120,
                isVerified: true,
                bankDetails: { accountNumber: '1234567890', ifscCode: 'SBIN0001234', bankName: 'State Bank of India' },
            },
            {
                user: deliveryUsers[1]._id,
                vehicleType: 'scooter',
                vehicleNumber: 'KA 03 CD 5678',
                licenseNumber: 'KA-0320200067890',
                currentLocation: { type: 'Point', coordinates: [77.6408, 12.9784] },
                isAvailable: true,
                isOnDelivery: false,
                totalDeliveries: 89,
                totalEarnings: 4450,
                rating: 4.4,
                totalRatings: 76,
                isVerified: true,
                bankDetails: { accountNumber: '0987654321', ifscCode: 'ICIC0001234', bankName: 'ICICI Bank' },
            },
        ]);

        console.log(`✅ ${partners.length} delivery partners seeded`);

        // =============================
        // ORDERS (15 — mix of food & grocery, various statuses)
        // =============================
        const now = new Date();
        const pastDate = (daysAgo, hoursAgo = 0) => new Date(now.getTime() - (daysAgo * 24 + hoursAgo) * 60 * 60 * 1000);

        const ordersData = [
            // --- Delivered orders (with delivery partner) ---
            {
                user: customers[0]._id,
                orderType: 'food',
                items: [
                    { name: 'Butter Chicken', price: 349, quantity: 1, itemModel: 'MenuItem' },
                    { name: 'Garlic Naan', price: 59, quantity: 3, itemModel: 'MenuItem' },
                    { name: 'Dal Makhani', price: 249, quantity: 1, itemModel: 'MenuItem' },
                ],
                restaurant: restaurants[0]._id,
                itemsTotal: 775,
                deliveryFee: 40,
                tax: 39,
                totalAmount: 854,
                deliveryAddress: { label: 'Home', street: '42, Sector 15, Vasant Kunj', city: 'New Delhi', state: 'Delhi', zipCode: '110070' },
                status: 'delivered',
                paymentMethod: 'stripe',
                paymentStatus: 'completed',
                deliveryPartner: deliveryUsers[0]._id,
                estimatedDelivery: pastDate(2, 1),
                deliveredAt: pastDate(2),
                createdAt: pastDate(2, 2),
                statusHistory: [
                    { status: 'placed', timestamp: pastDate(2, 2) },
                    { status: 'confirmed', timestamp: pastDate(2, 1.8) },
                    { status: 'preparing', timestamp: pastDate(2, 1.5) },
                    { status: 'ready', timestamp: pastDate(2, 1) },
                    { status: 'outForDelivery', timestamp: pastDate(2, 0.5) },
                    { status: 'delivered', timestamp: pastDate(2) },
                ],
            },
            {
                user: customers[1]._id,
                orderType: 'food',
                items: [
                    { name: 'Masala Dosa', price: 149, quantity: 2, itemModel: 'MenuItem' },
                    { name: 'Filter Coffee', price: 59, quantity: 2, itemModel: 'MenuItem' },
                    { name: 'South Indian Thali', price: 249, quantity: 1, itemModel: 'MenuItem' },
                ],
                restaurant: restaurants[2]._id,
                itemsTotal: 665,
                deliveryFee: 25,
                tax: 33,
                totalAmount: 723,
                deliveryAddress: { label: 'Home', street: '15, Koramangala 4th Block', city: 'Bengaluru', state: 'Karnataka', zipCode: '560034' },
                status: 'delivered',
                paymentMethod: 'cod',
                paymentStatus: 'completed',
                deliveryPartner: deliveryUsers[1]._id,
                estimatedDelivery: pastDate(1, 1),
                deliveredAt: pastDate(1),
                createdAt: pastDate(1, 2),
                statusHistory: [
                    { status: 'placed', timestamp: pastDate(1, 2) },
                    { status: 'confirmed', timestamp: pastDate(1, 1.8) },
                    { status: 'preparing', timestamp: pastDate(1, 1.5) },
                    { status: 'ready', timestamp: pastDate(1, 1) },
                    { status: 'outForDelivery', timestamp: pastDate(1, 0.5) },
                    { status: 'delivered', timestamp: pastDate(1) },
                ],
            },
            {
                user: customers[2]._id,
                orderType: 'food',
                items: [
                    { name: 'Hyderabadi Chicken Dum Biryani', price: 349, quantity: 2, itemModel: 'MenuItem' },
                    { name: 'Raita', price: 69, quantity: 2, itemModel: 'MenuItem' },
                    { name: 'Irani Chai', price: 49, quantity: 2, itemModel: 'MenuItem' },
                ],
                restaurant: restaurants[3]._id,
                itemsTotal: 934,
                deliveryFee: 30,
                tax: 47,
                totalAmount: 1011,
                deliveryAddress: { label: 'Home', street: '78, Bandra West, Hill Road', city: 'Mumbai', state: 'Maharashtra', zipCode: '400050' },
                status: 'delivered',
                paymentMethod: 'stripe',
                paymentStatus: 'completed',
                deliveryPartner: deliveryUsers[0]._id,
                estimatedDelivery: pastDate(3, 1),
                deliveredAt: pastDate(3),
                createdAt: pastDate(3, 2),
                statusHistory: [
                    { status: 'placed', timestamp: pastDate(3, 2) },
                    { status: 'delivered', timestamp: pastDate(3) },
                ],
            },
            // --- Grocery delivered orders ---
            {
                user: customers[0]._id,
                orderType: 'grocery',
                items: [
                    { name: 'Amul Toned Milk', price: 28, quantity: 4, itemModel: 'Product' },
                    { name: 'Brown Eggs (6 pcs)', price: 65, quantity: 2, itemModel: 'Product' },
                    { name: 'Aashirvaad Atta (5kg)', price: 280, quantity: 1, itemModel: 'Product' },
                    { name: 'MDH Garam Masala (100g)', price: 78, quantity: 1, itemModel: 'Product' },
                ],
                groceryShop: groceryShops.length > 0 ? groceryShops[0]._id : undefined,
                itemsTotal: 600,
                deliveryFee: 30,
                tax: 30,
                totalAmount: 660,
                deliveryAddress: { label: 'Home', street: '42, Sector 15, Vasant Kunj', city: 'New Delhi', state: 'Delhi', zipCode: '110070' },
                status: 'delivered',
                paymentMethod: 'cod',
                paymentStatus: 'completed',
                deliveryPartner: deliveryUsers[0]._id,
                estimatedDelivery: pastDate(1, 1),
                deliveredAt: pastDate(1),
                createdAt: pastDate(1, 2),
                statusHistory: [
                    { status: 'placed', timestamp: pastDate(1, 2) },
                    { status: 'delivered', timestamp: pastDate(1) },
                ],
            },
            // --- Active orders (various statuses) ---
            {
                user: customers[3]._id,
                orderType: 'food',
                items: [
                    { name: 'Veg Hakka Noodles', price: 179, quantity: 2, itemModel: 'MenuItem' },
                    { name: 'Chicken Manchurian', price: 269, quantity: 1, itemModel: 'MenuItem' },
                    { name: 'Spring Rolls (4 pcs)', price: 149, quantity: 1, itemModel: 'MenuItem' },
                ],
                cloudKitchen: kitchens.length > 0 ? kitchens[1]._id : undefined,
                itemsTotal: 776,
                deliveryFee: 30,
                tax: 39,
                totalAmount: 845,
                deliveryAddress: { label: 'Home', street: '23, Jubilee Hills, Road No. 36', city: 'Hyderabad', state: 'Telangana', zipCode: '500033' },
                status: 'placed',
                paymentMethod: 'stripe',
                paymentStatus: 'pending',
                estimatedDelivery: new Date(now.getTime() + 45 * 60 * 1000),
                createdAt: new Date(now.getTime() - 5 * 60 * 1000),
                statusHistory: [{ status: 'placed', timestamp: new Date(now.getTime() - 5 * 60 * 1000) }],
            },
            {
                user: customers[4]._id,
                orderType: 'food',
                items: [
                    { name: 'Paneer Tikka', price: 279, quantity: 1, itemModel: 'MenuItem' },
                    { name: 'Chicken Biryani', price: 329, quantity: 1, itemModel: 'MenuItem' },
                    { name: 'Mango Lassi', price: 129, quantity: 2, itemModel: 'MenuItem' },
                ],
                restaurant: restaurants[0]._id,
                itemsTotal: 866,
                deliveryFee: 40,
                tax: 43,
                totalAmount: 949,
                deliveryAddress: { label: 'Home', street: '56, Civil Lines, MG Road', city: 'Jaipur', state: 'Rajasthan', zipCode: '302006' },
                status: 'confirmed',
                paymentMethod: 'cod',
                paymentStatus: 'pending',
                estimatedDelivery: new Date(now.getTime() + 40 * 60 * 1000),
                createdAt: new Date(now.getTime() - 10 * 60 * 1000),
                statusHistory: [
                    { status: 'placed', timestamp: new Date(now.getTime() - 10 * 60 * 1000) },
                    { status: 'confirmed', timestamp: new Date(now.getTime() - 7 * 60 * 1000) },
                ],
            },
            {
                user: customers[0]._id,
                orderType: 'food',
                items: [
                    { name: 'Quinoa Buddha Bowl', price: 349, quantity: 1, itemModel: 'MenuItem' },
                    { name: 'Green Detox Smoothie', price: 199, quantity: 1, itemModel: 'MenuItem' },
                ],
                cloudKitchen: kitchens.length > 0 ? kitchens[0]._id : undefined,
                itemsTotal: 548,
                deliveryFee: 25,
                tax: 27,
                totalAmount: 600,
                deliveryAddress: { label: 'Home', street: '42, Sector 15, Vasant Kunj', city: 'New Delhi', state: 'Delhi', zipCode: '110070' },
                status: 'preparing',
                paymentMethod: 'stripe',
                paymentStatus: 'completed',
                estimatedDelivery: new Date(now.getTime() + 30 * 60 * 1000),
                createdAt: new Date(now.getTime() - 15 * 60 * 1000),
                statusHistory: [
                    { status: 'placed', timestamp: new Date(now.getTime() - 15 * 60 * 1000) },
                    { status: 'confirmed', timestamp: new Date(now.getTime() - 12 * 60 * 1000) },
                    { status: 'preparing', timestamp: new Date(now.getTime() - 8 * 60 * 1000) },
                ],
            },
            {
                user: customers[1]._id,
                orderType: 'food',
                items: [
                    { name: 'Punjab Da Dhaba Thali', price: 299, quantity: 2, itemModel: 'MenuItem' },
                    { name: 'Butter Naan', price: 49, quantity: 4, itemModel: 'MenuItem' },
                ],
                restaurant: restaurants[5] ? restaurants[5]._id : restaurants[0]._id,
                itemsTotal: 794,
                deliveryFee: 30,
                tax: 40,
                totalAmount: 864,
                deliveryAddress: { label: 'Home', street: '15, Koramangala 4th Block', city: 'Bengaluru', state: 'Karnataka', zipCode: '560034' },
                status: 'ready',
                paymentMethod: 'stripe',
                paymentStatus: 'completed',
                estimatedDelivery: new Date(now.getTime() + 20 * 60 * 1000),
                createdAt: new Date(now.getTime() - 25 * 60 * 1000),
                statusHistory: [
                    { status: 'placed', timestamp: new Date(now.getTime() - 25 * 60 * 1000) },
                    { status: 'confirmed', timestamp: new Date(now.getTime() - 22 * 60 * 1000) },
                    { status: 'preparing', timestamp: new Date(now.getTime() - 15 * 60 * 1000) },
                    { status: 'ready', timestamp: new Date(now.getTime() - 3 * 60 * 1000) },
                ],
            },
            {
                user: customers[2]._id,
                orderType: 'food',
                items: [
                    { name: 'Mutton Dum Biryani', price: 449, quantity: 1, itemModel: 'MenuItem' },
                    { name: 'Haleem', price: 299, quantity: 1, itemModel: 'MenuItem' },
                    { name: 'Double Ka Meetha', price: 129, quantity: 2, itemModel: 'MenuItem' },
                ],
                restaurant: restaurants[3]._id,
                itemsTotal: 1006,
                deliveryFee: 30,
                tax: 50,
                totalAmount: 1086,
                deliveryAddress: { label: 'Home', street: '78, Bandra West, Hill Road', city: 'Mumbai', state: 'Maharashtra', zipCode: '400050' },
                status: 'outForDelivery',
                paymentMethod: 'stripe',
                paymentStatus: 'completed',
                deliveryPartner: deliveryUsers[0]._id,
                estimatedDelivery: new Date(now.getTime() + 10 * 60 * 1000),
                createdAt: new Date(now.getTime() - 35 * 60 * 1000),
                statusHistory: [
                    { status: 'placed', timestamp: new Date(now.getTime() - 35 * 60 * 1000) },
                    { status: 'confirmed', timestamp: new Date(now.getTime() - 32 * 60 * 1000) },
                    { status: 'preparing', timestamp: new Date(now.getTime() - 25 * 60 * 1000) },
                    { status: 'ready', timestamp: new Date(now.getTime() - 10 * 60 * 1000) },
                    { status: 'outForDelivery', timestamp: new Date(now.getTime() - 5 * 60 * 1000) },
                ],
            },
            // --- Cancelled order ---
            {
                user: customers[3]._id,
                orderType: 'food',
                items: [
                    { name: 'Pav Bhaji', price: 159, quantity: 2, itemModel: 'MenuItem' },
                ],
                restaurant: restaurants[4] ? restaurants[4]._id : restaurants[0]._id,
                itemsTotal: 318,
                deliveryFee: 20,
                tax: 16,
                totalAmount: 354,
                deliveryAddress: { label: 'Home', street: '23, Jubilee Hills, Road No. 36', city: 'Hyderabad', state: 'Telangana', zipCode: '500033' },
                status: 'cancelled',
                paymentMethod: 'cod',
                paymentStatus: 'pending',
                cancelledAt: pastDate(0, 2),
                cancelReason: 'Changed my mind',
                createdAt: pastDate(0, 3),
                statusHistory: [
                    { status: 'placed', timestamp: pastDate(0, 3) },
                    { status: 'cancelled', timestamp: pastDate(0, 2) },
                ],
            },
            // More delivered orders for history
            {
                user: customers[1]._id,
                orderType: 'grocery',
                items: [
                    { name: 'Organic Bananas', price: 60, quantity: 2, itemModel: 'Product' },
                    { name: 'Organic Honey (500g)', price: 350, quantity: 1, itemModel: 'Product' },
                    { name: 'Almonds (250g)', price: 299, quantity: 1, itemModel: 'Product' },
                ],
                groceryShop: groceryShops.length > 1 ? groceryShops[1]._id : groceryShops[0]._id,
                itemsTotal: 769,
                deliveryFee: 40,
                tax: 38,
                totalAmount: 847,
                deliveryAddress: { label: 'Home', street: '15, Koramangala 4th Block', city: 'Bengaluru', state: 'Karnataka', zipCode: '560034' },
                status: 'delivered',
                paymentMethod: 'stripe',
                paymentStatus: 'completed',
                deliveryPartner: deliveryUsers[1]._id,
                estimatedDelivery: pastDate(4, 1),
                deliveredAt: pastDate(4),
                createdAt: pastDate(4, 2),
                statusHistory: [
                    { status: 'placed', timestamp: pastDate(4, 2) },
                    { status: 'delivered', timestamp: pastDate(4) },
                ],
            },
            {
                user: customers[4]._id,
                orderType: 'food',
                items: [
                    { name: 'Schezwan Fried Rice', price: 199, quantity: 1, itemModel: 'MenuItem' },
                    { name: 'Dragon Chicken', price: 289, quantity: 1, itemModel: 'MenuItem' },
                    { name: 'Hot & Sour Soup', price: 129, quantity: 1, itemModel: 'MenuItem' },
                ],
                cloudKitchen: kitchens.length > 1 ? kitchens[1]._id : kitchens[0]._id,
                itemsTotal: 617,
                deliveryFee: 30,
                tax: 31,
                totalAmount: 678,
                deliveryAddress: { label: 'Home', street: '56, Civil Lines, MG Road', city: 'Jaipur', state: 'Rajasthan', zipCode: '302006' },
                status: 'delivered',
                paymentMethod: 'cod',
                paymentStatus: 'completed',
                deliveryPartner: deliveryUsers[0]._id,
                estimatedDelivery: pastDate(5, 1),
                deliveredAt: pastDate(5),
                createdAt: pastDate(5, 2),
                statusHistory: [
                    { status: 'placed', timestamp: pastDate(5, 2) },
                    { status: 'delivered', timestamp: pastDate(5) },
                ],
            },
            {
                user: customers[0]._id,
                orderType: 'food',
                items: [
                    { name: 'Protein Power Bowl', price: 329, quantity: 1, itemModel: 'MenuItem' },
                    { name: 'Mediterranean Wrap', price: 269, quantity: 1, itemModel: 'MenuItem' },
                    { name: 'Acai Smoothie Bowl', price: 299, quantity: 1, itemModel: 'MenuItem' },
                ],
                cloudKitchen: kitchens.length > 0 ? kitchens[0]._id : undefined,
                itemsTotal: 897,
                deliveryFee: 25,
                tax: 45,
                totalAmount: 967,
                deliveryAddress: { label: 'Home', street: '42, Sector 15, Vasant Kunj', city: 'New Delhi', state: 'Delhi', zipCode: '110070' },
                status: 'delivered',
                paymentMethod: 'stripe',
                paymentStatus: 'completed',
                deliveryPartner: deliveryUsers[0]._id,
                estimatedDelivery: pastDate(6, 1),
                deliveredAt: pastDate(6),
                createdAt: pastDate(6, 2),
                statusHistory: [
                    { status: 'placed', timestamp: pastDate(6, 2) },
                    { status: 'delivered', timestamp: pastDate(6) },
                ],
            },
            {
                user: customers[2]._id,
                orderType: 'grocery',
                items: [
                    { name: 'Farm Fresh Tomatoes', price: 40, quantity: 3, itemModel: 'Product' },
                    { name: 'India Gate Basmati Rice (5kg)', price: 425, quantity: 1, itemModel: 'Product' },
                    { name: 'Amul Pure Ghee (500ml)', price: 310, quantity: 1, itemModel: 'Product' },
                    { name: 'Parle-G Biscuits (800g)', price: 80, quantity: 2, itemModel: 'Product' },
                ],
                groceryShop: groceryShops.length > 0 ? groceryShops[0]._id : undefined,
                itemsTotal: 1015,
                deliveryFee: 30,
                tax: 51,
                totalAmount: 1096,
                deliveryAddress: { label: 'Home', street: '78, Bandra West, Hill Road', city: 'Mumbai', state: 'Maharashtra', zipCode: '400050' },
                status: 'delivered',
                paymentMethod: 'cod',
                paymentStatus: 'completed',
                deliveryPartner: deliveryUsers[1]._id,
                estimatedDelivery: pastDate(2, 1),
                deliveredAt: pastDate(2),
                createdAt: pastDate(2, 2),
                statusHistory: [
                    { status: 'placed', timestamp: pastDate(2, 2) },
                    { status: 'delivered', timestamp: pastDate(2) },
                ],
            },
            {
                user: customers[3]._id,
                orderType: 'food',
                items: [
                    { name: 'Kerala Fish Curry', price: 349, quantity: 1, itemModel: 'MenuItem' },
                    { name: 'Vegetable Sambar Rice', price: 179, quantity: 1, itemModel: 'MenuItem' },
                    { name: 'Rasam', price: 69, quantity: 1, itemModel: 'MenuItem' },
                    { name: 'Payasam', price: 99, quantity: 1, itemModel: 'MenuItem' },
                ],
                restaurant: restaurants[2]._id,
                itemsTotal: 696,
                deliveryFee: 25,
                tax: 35,
                totalAmount: 756,
                deliveryAddress: { label: 'Office', street: '67, HITEC City', city: 'Hyderabad', state: 'Telangana', zipCode: '500081' },
                status: 'delivered',
                paymentMethod: 'stripe',
                paymentStatus: 'completed',
                deliveryPartner: deliveryUsers[1]._id,
                estimatedDelivery: pastDate(7, 1),
                deliveredAt: pastDate(7),
                createdAt: pastDate(7, 2),
                statusHistory: [
                    { status: 'placed', timestamp: pastDate(7, 2) },
                    { status: 'delivered', timestamp: pastDate(7) },
                ],
            },
        ];

        // Filter out undefined groceryShop/cloudKitchen refs
        const cleanedOrders = ordersData.map((o) => {
            const cleaned = { ...o };
            if (!cleaned.groceryShop) delete cleaned.groceryShop;
            if (!cleaned.cloudKitchen) delete cleaned.cloudKitchen;
            if (!cleaned.restaurant) delete cleaned.restaurant;
            return cleaned;
        });

        const createdOrders = await Order.insertMany(cleanedOrders);
        console.log(`✅ ${createdOrders.length} orders seeded`);

        // Summary
        const statusCounts = {};
        createdOrders.forEach((o) => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });
        console.log('\n📊 Seeding Summary:');
        console.log(`   Delivery Partners: ${partners.length}`);
        console.log(`   Orders: ${createdOrders.length}`);
        console.log('   Order statuses:', statusCounts);
        console.log('\n🏍️  Delivery Partners:');
        for (const p of partners) {
            const user = await User.findById(p.user);
            console.log(`   • ${user.name} — ${p.vehicleType} (${p.vehicleNumber}) — ${p.totalDeliveries} deliveries`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    }
};

seedOrdersAndDelivery();
