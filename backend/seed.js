const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
const { getDefaultProducts } = require('./data/defaultProducts');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not set. Configure it in backend/.env');
    }

    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  await connectDB();

  try {
    // Clear existing data
    await Product.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user (password is hashed by the User pre-save hook).
    const admin = new User({
      name: 'Admin User',
      email: 'admin@muwasdistilling.ug',
      password: 'admin123',
      role: 'admin',
      isApproved: true
    });
    await admin.save();
    console.log('Created admin user');

    const products = getDefaultProducts();

    await Product.insertMany(products);
    console.log(`Created ${products.length} products`);

    console.log('\n✅ Database seeded successfully!');
    console.log('📧 Admin login: admin@muwasdistilling.ug / admin123');
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

seedData();
