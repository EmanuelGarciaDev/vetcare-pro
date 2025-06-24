// Script to create test users for the VetCare Pro application
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// User Schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['Customer', 'Vet', 'Admin'],
    default: 'Customer',
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true,
    maxlength: 500
  },
  emailVerified: {
    type: Date,
    default: Date.now
  },
  image: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);

const testUsers = [
  {
    name: 'John Smith',
    email: 'user1@example.com',
    password: 'password123',
    role: 'Customer',
    phone: '+1 (555) 123-4567',
    address: '123 Main Street, Springfield, IL 62701'
  },
  {
    name: 'Sarah Johnson',
    email: 'user2@example.com',
    password: 'password123',
    role: 'Customer',
    phone: '+1 (555) 234-5678',
    address: '456 Oak Avenue, Springfield, IL 62702'
  },
  {
    name: 'Michael Chen',
    email: 'user3@example.com',
    password: 'password123',
    role: 'Customer',
    phone: '+1 (555) 345-6789',
    address: '789 Pine Road, Springfield, IL 62703'
  },
  {
    name: 'Emily Rodriguez',
    email: 'user4@example.com',
    password: 'password123',
    role: 'Customer',
    phone: '+1 (555) 456-7890',
    address: '321 Elm Street, Springfield, IL 62704'
  },
  {
    name: 'David Wilson',
    email: 'user5@example.com',
    password: 'password123',
    role: 'Customer',
    phone: '+1 (555) 567-8901',
    address: '654 Maple Drive, Springfield, IL 62705'
  }
];

async function createTestUsers() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    console.log('🔍 Checking existing test users...');
    
    for (const userData of testUsers) {
      try {
        // Check if user already exists
        const existingUser = await UserModel.findOne({ email: userData.email });
        
        if (existingUser) {
          console.log(`⚠️  User ${userData.email} already exists, skipping...`);
          continue;
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        
        // Create the user
        const user = new UserModel({
          ...userData,
          password: hashedPassword,
          emailVerified: new Date()
        });

        await user.save();
        console.log(`✅ Created test user: ${userData.email} (${userData.name})`);
      } catch (error) {
        console.error(`❌ Error creating user ${userData.email}:`, error.message);
      }
    }

    console.log('\n🎉 Test user creation completed!');
    console.log('\n📋 Available test users:');
    testUsers.forEach(user => {
      console.log(`   • ${user.email} - Password: ${user.password} (${user.name})`);
    });

    console.log('\n🔐 You can now log in with any of these credentials in the VetCare Pro application.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
createTestUsers().catch(console.error);
