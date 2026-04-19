/**
 * Migration: Add security questions & answers to existing users
 * Run: node server/src/seeders/addSecurityQuestions.js
 * This does NOT delete any data — it only updates users missing securityQuestion.
 */
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const connectDB = require('../config/db');

dotenv.config();

// Map of email → { question, answer }
const securityData = {
  'aarav.sharma@gmail.com': { q: 'What is your favourite food?', a: 'butter chicken' },
  'priya.patel@gmail.com': { q: 'What is the name of your first pet?', a: 'bruno' },
  'rohan.gupta@gmail.com': { q: 'What city were you born in?', a: 'mumbai' },
  'ananya.reddy@gmail.com': { q: "What is your mother's maiden name?", a: 'lakshmi' },
  'vikram.singh@gmail.com': { q: 'What is your favourite cricket team?', a: 'rajasthan royals' },
  'rajesh.kapoor@gmail.com': { q: 'What was your first car?', a: 'maruti 800' },
  'meena.iyer@gmail.com': { q: 'What is your favourite book?', a: 'the god of small things' },
  'suresh.malhotra@gmail.com': { q: 'What is your childhood nickname?', a: 'suri' },
  'pooja.sharma@gmail.com': { q: 'What is the name of your school?', a: 'st xaviers' },
  'arjun.mehta@gmail.com': { q: 'What is the name of your favourite restaurant?', a: 'dakshin' },
  'deepa.mukherjee@gmail.com': { q: 'What is your favourite movie?', a: 'ddlj' },
  'sanjay.reddy@gmail.com': { q: 'What is your favourite colour?', a: 'green' },
  'gurpreet.kaur@gmail.com': { q: 'What is the name of your hometown?', a: 'amritsar' },
  'neha.verma@gmail.com': { q: 'What is your favourite dessert?', a: 'gulab jamun' },
  'amit.joshi@gmail.com': { q: 'What street did you grow up on?', a: 'carter road' },
  'ritu.sharma@gmail.com': { q: 'What is the name of your best friend?', a: 'meera' },
  'vishal.jain@gmail.com': { q: 'What is your lucky number?', a: '7' },
  'kavitha.nair@gmail.com': { q: 'What is your favourite festival?', a: 'pongal' },
  'deepak.agarwal@gmail.com': { q: 'What is the name of your first employer?', a: 'reliance' },
  'sunita.devi@gmail.com': { q: 'What is your life motto?', a: 'seva hi dharm' },
  'ravi.kumar@gmail.com': { q: 'What is your vehicle brand?', a: 'honda' },
  'manoj.tiwari@gmail.com': { q: "What is the name of your favourite teacher?", a: 'sharma sir' },
  'admin@quickbite.com': { q: 'What is the founding year of QuickBite?', a: '2024' },
};

const migrate = async () => {
  try {
    await connectDB();
    const salt = await bcrypt.genSalt(10);
    let updated = 0;

    for (const [email, { q, a }] of Object.entries(securityData)) {
      const user = await User.findOne({ email });
      if (!user) {
        console.log(`⚠️  User not found: ${email}`);
        continue;
      }
      if (user.securityQuestion) {
        console.log(`⏭️  Already has question: ${email}`);
        continue;
      }
      user.securityQuestion = q;
      user.securityAnswer = await bcrypt.hash(a.toLowerCase().trim(), salt);
      await user.save({ validateBeforeSave: false });
      updated++;
      console.log(`✅ Updated: ${email}`);
    }

    console.log(`\n🎉 Migration complete! ${updated} users updated.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
};

migrate();
