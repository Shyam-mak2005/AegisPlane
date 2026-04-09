import mongoose from 'mongoose';

const MONGO_URI = 'mongodb://localhost:27017/aegisplane';

async function resetAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✓ Connected to MongoDB');

    const result = await mongoose.connection.collection('users').deleteMany({ 
      $or: [
        { email: 'admin@aegisplane.dev' },
        { email: 'tenant.admin@aegisplane.dev' },
        { email: 'operator@aegisplane.dev' }
      ]
    });
    
    console.log(`✓ Deleted ${result.deletedCount} user(s)`);
    
    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

resetAdmin();
