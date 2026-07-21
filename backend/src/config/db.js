const { MongoClient } = require('mongodb');

// Ensure MONGODB_URI is set
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set in environment variables!');
  process.exit(1);
}

const client = new MongoClient(MONGODB_URI);
let db = null;

async function connectDB() {
  if (db) return db;
  try {
    await client.connect();
    db = client.db();
    console.log('Successfully connected to MongoDB Atlas cluster');
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

// Initial DB structure for self-initialization if empty
const initialSchema = {
  users: [
    {
      id: "admin-123",
      name: "AgroBridge Admin",
      email: "admin@agrobridge.com",
      password: "$2a$10$rUjVj14X7LymE1LqjC3sDeL1t1B7256V9nI/o0.c2z6qXhGgN3uWy", // bcrypt for 'admin123'
      role: "admin",
      verified: true,
      createdAt: new Date().toISOString()
    }
  ],
  produce: [],
  orders: [],
  messages: [],
  sustainability: {
    totalWastePrevented: 14250, // in kg
    co2Reduced: 27075, // in kg (1.9 kg CO2 per kg food saved)
    waterSaved: 9975000, // in Litres (approx 700L per kg produce)
    leaderboard: [
      { id: "lead-1", name: "Ramesh Kumar", role: "farmer", score: 850, badge: "Eco Guardian" },
      { id: "lead-2", name: "Green Earth Compost", role: "compost", score: 720, badge: "Soil Master" },
      { id: "lead-3", name: "Vikas Patil", role: "farmer", score: 680, badge: "Waste Warrior" },
      { id: "lead-4", name: "Taj Regency Hotel", role: "buyer", score: 610, badge: "Green Gastronomy" },
      { id: "lead-5", name: "Happy Paws Sanctuary", role: "animal_care", score: 540, badge: "Animal Ally" }
    ]
  }
};

class MongoDBDatabase {
  constructor() {
    this.initPromise = this.init();
  }

  async init() {
    try {
      const dbInstance = await connectDB();
      
      // Self-initialize if users or sustainability collection is empty
      const usersCount = await dbInstance.collection('users').countDocuments();
      if (usersCount === 0) {
        console.log('Database is empty, initializing default users schema...');
        await dbInstance.collection('users').insertMany(initialSchema.users);
      }

      const sustainabilityCount = await dbInstance.collection('sustainability').countDocuments();
      if (sustainabilityCount === 0) {
        console.log('Initializing default sustainability analytics schema...');
        await dbInstance.collection('sustainability').insertOne(initialSchema.sustainability);
      }
    } catch (error) {
      console.error('Error during database initialization:', error);
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
    return doc || initialSchema.sustainability;
  }

  async updateGlobalAnalytics(wasteAmount, isCompost = false) {
    await this.initPromise;
    const dbInstance = await connectDB();
    let doc = await dbInstance.collection('sustainability').findOne({});
    if (!doc) {
      doc = { ...initialSchema.sustainability };
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
      doc = { ...initialSchema.sustainability };
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
