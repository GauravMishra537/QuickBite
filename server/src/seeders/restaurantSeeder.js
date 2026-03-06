const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const CloudKitchen = require('../models/CloudKitchen');
const MenuItem = require('../models/MenuItem');
const connectDB = require('../config/db');

dotenv.config();

const seedRestaurantsAndKitchens = async () => {
    try {
        await connectDB();

        // Clear existing data
        await Restaurant.deleteMany({});
        await CloudKitchen.deleteMany({});
        await MenuItem.deleteMany({});
        console.log('🗑️  Cleared existing restaurants, cloud kitchens, and menu items');

        // Get restaurant & cloud kitchen owners from seeded users
        const restaurantOwners = await User.find({ role: 'restaurant' });
        const kitchenOwners = await User.find({ role: 'cloudkitchen' });

        if (restaurantOwners.length < 3) {
            console.error('❌ Need at least 3 restaurant owners. Run userSeeder first.');
            process.exit(1);
        }
        if (kitchenOwners.length < 2) {
            console.error('❌ Need at least 2 cloud kitchen owners. Run userSeeder first.');
            process.exit(1);
        }

        // =============================
        // RESTAURANTS (6)
        // =============================
        const restaurants = await Restaurant.create([
            {
                owner: restaurantOwners[0]._id,
                name: 'Spice Garden',
                description: 'Authentic North Indian cuisine with a modern twist. Known for our rich gravies, tandoori specialties, and aromatic biryanis prepared by master chefs.',
                cuisine: ['North Indian', 'Mughlai', 'Tandoori'],
                address: { street: '12, Connaught Place, Block A', city: 'New Delhi', state: 'Delhi', zipCode: '110001' },
                location: { type: 'Point', coordinates: [77.2195, 28.6329] },
                images: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'],
                phone: '+91 11 2341 5678',
                email: 'info@spicegarden.in',
                rating: 4.5,
                totalReviews: 328,
                isOpen: true,
                openingHours: { open: '11:00', close: '23:00' },
                deliveryTime: { min: 30, max: 45 },
                deliveryFee: 40,
                minOrderAmount: 149,
                tables: [
                    { tableNumber: 1, capacity: 2, isAvailable: true, location: 'indoor' },
                    { tableNumber: 2, capacity: 2, isAvailable: true, location: 'indoor' },
                    { tableNumber: 3, capacity: 4, isAvailable: true, location: 'indoor' },
                    { tableNumber: 4, capacity: 4, isAvailable: false, location: 'outdoor' },
                    { tableNumber: 5, capacity: 6, isAvailable: true, location: 'rooftop' },
                    { tableNumber: 6, capacity: 8, isAvailable: true, location: 'private' },
                ],
                isFeatured: true,
                isVerified: true,
                tags: ['fine-dining', 'family', 'romantic', 'North Indian'],
            },
            {
                owner: restaurantOwners[0]._id,
                name: 'Bombay Brasserie',
                description: 'Premium coastal and street food flavors of Mumbai. From vada pav to seafood thalis, experience the vibrant culinary culture of Maharashtra.',
                cuisine: ['Maharashtrian', 'Street Food', 'Coastal'],
                address: { street: '78, Linking Road, Bandra West', city: 'Mumbai', state: 'Maharashtra', zipCode: '400050' },
                location: { type: 'Point', coordinates: [72.8362, 19.0596] },
                images: ['https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800'],
                phone: '+91 22 2641 9876',
                email: 'info@bombaybrasserie.in',
                rating: 4.3,
                totalReviews: 245,
                isOpen: true,
                openingHours: { open: '10:00', close: '23:30' },
                deliveryTime: { min: 25, max: 40 },
                deliveryFee: 35,
                minOrderAmount: 129,
                tables: [
                    { tableNumber: 1, capacity: 2, isAvailable: true, location: 'indoor' },
                    { tableNumber: 2, capacity: 4, isAvailable: true, location: 'indoor' },
                    { tableNumber: 3, capacity: 4, isAvailable: true, location: 'outdoor' },
                    { tableNumber: 4, capacity: 6, isAvailable: true, location: 'rooftop' },
                ],
                isFeatured: true,
                isVerified: true,
                tags: ['casual-dining', 'street-food', 'seafood', 'family'],
            },
            {
                owner: restaurantOwners[1]._id,
                name: 'Dakshin Flavors',
                description: 'Authentic South Indian delicacies from dosas to idlis, served with traditional chutneys and sambhar. A pure vegetarian paradise.',
                cuisine: ['South Indian', 'Kerala', 'Tamil'],
                address: { street: '45, MG Road, Indiranagar', city: 'Bengaluru', state: 'Karnataka', zipCode: '560038' },
                location: { type: 'Point', coordinates: [77.6408, 12.9784] },
                images: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800'],
                phone: '+91 80 4123 5678',
                email: 'info@dakshinflavors.in',
                rating: 4.6,
                totalReviews: 512,
                isOpen: true,
                openingHours: { open: '07:00', close: '22:30' },
                deliveryTime: { min: 20, max: 35 },
                deliveryFee: 25,
                minOrderAmount: 99,
                tables: [
                    { tableNumber: 1, capacity: 2, isAvailable: true, location: 'indoor' },
                    { tableNumber: 2, capacity: 2, isAvailable: true, location: 'indoor' },
                    { tableNumber: 3, capacity: 4, isAvailable: true, location: 'indoor' },
                    { tableNumber: 4, capacity: 6, isAvailable: true, location: 'outdoor' },
                    { tableNumber: 5, capacity: 8, isAvailable: true, location: 'private' },
                ],
                isFeatured: true,
                isVerified: true,
                tags: ['vegetarian', 'breakfast', 'family', 'South Indian'],
            },
            {
                owner: restaurantOwners[1]._id,
                name: 'Royal Biryani House',
                description: 'Legendary Hyderabadi dum biryani and authentic Nizami cuisine. Our biryanis are slow-cooked for hours using traditional recipes passed down generations.',
                cuisine: ['Hyderabadi', 'Biryani', 'Mughlai'],
                address: { street: '23, Jubilee Hills, Road No. 36', city: 'Hyderabad', state: 'Telangana', zipCode: '500033' },
                location: { type: 'Point', coordinates: [78.4069, 17.4325] },
                images: ['https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800'],
                phone: '+91 40 6789 1234',
                email: 'info@royalbiryani.in',
                rating: 4.7,
                totalReviews: 890,
                isOpen: true,
                openingHours: { open: '11:00', close: '23:00' },
                deliveryTime: { min: 35, max: 50 },
                deliveryFee: 30,
                minOrderAmount: 199,
                tables: [
                    { tableNumber: 1, capacity: 2, isAvailable: true, location: 'indoor' },
                    { tableNumber: 2, capacity: 4, isAvailable: true, location: 'indoor' },
                    { tableNumber: 3, capacity: 4, isAvailable: true, location: 'indoor' },
                    { tableNumber: 4, capacity: 6, isAvailable: true, location: 'private' },
                    { tableNumber: 5, capacity: 10, isAvailable: true, location: 'private' },
                ],
                isFeatured: true,
                isVerified: true,
                tags: ['biryani', 'non-veg', 'family', 'Hyderabadi'],
            },
            {
                owner: restaurantOwners[2]._id,
                name: 'Chai & Chaat Corner',
                description: 'The best street food experience in Pune! From pani puri to pav bhaji, with a wide range of chai and lassi to complement your meal.',
                cuisine: ['Street Food', 'Chaat', 'Beverages'],
                address: { street: '88, FC Road, Shivajinagar', city: 'Pune', state: 'Maharashtra', zipCode: '411005' },
                location: { type: 'Point', coordinates: [73.8416, 18.5314] },
                images: ['https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800'],
                phone: '+91 20 2553 4567',
                email: 'info@chaichaat.in',
                rating: 4.2,
                totalReviews: 189,
                isOpen: true,
                openingHours: { open: '08:00', close: '22:00' },
                deliveryTime: { min: 15, max: 25 },
                deliveryFee: 20,
                minOrderAmount: 79,
                tables: [
                    { tableNumber: 1, capacity: 2, isAvailable: true, location: 'indoor' },
                    { tableNumber: 2, capacity: 2, isAvailable: true, location: 'outdoor' },
                    { tableNumber: 3, capacity: 4, isAvailable: true, location: 'outdoor' },
                ],
                isFeatured: false,
                isVerified: true,
                tags: ['budget', 'quick-bites', 'vegetarian', 'street-food'],
            },
            {
                owner: restaurantOwners[2]._id,
                name: 'Punjab Da Dhaba',
                description: 'Rustic Punjabi flavors in an authentic dhaba setting. Famous for butter chicken, dal makhani, and freshly baked naans from our tandoor.',
                cuisine: ['Punjabi', 'North Indian', 'Tandoori'],
                address: { street: '56, GT Road, Model Town', city: 'Ludhiana', state: 'Punjab', zipCode: '141002' },
                location: { type: 'Point', coordinates: [75.8573, 30.9010] },
                images: ['https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800'],
                phone: '+91 161 2345 678',
                email: 'info@punjabdadhaba.in',
                rating: 4.4,
                totalReviews: 423,
                isOpen: true,
                openingHours: { open: '10:00', close: '23:30' },
                deliveryTime: { min: 25, max: 40 },
                deliveryFee: 30,
                minOrderAmount: 129,
                tables: [
                    { tableNumber: 1, capacity: 4, isAvailable: true, location: 'indoor' },
                    { tableNumber: 2, capacity: 4, isAvailable: true, location: 'outdoor' },
                    { tableNumber: 3, capacity: 6, isAvailable: true, location: 'outdoor' },
                    { tableNumber: 4, capacity: 8, isAvailable: true, location: 'outdoor' },
                ],
                isFeatured: true,
                isVerified: true,
                tags: ['dhaba', 'non-veg', 'family', 'Punjabi'],
            },
        ]);

        console.log(`✅ ${restaurants.length} restaurants seeded`);

        // =============================
        // CLOUD KITCHENS (4)
        // =============================
        const kitchens = await CloudKitchen.create([
            {
                owner: kitchenOwners[0]._id,
                name: 'FreshBowl Kitchen',
                description: 'Health-conscious meals prepared with fresh, locally sourced ingredients. Specializing in grain bowls, salads, and protein-rich combos.',
                cuisine: ['Healthy', 'Continental', 'Salads'],
                address: { street: '34, HSR Layout, Sector 2', city: 'Bengaluru', state: 'Karnataka', zipCode: '560102' },
                location: { type: 'Point', coordinates: [77.6500, 12.9116] },
                images: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'],
                phone: '+91 80 4567 8901',
                email: 'orders@freshbowl.in',
                rating: 4.4,
                totalReviews: 156,
                isOpen: true,
                operatingHours: { open: '08:00', close: '22:00' },
                deliveryTime: { min: 20, max: 35 },
                deliveryFee: 25,
                minOrderAmount: 149,
                isFeatured: true,
                isVerified: true,
                tags: ['healthy', 'fitness', 'salads', 'bowls'],
                specialities: ['Quinoa Bowls', 'Protein Wraps', 'Smoothie Bowls'],
            },
            {
                owner: kitchenOwners[0]._id,
                name: 'Wok Express',
                description: 'Indo-Chinese and Pan-Asian cuisine delivered hot and fresh. From Hakka noodles to Manchurian, we bring the wok to your doorstep.',
                cuisine: ['Chinese', 'Indo-Chinese', 'Pan-Asian'],
                address: { street: '67, Koramangala 5th Block', city: 'Bengaluru', state: 'Karnataka', zipCode: '560095' },
                location: { type: 'Point', coordinates: [77.6200, 12.9352] },
                images: ['https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800'],
                phone: '+91 80 4567 2345',
                email: 'orders@wokexpress.in',
                rating: 4.1,
                totalReviews: 234,
                isOpen: true,
                operatingHours: { open: '11:00', close: '23:30' },
                deliveryTime: { min: 25, max: 40 },
                deliveryFee: 30,
                minOrderAmount: 129,
                isFeatured: true,
                isVerified: true,
                tags: ['chinese', 'noodles', 'spicy', 'quick'],
                specialities: ['Schezwan Noodles', 'Dragon Chicken', 'Dim Sum'],
            },
            {
                owner: kitchenOwners[1]._id,
                name: 'Roti & Rice Co.',
                description: 'Homestyle Indian meals delivered daily. Wholesome thalis, comforting dals, and fresh rotis — just like ghar ka khaana.',
                cuisine: ['North Indian', 'Home Style', 'Thali'],
                address: { street: '67, Andheri East, MIDC', city: 'Mumbai', state: 'Maharashtra', zipCode: '400093' },
                location: { type: 'Point', coordinates: [72.8700, 19.1136] },
                images: ['https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800'],
                phone: '+91 22 6789 0123',
                email: 'orders@rotirice.in',
                rating: 4.3,
                totalReviews: 312,
                isOpen: true,
                operatingHours: { open: '10:00', close: '22:00' },
                deliveryTime: { min: 20, max: 35 },
                deliveryFee: 20,
                minOrderAmount: 99,
                isFeatured: false,
                isVerified: true,
                tags: ['homestyle', 'thali', 'budget', 'daily-meals'],
                specialities: ['Rajma Chawal', 'Dal Makhani Thali', 'Paneer Thali'],
            },
            {
                owner: kitchenOwners[1]._id,
                name: 'Pizza Planet',
                description: 'Artisan pizzas with desi and international toppings. Hand-tossed, stone-baked, and loaded with premium ingredients.',
                cuisine: ['Italian', 'Pizza', 'Fast Food'],
                address: { street: '22, Powai, Hiranandani', city: 'Mumbai', state: 'Maharashtra', zipCode: '400076' },
                location: { type: 'Point', coordinates: [72.9052, 19.1176] },
                images: ['https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800'],
                phone: '+91 22 6789 4567',
                email: 'orders@pizzaplanet.in',
                rating: 4.0,
                totalReviews: 178,
                isOpen: true,
                operatingHours: { open: '11:00', close: '00:00' },
                deliveryTime: { min: 30, max: 45 },
                deliveryFee: 35,
                minOrderAmount: 199,
                isFeatured: true,
                isVerified: true,
                tags: ['pizza', 'italian', 'fast-food', 'cheesy'],
                specialities: ['Tandoori Paneer Pizza', 'Chicken Tikka Pizza', 'Farmhouse Supreme'],
            },
        ]);

        console.log(`✅ ${kitchens.length} cloud kitchens seeded`);

        // =============================
        // MENU ITEMS (15+ per restaurant, varying per kitchen)
        // =============================

        // --- Spice Garden Menu ---
        const spiceGardenItems = [
            { name: 'Paneer Tikka', description: 'Marinated cottage cheese cubes grilled to perfection in tandoor', price: 279, category: 'Starters', isVeg: true, preparationTime: 15, spiceLevel: 'Medium', isBestseller: true, rating: 4.5, totalOrders: 890, restaurant: restaurants[0]._id },
            { name: 'Chicken Seekh Kebab', description: 'Minced chicken flavored with herbs and spices, grilled on skewers', price: 329, category: 'Starters', isVeg: false, preparationTime: 20, spiceLevel: 'Spicy', isBestseller: true, rating: 4.6, totalOrders: 756, restaurant: restaurants[0]._id },
            { name: 'Veg Samosa (2 pcs)', description: 'Crispy pastry filled with spiced potato and peas', price: 89, category: 'Starters', isVeg: true, preparationTime: 10, spiceLevel: 'Mild', rating: 4.2, totalOrders: 1200, restaurant: restaurants[0]._id },
            { name: 'Butter Chicken', description: 'Tender chicken in rich, creamy tomato-butter gravy', price: 349, category: 'Main Course', isVeg: false, preparationTime: 25, spiceLevel: 'Mild', isBestseller: true, rating: 4.8, totalOrders: 2340, restaurant: restaurants[0]._id },
            { name: 'Dal Makhani', description: 'Black lentils slow-cooked overnight with butter and cream', price: 249, category: 'Main Course', isVeg: true, preparationTime: 20, spiceLevel: 'Mild', isBestseller: true, rating: 4.7, totalOrders: 1567, restaurant: restaurants[0]._id },
            { name: 'Paneer Butter Masala', description: 'Soft paneer cubes in velvety tomato and cashew gravy', price: 289, category: 'Main Course', isVeg: true, preparationTime: 20, spiceLevel: 'Mild', rating: 4.5, totalOrders: 980, restaurant: restaurants[0]._id },
            { name: 'Mutton Rogan Josh', description: 'Kashmiri-style lamb curry with aromatic spices', price: 429, category: 'Main Course', isVeg: false, preparationTime: 30, spiceLevel: 'Spicy', rating: 4.6, totalOrders: 567, restaurant: restaurants[0]._id },
            { name: 'Chicken Biryani', description: 'Fragrant basmati rice layered with spiced chicken, slow-cooked dum style', price: 329, category: 'Rice & Biryani', isVeg: false, preparationTime: 30, spiceLevel: 'Medium', isBestseller: true, rating: 4.7, totalOrders: 3200, restaurant: restaurants[0]._id },
            { name: 'Veg Pulao', description: 'Aromatic basmati rice with mixed vegetables and whole spices', price: 199, category: 'Rice & Biryani', isVeg: true, preparationTime: 20, spiceLevel: 'Mild', rating: 4.1, totalOrders: 456, restaurant: restaurants[0]._id },
            { name: 'Butter Naan', description: 'Soft leavened bread brushed with butter from tandoor', price: 49, category: 'Breads', isVeg: true, preparationTime: 8, spiceLevel: 'Mild', rating: 4.4, totalOrders: 4500, restaurant: restaurants[0]._id },
            { name: 'Garlic Naan', description: 'Tandoor-baked naan topped with garlic and coriander', price: 59, category: 'Breads', isVeg: true, preparationTime: 8, spiceLevel: 'Mild', isBestseller: true, rating: 4.6, totalOrders: 3800, restaurant: restaurants[0]._id },
            { name: 'Laccha Paratha', description: 'Multi-layered flaky whole wheat paratha', price: 55, category: 'Breads', isVeg: true, preparationTime: 10, spiceLevel: 'Mild', rating: 4.3, totalOrders: 1200, restaurant: restaurants[0]._id },
            { name: 'Gulab Jamun (2 pcs)', description: 'Golden fried milk dumplings soaked in rose-flavored sugar syrup', price: 99, category: 'Desserts', isVeg: true, preparationTime: 5, spiceLevel: 'Mild', rating: 4.5, totalOrders: 890, restaurant: restaurants[0]._id },
            { name: 'Mango Lassi', description: 'Creamy yogurt blended with fresh Alphonso mango pulp', price: 129, category: 'Beverages', isVeg: true, preparationTime: 5, spiceLevel: 'Mild', rating: 4.4, totalOrders: 1560, restaurant: restaurants[0]._id },
            { name: 'Masala Chaas', description: 'Refreshing spiced buttermilk with mint and cumin', price: 69, category: 'Beverages', isVeg: true, preparationTime: 5, spiceLevel: 'Mild', rating: 4.2, totalOrders: 780, restaurant: restaurants[0]._id },
        ];

        // --- Dakshin Flavors Menu ---
        const dakshinItems = [
            { name: 'Masala Dosa', description: 'Crispy rice crepe stuffed with spiced potato masala, served with sambhar and chutney', price: 149, category: 'South Indian', isVeg: true, preparationTime: 12, spiceLevel: 'Medium', isBestseller: true, rating: 4.8, totalOrders: 4500, restaurant: restaurants[2]._id },
            { name: 'Rava Idli (4 pcs)', description: 'Soft semolina idlis tempered with mustard and cashews', price: 119, category: 'South Indian', isVeg: true, preparationTime: 10, spiceLevel: 'Mild', rating: 4.3, totalOrders: 2100, restaurant: restaurants[2]._id },
            { name: 'Medu Vada (2 pcs)', description: 'Crispy urad dal fritters served with coconut chutney and sambhar', price: 99, category: 'South Indian', isVeg: true, preparationTime: 10, spiceLevel: 'Mild', rating: 4.4, totalOrders: 1890, restaurant: restaurants[2]._id },
            { name: 'Mysore Masala Dosa', description: 'Dosa with red chutney spread and spiced potato filling', price: 169, category: 'South Indian', isVeg: true, preparationTime: 15, spiceLevel: 'Spicy', isBestseller: true, rating: 4.7, totalOrders: 3200, restaurant: restaurants[2]._id },
            { name: 'Uttapam', description: 'Thick rice pancake topped with onions, tomatoes, and green chillies', price: 139, category: 'South Indian', isVeg: true, preparationTime: 12, spiceLevel: 'Medium', rating: 4.2, totalOrders: 980, restaurant: restaurants[2]._id },
            { name: 'Kerala Fish Curry', description: 'Fresh fish in tangy coconut and tamarind gravy, Kerala style', price: 349, category: 'Main Course', isVeg: false, preparationTime: 25, spiceLevel: 'Spicy', rating: 4.6, totalOrders: 678, restaurant: restaurants[2]._id },
            { name: 'Chettinad Chicken', description: 'Fiery chicken curry from Tamil Nadu with ground spices', price: 329, category: 'Main Course', isVeg: false, preparationTime: 25, spiceLevel: 'Extra Spicy', rating: 4.5, totalOrders: 567, restaurant: restaurants[2]._id },
            { name: 'Vegetable Sambar Rice', description: 'Steamed rice with aromatic lentil and vegetable stew', price: 179, category: 'Rice & Biryani', isVeg: true, preparationTime: 15, spiceLevel: 'Medium', rating: 4.3, totalOrders: 1230, restaurant: restaurants[2]._id },
            { name: 'Curd Rice', description: 'Cooling yogurt rice tempered with mustard seeds and curry leaves', price: 129, category: 'Rice & Biryani', isVeg: true, preparationTime: 10, spiceLevel: 'Mild', rating: 4.1, totalOrders: 890, restaurant: restaurants[2]._id },
            { name: 'South Indian Thali', description: 'Complete meal with rice, sambhar, rasam, poriyal, kootu, curd, and papad', price: 249, category: 'Thali', isVeg: true, preparationTime: 20, spiceLevel: 'Medium', isBestseller: true, rating: 4.8, totalOrders: 2800, restaurant: restaurants[2]._id },
            { name: 'Non-Veg Thali', description: 'Rice, chicken curry, fish fry, sambhar, rasam, and accompaniments', price: 349, category: 'Thali', isVeg: false, preparationTime: 25, spiceLevel: 'Medium', rating: 4.6, totalOrders: 1100, restaurant: restaurants[2]._id },
            { name: 'Filter Coffee', description: 'Traditional South Indian filter coffee with chicory', price: 59, category: 'Beverages', isVeg: true, preparationTime: 5, spiceLevel: 'Mild', isBestseller: true, rating: 4.9, totalOrders: 5600, restaurant: restaurants[2]._id },
            { name: 'Payasam', description: 'Rich vermicelli kheer with cardamom, cashews, and raisins', price: 99, category: 'Desserts', isVeg: true, preparationTime: 5, spiceLevel: 'Mild', rating: 4.5, totalOrders: 780, restaurant: restaurants[2]._id },
            { name: 'Banana Bonda', description: 'Sweet ripe banana fritters dipped in batter and deep fried', price: 79, category: 'Snacks', isVeg: true, preparationTime: 10, spiceLevel: 'Mild', rating: 4.3, totalOrders: 456, restaurant: restaurants[2]._id },
            { name: 'Rasam', description: 'Hot and tangy tamarind-pepper soup, a South Indian staple', price: 69, category: 'Soups', isVeg: true, preparationTime: 8, spiceLevel: 'Spicy', rating: 4.4, totalOrders: 1340, restaurant: restaurants[2]._id },
        ];

        // --- Royal Biryani House Menu ---
        const royalBiryaniItems = [
            { name: 'Hyderabadi Chicken Dum Biryani', description: 'Authentic slow-cooked biryani with tender chicken, saffron rice, and fried onions', price: 349, category: 'Rice & Biryani', isVeg: false, preparationTime: 35, spiceLevel: 'Medium', isBestseller: true, rating: 4.9, totalOrders: 8900, restaurant: restaurants[3]._id },
            { name: 'Mutton Dum Biryani', description: 'Premium goat meat biryani cooked in sealed pot over slow fire', price: 449, category: 'Rice & Biryani', isVeg: false, preparationTime: 40, spiceLevel: 'Spicy', isBestseller: true, rating: 4.8, totalOrders: 5600, restaurant: restaurants[3]._id },
            { name: 'Veg Hyderabadi Biryani', description: 'Mixed vegetables and paneer in aromatic biryani spices', price: 249, category: 'Rice & Biryani', isVeg: true, preparationTime: 30, spiceLevel: 'Medium', rating: 4.3, totalOrders: 2300, restaurant: restaurants[3]._id },
            { name: 'Egg Biryani', description: 'Boiled eggs in rich biryani masala with fragrant rice', price: 229, category: 'Rice & Biryani', isVeg: false, preparationTime: 25, spiceLevel: 'Medium', rating: 4.2, totalOrders: 1800, restaurant: restaurants[3]._id },
            { name: 'Haleem', description: 'Slow-cooked wheat and meat stew, a Hyderabadi specialty', price: 299, category: 'Main Course', isVeg: false, preparationTime: 30, spiceLevel: 'Medium', isBestseller: true, rating: 4.7, totalOrders: 3400, restaurant: restaurants[3]._id },
            { name: 'Mirchi Ka Salan', description: 'Green chillies in tangy peanut and sesame gravy', price: 199, category: 'Main Course', isVeg: true, preparationTime: 15, spiceLevel: 'Spicy', rating: 4.4, totalOrders: 2100, restaurant: restaurants[3]._id },
            { name: 'Double Ka Meetha', description: 'Hyderabadi bread pudding infused with saffron and cardamom', price: 129, category: 'Desserts', isVeg: true, preparationTime: 10, spiceLevel: 'Mild', rating: 4.5, totalOrders: 1560, restaurant: restaurants[3]._id },
            { name: 'Lukhmi (4 pcs)', description: 'Flaky pastry filled with spiced minced meat', price: 179, category: 'Starters', isVeg: false, preparationTime: 15, spiceLevel: 'Medium', rating: 4.3, totalOrders: 890, restaurant: restaurants[3]._id },
            { name: 'Raita', description: 'Cool yogurt with cucumber, onions, and mild spices', price: 69, category: 'Starters', isVeg: true, preparationTime: 5, spiceLevel: 'Mild', rating: 4.1, totalOrders: 4500, restaurant: restaurants[3]._id },
            { name: 'Irani Chai', description: 'Classic Hyderabadi Irani chai with Osmania biscuit', price: 49, category: 'Beverages', isVeg: true, preparationTime: 5, spiceLevel: 'Mild', isBestseller: true, rating: 4.6, totalOrders: 6700, restaurant: restaurants[3]._id },
        ];

        // --- FreshBowl Kitchen Menu ---
        const freshBowlItems = [
            { name: 'Quinoa Buddha Bowl', description: 'Quinoa, avocado, chickpeas, cherry tomatoes, and tahini dressing', price: 349, category: 'Salads', isVeg: true, preparationTime: 10, spiceLevel: 'Mild', isBestseller: true, rating: 4.6, totalOrders: 1200, cloudKitchen: kitchens[0]._id },
            { name: 'Grilled Chicken Caesar Bowl', description: 'Grilled chicken, romaine, parmesan, croutons, and Caesar dressing', price: 389, category: 'Salads', isVeg: false, preparationTime: 12, spiceLevel: 'Mild', isBestseller: true, rating: 4.5, totalOrders: 980, cloudKitchen: kitchens[0]._id },
            { name: 'Protein Power Bowl', description: 'Brown rice, grilled paneer, edamame, sweet potato, and peanut sauce', price: 329, category: 'Main Course', isVeg: true, preparationTime: 15, spiceLevel: 'Mild', rating: 4.4, totalOrders: 780, cloudKitchen: kitchens[0]._id },
            { name: 'Mediterranean Wrap', description: 'Whole wheat wrap with hummus, falafel, pickled veggies, and tzatziki', price: 269, category: 'Snacks', isVeg: true, preparationTime: 10, spiceLevel: 'Mild', rating: 4.3, totalOrders: 650, cloudKitchen: kitchens[0]._id },
            { name: 'Green Detox Smoothie', description: 'Spinach, banana, almond milk, chia seeds, and honey', price: 199, category: 'Beverages', isVeg: true, preparationTime: 5, spiceLevel: 'Mild', rating: 4.5, totalOrders: 1100, cloudKitchen: kitchens[0]._id },
            { name: 'Acai Smoothie Bowl', description: 'Blended acai berries topped with granola, banana, and coconut', price: 299, category: 'Desserts', isVeg: true, preparationTime: 8, spiceLevel: 'Mild', rating: 4.4, totalOrders: 890, cloudKitchen: kitchens[0]._id },
        ];

        // --- Wok Express Menu ---
        const wokExpressItems = [
            { name: 'Veg Hakka Noodles', description: 'Stir-fried noodles with fresh vegetables and soy sauce', price: 179, category: 'Chinese', isVeg: true, preparationTime: 12, spiceLevel: 'Medium', isBestseller: true, rating: 4.3, totalOrders: 3400, cloudKitchen: kitchens[1]._id },
            { name: 'Chicken Manchurian', description: 'Crispy chicken in tangy Manchurian sauce with bell peppers', price: 269, category: 'Chinese', isVeg: false, preparationTime: 15, spiceLevel: 'Spicy', isBestseller: true, rating: 4.5, totalOrders: 2800, cloudKitchen: kitchens[1]._id },
            { name: 'Schezwan Fried Rice', description: 'Spicy Schezwan-style fried rice with vegetables', price: 199, category: 'Chinese', isVeg: true, preparationTime: 12, spiceLevel: 'Extra Spicy', rating: 4.2, totalOrders: 2100, cloudKitchen: kitchens[1]._id },
            { name: 'Dragon Chicken', description: 'Spicy crispy chicken tossed in fiery dragon sauce', price: 289, category: 'Chinese', isVeg: false, preparationTime: 18, spiceLevel: 'Extra Spicy', isBestseller: true, rating: 4.6, totalOrders: 1900, cloudKitchen: kitchens[1]._id },
            { name: 'Paneer Chilli', description: 'Crispy paneer cubes with peppers in spicy Indo-Chinese sauce', price: 229, category: 'Chinese', isVeg: true, preparationTime: 15, spiceLevel: 'Spicy', rating: 4.4, totalOrders: 1560, cloudKitchen: kitchens[1]._id },
            { name: 'Hot & Sour Soup', description: 'Classic Chinese soup with mushrooms, tofu, and bamboo shoots', price: 129, category: 'Soups', isVeg: true, preparationTime: 10, spiceLevel: 'Spicy', rating: 4.1, totalOrders: 890, cloudKitchen: kitchens[1]._id },
            { name: 'Spring Rolls (4 pcs)', description: 'Crispy rolls stuffed with cabbage, carrots, and noodles', price: 149, category: 'Starters', isVeg: true, preparationTime: 10, spiceLevel: 'Mild', rating: 4.3, totalOrders: 1200, cloudKitchen: kitchens[1]._id },
        ];

        // Create all menu items
        const allMenuItems = [
            ...spiceGardenItems,
            ...dakshinItems,
            ...royalBiryaniItems,
            ...freshBowlItems,
            ...wokExpressItems,
        ];

        const createdItems = await MenuItem.create(allMenuItems);
        console.log(`✅ ${createdItems.length} menu items seeded`);

        // Print summary
        console.log('\n📊 Seeding Summary:');
        console.log(`   Restaurants: ${restaurants.length}`);
        console.log(`   Cloud Kitchens: ${kitchens.length}`);
        console.log(`   Menu Items: ${createdItems.length}`);
        console.log('\n🍽️  Restaurants:');
        restaurants.forEach((r) => console.log(`   • ${r.name} (${r.cuisine.join(', ')}) — ${r.address.city}`));
        console.log('\n👨‍🍳 Cloud Kitchens:');
        kitchens.forEach((k) => console.log(`   • ${k.name} (${k.cuisine.join(', ')}) — ${k.address.city}`));

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    }
};

seedRestaurantsAndKitchens();
