const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection - Charger depuis .env.local
require('dotenv').config({ path: '.env.local' });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://dbEzia:rZ1F0nmypcXvczLn@cluster0.qfdtka1.mongodb.net/ezia?retryWrites=true&w=majority';

// User schema
const userSchema = new mongoose.Schema({
  email: String,
  username: String,
  password: String,
  fullName: String,
  avatarUrl: String,
  role: String,
  isEmailVerified: Boolean,
  businesses: [mongoose.Schema.Types.ObjectId],
  projects: [mongoose.Schema.Types.ObjectId],
  subscription: {
    plan: String,
    validUntil: Date,
  },
  lastLoginAt: Date,
}, {
  timestamps: true,
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function createTestUser() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if test user exists
    const existingUser = await User.findOne({ email: 'test@ezia.ai' });
    if (existingUser) {
      console.log('Test user already exists');
      process.exit(0);
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('test123', 10);
    const testUser = new User({
      email: 'test@ezia.ai',
      username: 'testuser',
      password: hashedPassword,
      fullName: 'Test User',
      avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=testuser',
      role: 'user',
      isEmailVerified: true,
      businesses: [],
      projects: [],
      subscription: {
        plan: 'free',
      },
    });

    await testUser.save();
    console.log('Test user created successfully!');
    console.log('Email: test@ezia.ai');
    console.log('Password: test123');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createTestUser();