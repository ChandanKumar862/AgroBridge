const path = require('path');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

// Ensure environment variables are loaded
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

let client = null;
let db = null;

async function connectDB() {
  if (db) return db;
  
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    const errorMsg = 'MONGODB_URI is not defined in environment variables (.env)! Please set MONGODB_URI in your .env file.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  try {
    if (!client) {
      client = new MongoClient(MONGODB_URI);
    }
    await client.connect();
    db = client.db();
    if (!db.databaseName || db.databaseName === 'test') {
      db = client.db('agrobridge');
    }
    console.log(`Successfully connected to MongoDB (${db.databaseName})`);
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

// Default empty structure for sustainability metrics
const defaultSustainability = {
  totalWastePrevented: 0,
  co2Reduced: 0,
  waterSaved: 0,
  leaderboard: []
};

class MongoDBDatabase {
  constructor() {
    this.initPromise = this.init();
  }

  async init() {
    try {
      await connectDB();
    } catch (error) {
      console.error('Error during database connection:', error);
    }
  }

  // Generic Collection CRUD Operations
  async getCollection(name) {
    await this.initPromise;
    const dbInstance = await connectDB();
    return await dbInstance.collection(name).find({}).toArray();
  }

  async find(collectionName, query = {}) {
    await this.initPromise;
    const dbInstance = await connectDB();
    return await dbInstance.collection(collectionName).find(query).toArray();
  }

  async findOne(collectionName, query = {}) {
    await this.initPromise;
    const dbInstance = await connectDB();
    return await dbInstance.collection(collectionName).findOne(query);
  }

  async insertOne(collectionName, document) {
    await this.initPromise;
    const dbInstance = await connectDB();
    const newDoc = {
      id: document.id || (collectionName.slice(0, 3) + '-' + Math.random().toString(36).substr(2, 9)),
      ...document,
      createdAt: document.createdAt || new Date().toISOString()
    };
    await dbInstance.collection(collectionName).insertOne(newDoc);
    return newDoc;
  }

  async updateOne(collectionName, query = {}, updates = {}) {
    await this.initPromise;
    const dbInstance = await connectDB();
    const result = await dbInstance.collection(collectionName).updateOne(query, { $set: updates });
    return result.modifiedCount > 0 || result.matchedCount > 0;
  }

  async deleteOne(collectionName, query = {}) {
    await this.initPromise;
    const dbInstance = await connectDB();
    const result = await dbInstance.collection(collectionName).deleteOne(query);
    return result.deletedCount > 0;
  }

  // Custom aggregations for analytics
  async getGlobalAnalytics() {
    await this.initPromise;
    const dbInstance = await connectDB();
    const doc = await dbInstance.collection('sustainability').findOne({});
    return doc || defaultSustainability;
  }

  async updateGlobalAnalytics(wasteAmount, isCompost = false) {
    await this.initPromise;
    const dbInstance = await connectDB();
    let doc = await dbInstance.collection('sustainability').findOne({});
    if (!doc) {
      doc = { ...defaultSustainability };
      await dbInstance.collection('sustainability').insertOne(doc);
    }

    const totalWastePrevented = (doc.totalWastePrevented || 0) + wasteAmount;
    const co2Reduced = (doc.co2Reduced || 0) + Math.round(wasteAmount * 1.9); // 1.9 kg CO2 per kg prevented
    const waterSaved = (doc.waterSaved || 0) + Math.round(wasteAmount * 700);  // 700L per kg average saved

    await dbInstance.collection('sustainability').updateOne({}, {
      $set: {
        totalWastePrevented,
        co2Reduced,
        waterSaved
      }
    });

    return {
      ...doc,
      totalWastePrevented,
      co2Reduced,
      waterSaved
    };
  }

  // Update a user's leaderboard score
  async updateUserScore(userId, name, role, points) {
    await this.initPromise;
    const dbInstance = await connectDB();
    let doc = await dbInstance.collection('sustainability').findOne({});
    if (!doc) {
      doc = { ...defaultSustainability };
      await dbInstance.collection('sustainability').insertOne(doc);
    }
    if (!doc.leaderboard) doc.leaderboard = [];

    const existing = doc.leaderboard.find(item => item.id === userId);
    if (existing) {
      existing.score += points;
      // Recalculate badge
      if (existing.score > 800) existing.badge = "Eco Guardian";
      else if (existing.score > 500) existing.badge = "Soil Master";
      else if (existing.score > 250) existing.badge = "Waste Warrior";
    } else {
      let badge = "Green Seedling";
      if (points > 800) badge = "Eco Guardian";
      else if (points > 500) badge = "Soil Master";
      else if (points > 250) badge = "Waste Warrior";

      doc.leaderboard.push({
        id: userId,
        name: name,
        role: role,
        score: points,
        badge: badge
      });
    }

    // Sort leaderboard desc
    doc.leaderboard.sort((a, b) => b.score - a.score);

    await dbInstance.collection('sustainability').updateOne({}, {
      $set: { leaderboard: doc.leaderboard }
    });
  }
}

module.exports = new MongoDBDatabase();
