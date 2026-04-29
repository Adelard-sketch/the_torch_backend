/**
 * Seed Admin Account
 * Run with: node seed-admin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

const ADMIN_ACCOUNT = {
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@farmdialogue.com',
  phone: '+233200000000',
  role: 'farmer', 
  password: 'admin123456', 
  isVerified: true,
  isActive: true
};

async function seedAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_ACCOUNT.email });
    
    if (existingAdmin) {
      console.log('Admin account already exists!');
      console.log('Email:', ADMIN_ACCOUNT.email);
      console.log('Use your existing password to login');
      process.exit(0);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(ADMIN_ACCOUNT.password, 10);

    // Create admin user
    const admin = await User.create({
      firstName: ADMIN_ACCOUNT.firstName,
      lastName: ADMIN_ACCOUNT.lastName,
      email: ADMIN_ACCOUNT.email,
      phone: ADMIN_ACCOUNT.phone,
      role: ADMIN_ACCOUNT.role,
      passwordHash,
      isVerified: ADMIN_ACCOUNT.isVerified,
      isActive: ADMIN_ACCOUNT.isActive
    });

    console.log('\nAdmin account created successfully!');
    console.log('\nAdmin Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    ', ADMIN_ACCOUNT.email);
    console.log('Password: ', ADMIN_ACCOUNT.password);
    console.log('Role:     ', ADMIN_ACCOUNT.role);
    console.log('User ID:  ', admin._id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\nIMPORTANT: Change this password after first login!');
    console.log('🌐 Login at: http://localhost:5500/pages/login.html\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin account:', error.message);
    process.exit(1);
  }
}

// Run the seed function
seedAdmin();
