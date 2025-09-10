const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createTestUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/oral-health-app');
    
    // Create admin user
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('Admin user created');
    }

    // Create patient user
    const patientExists = await User.findOne({ email: 'patient@example.com' });
    if (!patientExists) {
      await User.create({
        name: 'Patient User',
        email: 'patient@example.com',
        password: 'patient123',
        role: 'patient'
      });
      console.log('Patient user created');
    }

    console.log('Test users setup complete');
    process.exit(0);
  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
};

createTestUsers();