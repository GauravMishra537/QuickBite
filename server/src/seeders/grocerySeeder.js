const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const GroceryShop = require('../models/GroceryShop');
const Product = require('../models/Product');
const NGO = require('../models/NGO');
const Donation = require('../models/Donation');
const Restaurant = require('../models/Restaurant');
const connectDB = require('../config/db');

dotenv.config();

const seedGroceryAndNGO = async () => {
    try {
        await connectDB();

        await GroceryShop.deleteMany({});
        await Product.deleteMany({});
        await NGO.deleteMany({});
        await Donation.deleteMany({});
        console.log('🗑️  Cleared existing grocery shops, products, NGOs, and donations');

        const groceryOwners = await User.find({ role: 'grocery' });
        const ngoOwners = await User.find({ role: 'ngo' });
        const restaurants = await Restaurant.find();

        if (groceryOwners.length < 2) {
            console.error('❌ Need at least 2 grocery owners. Run userSeeder first.');
            process.exit(1);
        }

        // =============================
        // GROCERY SHOPS (4)
        // =============================
        const shops = await GroceryShop.create([
            {
                owner: groceryOwners[0]._id,
                name: 'Fresh Basket Supermart',
                description: 'Your one-stop grocery destination with the freshest fruits, vegetables, dairy, and pantry essentials delivered to your doorstep.',
                address: { street: '19, Anna Salai, Teynampet', city: 'Chennai', state: 'Tamil Nadu', zipCode: '600018' },
                location: { type: 'Point', coordinates: [80.2528, 13.0347] },
                images: ['https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800'],
                phone: '+91 44 2345 6789',
                email: 'info@freshbasket.in',
                rating: 4.4,
                totalReviews: 278,
                isOpen: true,
                operatingHours: { open: '07:00', close: '22:00' },
                deliveryTime: { min: 25, max: 45 },
                deliveryFee: 30,
                minOrderAmount: 149,
                categories: ['Fruits & Vegetables', 'Dairy & Eggs', 'Grains & Cereals', 'Spices & Masalas', 'Oils & Ghee', 'Snacks & Beverages'],
                isFeatured: true,
                isVerified: true,
                tags: ['supermart', 'fresh', 'organic', 'daily-essentials'],
            },
            {
                owner: groceryOwners[0]._id,
                name: 'Organic Nature Store',
                description: 'Premium certified organic products — from farm-fresh produce to cold-pressed oils. Health-first grocery shopping.',
                address: { street: '34, Adyar, 2nd Main Road', city: 'Chennai', state: 'Tamil Nadu', zipCode: '600020' },
                location: { type: 'Point', coordinates: [80.2564, 13.0063] },
                images: ['https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'],
                phone: '+91 44 2456 7890',
                email: 'orders@organicnature.in',
                rating: 4.6,
                totalReviews: 156,
                isOpen: true,
                operatingHours: { open: '08:00', close: '21:00' },
                deliveryTime: { min: 30, max: 50 },
                deliveryFee: 40,
                minOrderAmount: 249,
                categories: ['Fruits & Vegetables', 'Grains & Cereals', 'Oils & Ghee', 'Dry Fruits & Nuts', 'Pulses & Lentils', 'Rice & Flour'],
                isFeatured: true,
                isVerified: true,
                tags: ['organic', 'health', 'premium', 'farm-fresh'],
            },
            {
                owner: groceryOwners[1]._id,
                name: 'Awadhi Kirana Store',
                description: 'Traditional kirana store now online! All your daily household essentials, spices, and pantry staples at the best prices.',
                address: { street: '23, Hazratganj, Central Market', city: 'Lucknow', state: 'Uttar Pradesh', zipCode: '226001' },
                location: { type: 'Point', coordinates: [80.9462, 26.8498] },
                images: ['https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800'],
                phone: '+91 522 234 5678',
                email: 'orders@awadhikirana.in',
                rating: 4.2,
                totalReviews: 389,
                isOpen: true,
                operatingHours: { open: '07:00', close: '22:00' },
                deliveryTime: { min: 20, max: 40 },
                deliveryFee: 20,
                minOrderAmount: 99,
                categories: ['Spices & Masalas', 'Grains & Cereals', 'Pulses & Lentils', 'Rice & Flour', 'Oils & Ghee', 'Snacks & Beverages', 'Household'],
                isFeatured: false,
                isVerified: true,
                tags: ['kirana', 'budget', 'daily-needs', 'traditional'],
            },
            {
                owner: groceryOwners[1]._id,
                name: 'QuickMart Express',
                description: 'Flash grocery delivery in 15-30 minutes! Snacks, cold drinks, ice cream, personal care, and all your instant needs.',
                address: { street: '56, Gomti Nagar, Vibhuti Khand', city: 'Lucknow', state: 'Uttar Pradesh', zipCode: '226010' },
                location: { type: 'Point', coordinates: [81.0049, 26.8602] },
                images: ['https://images.unsplash.com/photo-1601599561213-832382fd07ba?w=800'],
                phone: '+91 522 345 6789',
                email: 'orders@quickmart.in',
                rating: 4.0,
                totalReviews: 201,
                isOpen: true,
                operatingHours: { open: '08:00', close: '00:00' },
                deliveryTime: { min: 15, max: 30 },
                deliveryFee: 15,
                minOrderAmount: 79,
                categories: ['Snacks & Beverages', 'Personal Care', 'Household', 'Dairy & Eggs', 'Frozen Foods', 'Bakery', 'Baby Care'],
                isFeatured: true,
                isVerified: true,
                tags: ['quick-delivery', 'instant', 'snacks', 'essentials'],
            },
        ]);

        console.log(`✅ ${shops.length} grocery shops seeded`);

        // =============================
        // PRODUCTS (15+ per shop, realistic Indian grocery items)
        // =============================
        const freshBasketProducts = [
            { name: 'Farm Fresh Tomatoes', description: 'Ripe red tomatoes, locally sourced', price: 40, category: 'Fruits & Vegetables', shop: shops[0]._id, stock: 200, unit: 'kg', weight: '1 kg', isOrganic: false, rating: 4.3, totalOrders: 890, tags: ['fresh', 'vegetable'] },
            { name: 'Green Spinach (Palak)', description: 'Fresh leafy palak, washed and packed', price: 30, category: 'Fruits & Vegetables', shop: shops[0]._id, stock: 150, unit: 'pack', weight: '250g', isOrganic: false, rating: 4.1, totalOrders: 560, tags: ['leafy', 'green'] },
            { name: 'Alphonso Mangoes', description: 'Premium Ratnagiri Alphonso mangoes', price: 450, category: 'Fruits & Vegetables', shop: shops[0]._id, stock: 50, unit: 'dozen', weight: '1 dozen', isOrganic: false, rating: 4.8, totalOrders: 230, tags: ['fruit', 'premium', 'seasonal'] },
            { name: 'Amul Toned Milk', description: 'Pasteurized toned milk, 500ml pouch', price: 28, category: 'Dairy & Eggs', shop: shops[0]._id, stock: 300, unit: 'pack', weight: '500ml', brand: 'Amul', rating: 4.5, totalOrders: 2300, tags: ['milk', 'daily'] },
            { name: 'Brown Eggs (6 pcs)', description: 'Farm fresh brown eggs, protein-rich', price: 65, category: 'Dairy & Eggs', shop: shops[0]._id, stock: 100, unit: 'pack', weight: '6 pcs', rating: 4.2, totalOrders: 780, tags: ['eggs', 'protein'] },
            { name: 'Amul Butter (100g)', description: 'Pasteurized butter for bread and cooking', price: 56, category: 'Dairy & Eggs', shop: shops[0]._id, stock: 200, unit: 'pack', weight: '100g', brand: 'Amul', rating: 4.6, totalOrders: 1200, tags: ['butter', 'daily'] },
            { name: 'Aashirvaad Atta (5kg)', description: 'Whole wheat flour for soft rotis', price: 280, category: 'Rice & Flour', shop: shops[0]._id, stock: 80, unit: 'pack', weight: '5 kg', brand: 'Aashirvaad', rating: 4.4, totalOrders: 1500, tags: ['wheat', 'flour', 'atta'] },
            { name: 'India Gate Basmati Rice (5kg)', description: 'Premium long grain basmati rice', price: 425, category: 'Rice & Flour', shop: shops[0]._id, stock: 60, unit: 'pack', weight: '5 kg', brand: 'India Gate', rating: 4.7, totalOrders: 890, tags: ['rice', 'basmati', 'premium'] },
            { name: 'Toor Dal (1kg)', description: 'Premium arhar/toor dal for dal fry and sambhar', price: 160, category: 'Pulses & Lentils', shop: shops[0]._id, stock: 120, unit: 'kg', weight: '1 kg', rating: 4.3, totalOrders: 670, tags: ['dal', 'lentil', 'protein'] },
            { name: 'MDH Garam Masala (100g)', description: 'Blended hot spice mix for curries', price: 78, category: 'Spices & Masalas', shop: shops[0]._id, stock: 150, unit: 'pack', weight: '100g', brand: 'MDH', rating: 4.5, totalOrders: 1100, tags: ['spice', 'masala'] },
            { name: 'Everest Turmeric Powder (200g)', description: 'Pure haldi powder for cooking', price: 55, category: 'Spices & Masalas', shop: shops[0]._id, stock: 180, unit: 'pack', weight: '200g', brand: 'Everest', rating: 4.4, totalOrders: 980, tags: ['haldi', 'turmeric'] },
            { name: 'Fortune Sunflower Oil (1L)', description: 'Refined sunflower cooking oil', price: 145, category: 'Oils & Ghee', shop: shops[0]._id, stock: 90, unit: 'bottle', weight: '1 L', brand: 'Fortune', rating: 4.2, totalOrders: 1340, tags: ['oil', 'cooking'] },
            { name: 'Amul Pure Ghee (500ml)', description: 'Pure cow ghee for cooking and sweets', price: 310, category: 'Oils & Ghee', shop: shops[0]._id, stock: 70, unit: 'bottle', weight: '500ml', brand: 'Amul', rating: 4.7, totalOrders: 560, tags: ['ghee', 'pure'] },
            { name: 'Haldiram Aloo Bhujia (200g)', description: 'Crispy spicy namkeen snack', price: 55, category: 'Snacks & Beverages', shop: shops[0]._id, stock: 200, unit: 'pack', weight: '200g', brand: 'Haldiram', rating: 4.3, totalOrders: 890, tags: ['snack', 'namkeen'] },
            { name: 'Coca-Cola (750ml)', description: 'Classic cola soft drink', price: 38, category: 'Snacks & Beverages', shop: shops[0]._id, stock: 250, unit: 'bottle', weight: '750ml', brand: 'Coca-Cola', rating: 4.0, totalOrders: 2100, tags: ['drink', 'soda', 'cold'] },
            { name: 'Parle-G Biscuits (800g)', description: 'India\'s favourite glucose biscuit, family pack', price: 80, category: 'Snacks & Beverages', shop: shops[0]._id, stock: 300, unit: 'pack', weight: '800g', brand: 'Parle', rating: 4.5, totalOrders: 3400, tags: ['biscuit', 'tea-time'] },
        ];

        const organicProducts = [
            { name: 'Organic Bananas', description: 'Certified organic bananas, chemical-free', price: 60, category: 'Fruits & Vegetables', shop: shops[1]._id, stock: 100, unit: 'dozen', weight: '1 dozen', isOrganic: true, rating: 4.6, totalOrders: 450, tags: ['organic', 'fruit'] },
            { name: 'Organic Honey (500g)', description: 'Raw unprocessed honey from Nilgiri hills', price: 350, category: 'Condiments & Sauces', shop: shops[1]._id, stock: 40, unit: 'bottle', weight: '500g', isOrganic: true, rating: 4.8, totalOrders: 230, tags: ['organic', 'honey', 'natural'] },
            { name: 'Cold-Pressed Coconut Oil (1L)', description: 'Virgin coconut oil, cold-pressed and unrefined', price: 420, category: 'Oils & Ghee', shop: shops[1]._id, stock: 50, unit: 'bottle', weight: '1L', isOrganic: true, rating: 4.7, totalOrders: 340, tags: ['organic', 'coconut', 'cold-pressed'] },
            { name: 'Organic Brown Rice (2kg)', description: 'Unpolished brown rice, high in fiber', price: 220, category: 'Rice & Flour', shop: shops[1]._id, stock: 60, unit: 'pack', weight: '2 kg', isOrganic: true, rating: 4.5, totalOrders: 290, tags: ['organic', 'brown-rice', 'fiber'] },
            { name: 'Organic Moong Dal (1kg)', description: 'Whole green gram, organic certified', price: 210, category: 'Pulses & Lentils', shop: shops[1]._id, stock: 80, unit: 'kg', weight: '1 kg', isOrganic: true, rating: 4.4, totalOrders: 200, tags: ['organic', 'dal', 'protein'] },
            { name: 'Organic Jaggery (500g)', description: 'Natural sugarcane jaggery, chemical-free', price: 120, category: 'Condiments & Sauces', shop: shops[1]._id, stock: 90, unit: 'pack', weight: '500g', isOrganic: true, rating: 4.3, totalOrders: 180, tags: ['organic', 'jaggery', 'natural'] },
            { name: 'Almonds (250g)', description: 'California almonds, premium grade', price: 299, category: 'Dry Fruits & Nuts', shop: shops[1]._id, stock: 70, unit: 'pack', weight: '250g', rating: 4.6, totalOrders: 560, tags: ['dryfruits', 'almond', 'protein'] },
            { name: 'Cashew Nuts (250g)', description: 'Whole W240 cashews, roasted and salted', price: 340, category: 'Dry Fruits & Nuts', shop: shops[1]._id, stock: 60, unit: 'pack', weight: '250g', rating: 4.5, totalOrders: 430, tags: ['dryfruits', 'cashew'] },
            { name: 'Organic Quinoa (500g)', description: 'White quinoa, high protein superfood', price: 280, category: 'Grains & Cereals', shop: shops[1]._id, stock: 45, unit: 'pack', weight: '500g', isOrganic: true, rating: 4.4, totalOrders: 170, tags: ['organic', 'quinoa', 'superfood'] },
            { name: 'Organic Chia Seeds (200g)', description: 'Rich in omega-3 and fiber', price: 190, category: 'Grains & Cereals', shop: shops[1]._id, stock: 55, unit: 'pack', weight: '200g', isOrganic: true, rating: 4.5, totalOrders: 210, tags: ['organic', 'chia', 'seeds'] },
        ];

        const allProducts = [...freshBasketProducts, ...organicProducts];
        const createdProducts = await Product.create(allProducts);
        console.log(`✅ ${createdProducts.length} products seeded`);

        // =============================
        // NGOs (3)
        // =============================
        const ngos = await NGO.create([
            {
                owner: ngoOwners[0]._id,
                name: 'Feeding India Foundation',
                description: 'Working to eliminate hunger by redistributing surplus food to underserved communities across India. A Zomato initiative.',
                registrationNumber: 'NGO-DL-2019-001234',
                address: { street: '5, Lodhi Road, Institutional Area', city: 'New Delhi', state: 'Delhi', zipCode: '110003' },
                location: { type: 'Point', coordinates: [77.2273, 28.5896] },
                contactPerson: 'Sunita Devi',
                phone: '+91 11 4567 8900',
                email: 'contact@feedingindia.org',
                website: 'https://www.feedingindia.org',
                areasServed: ['New Delhi', 'Noida', 'Gurugram', 'Faridabad', 'Ghaziabad'],
                totalDonationsReceived: 1250,
                isVerified: true,
                tags: ['hunger', 'food-redistribution', 'community'],
            },
            {
                owner: ngoOwners[0]._id,
                name: 'Akshaya Patra Foundation',
                description: 'Providing mid-day meals to school children across India. No child should be denied education because of hunger.',
                registrationNumber: 'NGO-KA-2000-005678',
                address: { street: '72, Rajajinagar Industrial Area', city: 'Bengaluru', state: 'Karnataka', zipCode: '560010' },
                location: { type: 'Point', coordinates: [77.5555, 12.9918] },
                contactPerson: 'Dr. Ramesh Kumar',
                phone: '+91 80 3012 3456',
                email: 'info@akshayapatra.org',
                website: 'https://www.akshayapatra.org',
                areasServed: ['Bengaluru', 'Mysuru', 'Hubli', 'Mangaluru'],
                totalDonationsReceived: 3400,
                isVerified: true,
                tags: ['children', 'education', 'mid-day-meals'],
            },
            {
                owner: ngoOwners[0]._id,
                name: 'Robin Hood Army',
                description: 'Volunteer-based organization that distributes surplus food from restaurants and events to the less fortunate.',
                registrationNumber: 'NGO-MH-2014-009012',
                address: { street: '18, Bandra Kurla Complex', city: 'Mumbai', state: 'Maharashtra', zipCode: '400051' },
                location: { type: 'Point', coordinates: [72.8650, 19.0590] },
                contactPerson: 'Neel Ghose',
                phone: '+91 22 6789 0123',
                email: 'volunteer@robinhoodarmy.com',
                website: 'https://robinhoodarmy.com',
                areasServed: ['Mumbai', 'Pune', 'Thane', 'Navi Mumbai'],
                totalDonationsReceived: 2100,
                isVerified: true,
                tags: ['volunteer', 'surplus-food', 'community'],
            },
        ]);

        console.log(`✅ ${ngos.length} NGOs seeded`);

        // =============================
        // SAMPLE DONATIONS (5)
        // =============================
        if (restaurants.length > 0) {
            const now = new Date();
            const donations = await Donation.create([
                {
                    restaurant: restaurants[0]._id,
                    items: [
                        { name: 'Leftover Dal Makhani', quantity: 20, unit: 'servings', description: 'Prepared fresh today' },
                        { name: 'Butter Naan', quantity: 40, unit: 'pcs', description: 'Extra from evening service' },
                    ],
                    totalServings: 20,
                    status: 'available',
                    pickupAddress: restaurants[0].address,
                    notes: 'Available for pickup before 10 PM tonight',
                    expiresAt: new Date(now.getTime() + 6 * 60 * 60 * 1000),
                },
                {
                    restaurant: restaurants[1]._id,
                    items: [
                        { name: 'Vada Pav', quantity: 30, unit: 'pcs', description: 'Freshly made today' },
                        { name: 'Pav Bhaji', quantity: 15, unit: 'servings' },
                    ],
                    totalServings: 30,
                    status: 'available',
                    pickupAddress: restaurants[1].address,
                    notes: 'Pickup before closing time',
                    expiresAt: new Date(now.getTime() + 4 * 60 * 60 * 1000),
                },
                {
                    restaurant: restaurants[2]._id,
                    ngo: ngos[1]._id,
                    items: [
                        { name: 'Idli Sambhar Combo', quantity: 50, unit: 'servings', description: 'Breakfast surplus' },
                    ],
                    totalServings: 50,
                    status: 'accepted',
                    pickupAddress: restaurants[2].address,
                    pickupTime: new Date(now.getTime() + 2 * 60 * 60 * 1000),
                    notes: 'Accepted by Akshaya Patra',
                    expiresAt: new Date(now.getTime() + 5 * 60 * 60 * 1000),
                },
                {
                    restaurant: restaurants[3]._id,
                    ngo: ngos[0]._id,
                    items: [
                        { name: 'Veg Biryani', quantity: 25, unit: 'servings' },
                        { name: 'Raita', quantity: 25, unit: 'cups' },
                    ],
                    totalServings: 25,
                    status: 'delivered',
                    pickupAddress: restaurants[3].address,
                    notes: 'Successfully delivered to Feeding India',
                    expiresAt: new Date(now.getTime() + 8 * 60 * 60 * 1000),
                },
                {
                    restaurant: restaurants[4]._id,
                    items: [
                        { name: 'Pani Puri Set', quantity: 40, unit: 'sets' },
                        { name: 'Aloo Tikki', quantity: 20, unit: 'pcs' },
                    ],
                    totalServings: 40,
                    status: 'available',
                    pickupAddress: restaurants[4].address,
                    notes: 'Evening surplus — must pick up before 9 PM',
                    expiresAt: new Date(now.getTime() + 3 * 60 * 60 * 1000),
                },
            ]);

            console.log(`✅ ${donations.length} sample donations seeded`);
        }

        // Print summary
        console.log('\n📊 Seeding Summary:');
        console.log(`   Grocery Shops: ${shops.length}`);
        console.log(`   Products: ${createdProducts.length}`);
        console.log(`   NGOs: ${ngos.length}`);
        console.log('\n🛒 Grocery Shops:');
        shops.forEach((s) => console.log(`   • ${s.name} — ${s.address.city}`));
        console.log('\n🤝 NGOs:');
        ngos.forEach((n) => console.log(`   • ${n.name} — ${n.address.city}`));

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    }
};

seedGroceryAndNGO();
