// Test MongoDB connection
import { connect, connection, disconnect } from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testConnection() {
  try {
    console.log('🔍 Testing MongoDB connection...');
    console.log('📍 MongoDB URI:', process.env.MONGODB_URI);
    
    await connect(process.env.MONGODB_URI);
    console.log('✅ Successfully connected to MongoDB!');
    
    // Test basic operations
    const collections = await connection.db.listCollections().toArray();
    console.log('📋 Available collections:', collections.map(c => c.name));
    
    // Check connection state
    console.log('🔗 Connection state:', connection.readyState);
    console.log('📊 Database name:', connection.db.databaseName);
    
    await disconnect();
    console.log('👋 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
  }
}

testConnection();
