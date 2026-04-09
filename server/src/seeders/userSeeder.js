const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const connectDB = require('../config/db');

dotenv.config();

const dummyUsers = [
    // ---- CUSTOMERS (5) ----
    {
        name: 'Aarav Sharma',
        email: 'aarav.sharma@gmail.com',
        password: 'Password@123',
        phone: '+91 9876543210',
        role: 'customer',
        isVerified: true,
        addresses: [
            {
                label: 'Home',
                street: '42, Sector 15, Vasant Kunj',
                city: 'New Delhi',
                state: 'Delhi',
                zipCode: '110070',
                country: 'India',
                isDefault: true,
            },
        ],
    },
    {
        name: 'Priya Patel',
        email: 'priya.patel@gmail.com',
        password: 'Password@123',
        phone: '+91 9876543211',
        role: 'customer',
        isVerified: true,
        addresses: [
            {
                label: 'Home',
                street: '15, Koramangala 4th Block',
                city: 'Bengaluru',
                state: 'Karnataka',
                zipCode: '560034',
                country: 'India',
                isDefault: true,
            },
        ],
    },
    {
        name: 'Rohan Gupta',
        email: 'rohan.gupta@gmail.com',
        password: 'Password@123',
        phone: '+91 9876543212',
        role: 'customer',
        isVerified: true,
        addresses: [
            {
                label: 'Home',
                street: '78, Bandra West, Hill Road',
                city: 'Mumbai',
                state: 'Maharashtra',
                zipCode: '400050',
                country: 'India',
                isDefault: true,
            },
        ],
    },
    {
        name: 'Ananya Reddy',
        email: 'ananya.reddy@gmail.com',
        password: 'Password@123',
        phone: '+91 9876543213',
        role: 'customer',
        isVerified: true,
        addresses: [
            {
                label: 'Home',
                street: '23, Jubilee Hills, Road No. 36',
                city: 'Hyderabad',
                state: 'Telangana',
                zipCode: '500033',
                country: 'India',
                isDefault: true,
            },
        ],
    },
    {
        name: 'Vikram Singh',
        email: 'vikram.singh@gmail.com',
        password: 'Password@123',
        phone: '+91 9876543214',
        role: 'customer',
        isVerified: true,
        addresses: [
            {
                label: 'Home',
                street: '56, Civil Lines, MG Road',
                city: 'Jaipur',
                state: 'Rajasthan',
                zipCode: '302006',
                country: 'India',
                isDefault: true,
            },
        ],
    },

    // ---- RESTAURANT OWNERS (8 — one per restaurant) ----
    {
        name: 'Rajesh Kapoor',
        email: 'rajesh.kapoor@gmail.com',
        password: 'Password@123',
        phone: '+91 9876543215',
        role: 'restaurant',
        isVerified: true,
        addresses: [
            {
                label: 'Restaurant',
                street: '12, Connaught Place',
                city: 'New Delhi',
                state: 'Delhi',
                zipCode: '110001',
                country: 'India',
                isDefault: true,
            },
        ],
    },
    {
        name: 'Meena Iyer',
        email: 'meena.iyer@gmail.com',
        password: 'Password@123',
        phone: '+91 9876543216',
        role: 'restaurant',
        isVerified: true,
        addresses: [
            {
                label: 'Restaurant',
                street: '45, MG Road, Indiranagar',
                city: 'Bengaluru',
                state: 'Karnataka',
                zipCode: '560038',
                country: 'India',
                isDefault: true,
            },
        ],
    },
    {
        name: 'Suresh Malhotra',
        email: 'suresh.malhotra@gmail.com',
        password: 'Password@123',
        phone: '+91 9876543217',
        role: 'restaurant',
        isVerified: true,
        addresses: [
            {
                label: 'Restaurant',
                street: '88, FC Road, Shivajinagar',
                city: 'Pune',
                state: 'Maharashtra',
                zipCode: '411005',
                country: 'India',
                isDefault: true,
            },
        ],
    },
    {
        name: 'Pooja Sharma',
        email: 'pooja.sharma@gmail.com',
        password: 'Password@123',
        phone: '+91 9876543230',
        role: 'restaurant',
        isVerified: true,
        addresses: [
            {
                label: 'Restaurant',
                street: '10, Park Street, Middleton Row',
                city: 'Kolkata',
                state: 'West Bengal',
                zipCode: '700016',
                country: 'India',
                isDefault: true,
            },
        ],
    },
    {
        name: 'Arjun Mehta',
        email: 'arjun.mehta@gmail.com',
        password: 'Password@123',
        phone: '+91 9876543231',
        role: 'restaurant',
        isVerified: true,
        addresses: [
            {
                label: 'Restaurant',
                street: '55, Cathedral Road, Gopalapuram',
                city: 'Chennai',
                state: 'Tamil Nadu',
                zipCode: '600086',
                country: 'India',
                isDefault: true,
            },
        ],
    },

    // Additional restaurant owners for 1:1 mapping
    {
        name: 'Deepa Mukherjee',
        email: 'deepa.mukherjee@gmail.com',
        password: 'Password@123',
        phone: '+91 9876543232',
        role: 'restaurant',
        isVerified: true,
        addresses: [{ label: 'Restaurant', street: '78, Linking Road, Bandra West', city: 'Mumbai', state: 'Maharashtra', zipCode: '400050', country: 'India', isDefault: true }],
    },
    {
        name: 'Sanjay Reddy',
        email: 'sanjay.reddy@gmail.com',
        password: 'Password@123',
        phone: '+91 9876543233',
        role: 'restaurant',
        isVerified: true,
        addresses: [{ label: 'Restaurant', street: '23, Jubilee Hills, Road No. 36', city: 'Hyderabad', state: 'Telangana', zipCode: '500033', country: 'India', isDefault: true }],
    },
    {
        name: 'Gurpreet Kaur',
        email: 'gurpreet.kaur@gmail.com',
        password: 'Password@123',
        phone: '+91 9876543234',
        role: 'restaurant',
        isVerified: true,
        addresses: [{ label: 'Restaurant', street: '56, GT Road, Model Town', city: 'Ludhiana', state: 'Punjab', zipCode: '141002', country: 'India', isDefault: true }],
    },

    // ---- CLOUD KITCHEN OWNERS (4 — one per kitchen) ----
    {
        name: 'Neha Verma',
        email: 'neha.verma@gmail.com',
        password: 'Password@123',
        phone: '+91 9876543218',
        role: 'cloudkitchen',
        isVerified: true,
        addresses: [
            {
                label: 'Kitchen',
                street: '34, HSR Layout, Sector 2',
                city: 'Bengaluru',
                state: 'Karnataka',
                zipCode: '560102',
                country: 'India',
                isDefault: true,
            },
        ],
    },
    {
        name: 'Amit Joshi',
        email: 'amit.joshi@gmail.com',
        password: 'Password@123',
        phone: '+91 9876543219',
        role: 'cloudkitchen',
        isVerified: true,
        addresses: [
            {
                label: 'Kitchen',
                street: '67, Andheri East, MIDC',
                city: 'Mumbai',
                state: 'Maharashtra',
                zipCode: '400093',
                country: 'India',
                isDefault: true,
            },
        ],
    },
    {
        name: 'Ritu Sharma',
        email: 'ritu.sharma@gmail.com',
        password: 'Password@123',
        phone: '+91 9876543235',
        role: 'cloudkitchen',
        isVerified: true,
        addresses: [{ label: 'Kitchen', street: '67, Koramangala 5th Block', city: 'Bengaluru', state: 'Karnataka', zipCode: '560095', country: 'India', isDefault: true }],
    },
    {
        name: 'Vishal Jain',
        email: 'vishal.jain@gmail.com',
        password: 'Password@123',
        phone: '+91 9876543236',
        role: 'cloudkitchen',
        isVerified: true,
        addresses: [{ label: 'Kitchen', street: '22, Powai, Hiranandani', city: 'Mumbai', state: 'Maharashtra', zipCode: '400076', country: 'India', isDefault: true }],
    },

    // ---- GROCERY SHOP OWNERS (2) ----
    {
        name: 'Kavitha Nair',
        email: 'kavitha.nair@gmail.com',
        password: 'Password@123',
        phone: '+91 9876543220',
        role: 'grocery',
        isVerified: true,
        addresses: [
            {
                label: 'Shop',
                street: '19, Anna Salai, Teynampet',
                city: 'Chennai',
                state: 'Tamil Nadu',
                zipCode: '600018',
                country: 'India',
                isDefault: true,
            },
        ],
    },
    {
        name: 'Deepak Agarwal',
        email: 'deepak.agarwal@gmail.com',
        password: 'Password@123',
        phone: '+91 9876543221',
        role: 'grocery',
        isVerified: true,
        addresses: [
            {
                label: 'Shop',
                street: '23, Hazratganj, Central Market',
                city: 'Lucknow',
                state: 'Uttar Pradesh',
                zipCode: '226001',
                country: 'India',
                isDefault: true,
            },
        ],
    },

    // ---- NGO REPRESENTATIVES (1) ----
    {
        name: 'Sunita Devi',
        email: 'sunita.devi@gmail.com',
        password: 'Password@123',
        phone: '+91 9876543222',
        role: 'ngo',
        isVerified: true,
        addresses: [
            {
                label: 'NGO Office',
                street: '5, Lodhi Road, Institutional Area',
                city: 'New Delhi',
                state: 'Delhi',
                zipCode: '110003',
                country: 'India',
                isDefault: true,
            },
        ],
    },

    // ---- DELIVERY PARTNERS (2) ----
    {
        name: 'Ravi Kumar',
        email: 'ravi.kumar@gmail.com',
        password: 'Password@123',
        phone: '+91 9876543223',
        role: 'delivery',
        isVerified: true,
        addresses: [
            {
                label: 'Home',
                street: '102, Laxmi Nagar, Near Metro Station',
                city: 'New Delhi',
                state: 'Delhi',
                zipCode: '110092',
                country: 'India',
                isDefault: true,
            },
        ],
    },
    {
        name: 'Manoj Tiwari',
        email: 'manoj.tiwari@gmail.com',
        password: 'Password@123',
        phone: '+91 9876543224',
        role: 'delivery',
        isVerified: true,
        addresses: [
            {
                label: 'Home',
                street: '44, Whitefield, Kadugodi',
                city: 'Bengaluru',
                state: 'Karnataka',
                zipCode: '560066',
                country: 'India',
                isDefault: true,
            },
        ],
    },

    // ---- ADMIN (1) ----
    {
        name: 'Admin QuickBite',
        email: 'admin@quickbite.com',
        password: 'Admin@123',
        phone: '+91 9876543200',
        role: 'admin',
        isVerified: true,
        addresses: [
            {
                label: 'Office',
                street: '1, Cyber City, DLF Phase 2',
                city: 'Gurugram',
                state: 'Haryana',
                zipCode: '122002',
                country: 'India',
                isDefault: true,
            },
        ],
    },
];

const seedUsers = async () => {
    try {
        await connectDB();

        // Clear existing users
        await User.deleteMany({});
        console.log('🗑️  Existing users cleared');

        // Insert dummy users
        const createdUsers = await User.create(dummyUsers);
        console.log(`✅ ${createdUsers.length} dummy users seeded successfully!\n`);

        // Print summary
        const roleCounts = {};
        createdUsers.forEach((user) => {
            roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
        });
        console.log('📊 Users by role:');
        Object.entries(roleCounts).forEach(([role, count]) => {
            console.log(`   ${role}: ${count}`);
        });

        console.log('\n📧 Login credentials (all passwords: Password@123, admin: Admin@123)');
        createdUsers.forEach((user) => {
            console.log(`   [${user.role}] ${user.name} — ${user.email}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    }
};

seedUsers();
