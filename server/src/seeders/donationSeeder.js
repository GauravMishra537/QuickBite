const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const User = require('../models/User');
const NGO = require('../models/NGO');
const Donation = require('../models/Donation');
const Restaurant = require('../models/Restaurant');
const DeliveryPartner = require('../models/DeliveryPartner');
require('dotenv').config();

const seedDonationData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected for donation seeding');

    // ─── 1. Create NGO user ───
    let ngoUser = await User.findOne({ email: 'ngo@quickbite.com' });
    if (!ngoUser) {
      ngoUser = await User.create({
        name: 'Annapurna Foundation',
        email: 'ngo@quickbite.com',
        password: 'Password@123',
        phone: '9876500001',
        role: 'ngo',
      });
      console.log('✅ NGO user created: ngo@quickbite.com / Password@123');
    } else {
      console.log('⏩ NGO user already exists');
    }

    // ─── 2. Create Delivery Partner user ───
    let deliveryUser = await User.findOne({ email: 'delivery@quickbite.com' });
    if (!deliveryUser) {
      deliveryUser = await User.create({
        name: 'Vikram Singh',
        email: 'delivery@quickbite.com',
        password: 'Password@123',
        phone: '9876500002',
        role: 'delivery',
      });
      console.log('✅ Delivery user created: delivery@quickbite.com / Password@123');
    } else {
      console.log('⏩ Delivery user already exists');
    }

    // ─── 3. Create NGO profile ───
    let ngo = await NGO.findOne({ owner: ngoUser._id });
    if (!ngo) {
      ngo = await NGO.create({
        owner: ngoUser._id,
        name: 'Annapurna Foundation',
        description: 'A non-profit organization dedicated to eliminating hunger by redistributing surplus food from restaurants to underserved communities across urban India.',
        registrationNumber: 'NGO-MH-2024-001',
        contactPerson: 'Priya Mehra',
        phone: '9876500001',
        email: 'contact@annapurna.org',
        website: 'https://annapurna.org',
        address: {
          street: '45, Station Road, Andheri West',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400058',
        },
        areasServed: ['Mumbai', 'Thane', 'Navi Mumbai', 'Pune'],
        isVerified: true,
        isActive: true,
        totalDonationsReceived: 0,
      });
      console.log('✅ NGO profile created: Annapurna Foundation');
    } else {
      console.log('⏩ NGO profile already exists');
    }

    // ─── 4. Create Delivery Partner profile ───
    let partner = await DeliveryPartner.findOne({ user: deliveryUser._id });
    if (!partner) {
      partner = await DeliveryPartner.create({
        user: deliveryUser._id,
        vehicleType: 'motorcycle',
        vehicleNumber: 'MH-02-AB-1234',
        isAvailable: true,
        rating: 4.8,
        totalDeliveries: 0,
        totalEarnings: 0,
        currentLocation: {
          type: 'Point',
          coordinates: [72.8777, 19.0760], // Mumbai
        },
      });
      console.log('✅ Delivery partner profile created: Vikram Singh');
    } else {
      console.log('⏩ Delivery partner already exists');
    }

    // ─── 5. Create surplus food donations from restaurants ───
    const restaurants = await Restaurant.find().limit(3);
    if (restaurants.length === 0) {
      console.log('⚠️ No restaurants found. Run restaurant seeder first.');
    } else {
      // Clear old donations
      await Donation.deleteMany({});
      console.log('🗑️ Cleared old donations');

      const donationData = [
        {
          restaurant: restaurants[0]._id,
          items: [
            { name: 'Dal Makhani', quantity: 15, unit: 'servings' },
            { name: 'Butter Naan', quantity: 30, unit: 'pieces' },
            { name: 'Jeera Rice', quantity: 10, unit: 'servings' },
          ],
          totalServings: 55,
          status: 'available',
          pickupAddress: {
            street: restaurants[0].address?.street || 'MG Road, Connaught Place',
            city: restaurants[0].address?.city || 'Mumbai',
            state: restaurants[0].address?.state || 'Maharashtra',
            zipCode: restaurants[0].address?.zipCode || '400001',
          },
          notes: 'Today\'s leftover lunch items. All freshly prepared today morning.',
          expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
        },
        {
          restaurant: restaurants[0]._id,
          items: [
            { name: 'Paneer Tikka', quantity: 8, unit: 'servings' },
            { name: 'Tandoori Roti', quantity: 20, unit: 'pieces' },
          ],
          totalServings: 28,
          status: 'available',
          pickupAddress: {
            street: restaurants[0].address?.street || 'MG Road',
            city: restaurants[0].address?.city || 'Mumbai',
            state: restaurants[0].address?.state || 'Maharashtra',
            zipCode: restaurants[0].address?.zipCode || '400001',
          },
          notes: 'Evening catering leftovers. Very fresh, needs to go quickly.',
          expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours
        },
      ];

      if (restaurants.length > 1) {
        donationData.push({
          restaurant: restaurants[1]._id,
          items: [
            { name: 'Biryani', quantity: 20, unit: 'servings' },
            { name: 'Raita', quantity: 20, unit: 'servings' },
            { name: 'Gulab Jamun', quantity: 25, unit: 'pieces' },
          ],
          totalServings: 65,
          status: 'available',
          pickupAddress: {
            street: restaurants[1].address?.street || 'FC Road',
            city: restaurants[1].address?.city || 'Mumbai',
            state: restaurants[1].address?.state || 'Maharashtra',
            zipCode: restaurants[1].address?.zipCode || '400001',
          },
          notes: 'Wedding party leftovers. Excellent quality food.',
          expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
        });
      }

      if (restaurants.length > 2) {
        donationData.push(
          {
            restaurant: restaurants[2]._id,
            items: [
              { name: 'Veg Pulao', quantity: 12, unit: 'servings' },
              { name: 'Mixed Veg Curry', quantity: 10, unit: 'servings' },
            ],
            totalServings: 22,
            status: 'requested',
            ngo: ngo._id,
            pickupAddress: {
              street: restaurants[2].address?.street || 'Park Street',
              city: restaurants[2].address?.city || 'Mumbai',
              state: restaurants[2].address?.state || 'Maharashtra',
              zipCode: restaurants[2].address?.zipCode || '400001',
            },
            notes: 'Corporate event leftover.',
            expiresAt: new Date(Date.now() + 5 * 60 * 60 * 1000),
          },
          {
            restaurant: restaurants[0]._id,
            items: [
              { name: 'Chole Bhature', quantity: 18, unit: 'servings' },
              { name: 'Lassi', quantity: 15, unit: 'glasses' },
            ],
            totalServings: 33,
            status: 'delivered',
            ngo: ngo._id,
            pickupAddress: {
              street: restaurants[0].address?.street || 'MG Road',
              city: restaurants[0].address?.city || 'Mumbai',
              state: restaurants[0].address?.state || 'Maharashtra',
              zipCode: restaurants[0].address?.zipCode || '400001',
            },
            notes: 'Successfully delivered to the Annapurna Foundation.',
            expiresAt: new Date(Date.now() + 10 * 60 * 60 * 1000),
          }
        );
      }

      const donations = await Donation.insertMany(donationData);
      console.log(`✅ ${donations.length} surplus food donations seeded`);

      // Update NGO total
      await NGO.findByIdAndUpdate(ngo._id, { totalDonationsReceived: 1 });
    }

    console.log('\n🎉 Donation data seeded successfully!\n');
    console.log('Demo accounts:');
    console.log('  NGO:      ngo@quickbite.com / Password@123');
    console.log('  Delivery: delivery@quickbite.com / Password@123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seedDonationData();
