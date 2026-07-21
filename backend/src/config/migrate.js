require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set in environment variables!');
  process.exit(1);
}

const DB_FILE = path.join(__dirname, '..', '..', 'data', 'db.json');

async function migrate() {
  console.log('Starting AgroBridge Data Migration to MongoDB Atlas...');

  if (!fs.existsSync(DB_FILE)) {
    console.error(`db.json file not found at: ${DB_FILE}`);
    process.exit(1);
  }

  let localData;
  try {
    const rawData = fs.readFileSync(DB_FILE, 'utf8');
    localData = JSON.parse(rawData);
    console.log('Successfully read legacy db.json file.');
  } catch (error) {
    console.error('Failed to read or parse db.json:', error);
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db();
    console.log('Connected to MongoDB Atlas cluster.');

    // 1. Migrate Users
    if (localData.users && localData.users.length > 0) {
      console.log(`Migrating ${localData.users.length} users...`);
      await db.collection('users').deleteMany({});
      await db.collection('users').insertMany(localData.users);
      console.log('Users migrated successfully.');
    }

    // 2. Migrate Produce Listings
    if (localData.produce && localData.produce.length > 0) {
      console.log(`Migrating ${localData.produce.length} produce listings...`);
      await db.collection('produce').deleteMany({});
      await db.collection('produce').insertMany(localData.produce);
      console.log('Produce listings migrated successfully.');
    }

    // 3. Migrate Orders
    if (localData.orders && localData.orders.length > 0) {
      console.log(`Migrating ${localData.orders.length} orders...`);
      await db.collection('orders').deleteMany({});
      await db.collection('orders').insertMany(localData.orders);
      console.log('Orders migrated successfully.');
    }

    // 4. Migrate Messages
    if (localData.messages && localData.messages.length > 0) {
      console.log(`Migrating ${localData.messages.length} messages...`);
      await db.collection('messages').deleteMany({});
      await db.collection('messages').insertMany(localData.messages);
      console.log('Messages migrated successfully.');
    }

    // 5. Migrate Sustainability global analytics
    if (localData.sustainability) {
      console.log('Migrating sustainability metrics and leaderboard...');
      await db.collection('sustainability').deleteMany({});
      await db.collection('sustainability').insertOne(localData.sustainability);
      console.log('Sustainability stats migrated successfully.');
    }

    console.log('\n===================================================');
    console.log('Migration Completed Successfully!');
    console.log('AgroBridge has been fully migrated to MongoDB Atlas!');
    console.log('=======================================================\n');

  } catch (error) {
    console.error('Critical error during migration:', error);
  } finally {
    await client.close();
    console.log('Closed connection to MongoDB cluster.');
  }
}

migrate();
