const db = require('../config/db');
const { gradeProduceWithAI } = require('../config/gemini');

// Helper to convert geographic coordinates to a hexagonal zone (axial coordinate system)
function calculateHexZone(latitude, longitude) {
  const lat = parseFloat(latitude) || 20.5937;
  const lng = parseFloat(longitude) || 78.9629;
  const scale = 0.08; // Roughly 8-10 km radius per hexagon

  // Convert lat/lng to axial hexagonal grid coordinate system
  const q = Math.round((Math.sqrt(3)/3 * lat - 1/3 * lng) / scale);
  const r = Math.round((2/3 * lng) / scale);

  return `HEX-${q}_${r}`;
}

// Helper to check produce freshness and calculate an urgency sorting weight
// Older harvests are prioritized (ranked higher) but expired/rotten have low priority for buyers
function calculateUrgencyWeight(harvestDateStr, grade) {
  const harvestDate = new Date(harvestDateStr);
  const now = new Date();
  const diffDays = Math.max(0, (now - harvestDate) / (1000 * 60 * 60 * 24));

  if (grade === 'Rotten/Unusable') return 0; // Redirected instantly, no urgency queue

  // We want older harvests to rise to the top but within safe freshness limit (e.g. 7 days)
  let baseScore = diffDays * 15; // 15 points per day old
  
  if (grade === 'Grade C') {
    baseScore += 30; // Grade C is closer to expiry, give higher listing weight
  }

  return Math.min(100, Math.round(baseScore));
}

// @desc    Create new produce listing with AI grading
// @route   POST /api/produce
// @access  Private (Farmer only)
const createProduce = async (req, res) => {
  try {
    const { name, quantity, expectedPrice, harvestDate, location, qualityNotes } = req.body;

    if (!name || !quantity || !expectedPrice || !harvestDate || !location) {
      return res.status(400).json({ success: false, message: 'Please provide name, quantity, price, harvest date, and location' });
    }

    let locationObj = location;
    if (typeof location === 'string') {
      try {
        locationObj = JSON.parse(location);
      } catch (e) {
        return res.status(400).json({ success: false, message: 'Location must be a valid JSON object containing address, latitude, longitude' });
      }
    }

    if (!locationObj.latitude || !locationObj.longitude) {
      return res.status(400).json({ success: false, message: 'Location must include latitude and longitude coordinates' });
    }

    // Process image with Gemini API (or simulate fallback)
    let aiGrading = {
      grade: 'Grade B',
      confidence: 0.9,
      description: 'Misshapen with minor surface blemishes, but highly fresh inside. Ideal for restaurant cooking.',
      defects: ['Surface marks', 'Shape asymmetry'],
      suggestedPriceDiscountPercentage: 30,
      recommendation: 'Secondary Food Buyer Match',
      keyMetrics: { freshness: 85, appearance: 60, edibility: 100 }
    };

    if (req.file) {
      aiGrading = await gradeProduceWithAI(
        req.file.buffer,
        req.file.mimetype,
        name,
        qualityNotes || ""
      );
    } else {
      // Fallback smart grading if no file is provided
      aiGrading = await gradeProduceWithAI(
        null,
        null,
        name,
        qualityNotes || ""
      );
    }

    const hexZone = calculateHexZone(locationObj.latitude, locationObj.longitude);
    const urgencyScore = calculateUrgencyWeight(harvestDate, aiGrading.grade);

    // Save Produce Listing
    const newProduce = await db.insertOne('produce', {
      farmerId: req.user.id,
      farmerName: req.user.name,
      name,
      quantity: parseFloat(quantity), // in kg
      originalPrice: parseFloat(expectedPrice),
      // Apply recommended discount if Grade B or C
      discountedPrice: parseFloat(expectedPrice) * (1 - (aiGrading.suggestedPriceDiscountPercentage / 100)),
      harvestDate,
      location: locationObj,
      hexZone,
      qualityNotes: qualityNotes || '',
      aiGrading,
      urgencyScore,
      status: aiGrading.grade === 'Rotten/Unusable' ? 'Redirected' : 'Available',
      buyerId: null,
      orderId: null,
      imageUrl: req.file ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` : null
    });

    // Update Farmer's Sustainability Score and Leaderboard
    let pointsAwarded = 20; // base points
    if (aiGrading.grade === 'Grade B') pointsAwarded = 50;
    else if (aiGrading.grade === 'Grade C') pointsAwarded = 80;
    else if (aiGrading.grade === 'Rotten/Unusable') pointsAwarded = 100;

    await db.updateUserScore(req.user.id, req.user.name, 'farmer', pointsAwarded);

    // If rotten/unusable, instantly log organic waste analytics and return
    if (aiGrading.grade === 'Rotten/Unusable') {
      await db.updateGlobalAnalytics(parseFloat(quantity), true);
    }

    res.status(201).json({
      success: true,
      message: 'Produce listed successfully with AI grading analysis!',
      data: newProduce
    });

  } catch (error) {
    console.error('Create produce error:', error);
    res.status(500).json({ success: false, message: 'Server error listing produce' });
  }
};

// @desc    Get all active produce listings
// @route   GET /api/produce
// @access  Public
const getListings = async (req, res) => {
  try {
    const { grade, hexZone, search, minQuantity, maxPrice, sortBy } = req.query;
    let listings = await db.getCollection('produce');

    // Filter available ones only
    listings = listings.filter(item => item.status === 'Available');

    // Filter by grade
    if (grade) {
      listings = listings.filter(item => item.aiGrading.grade === grade);
    }

    // Filter by Zone
    if (hexZone) {
      listings = listings.filter(item => item.hexZone === hexZone);
    }

    // Filter by name search
    if (search) {
      const q = search.toLowerCase();
      listings = listings.filter(item => item.name.toLowerCase().includes(q) || item.farmerName.toLowerCase().includes(q));
    }

    // Filter by min quantity
    if (minQuantity) {
      listings = listings.filter(item => item.quantity >= parseFloat(minQuantity));
    }

    // Filter by max price
    if (maxPrice) {
      listings = listings.filter(item => item.discountedPrice <= parseFloat(maxPrice));
    }

    // Sorting options
    if (sortBy === 'urgency') {
      // Prioritize oldest/highest urgency score
      listings.sort((a, b) => b.urgencyScore - a.urgencyScore);
    } else if (sortBy === 'price_low') {
      listings.sort((a, b) => a.discountedPrice - b.discountedPrice);
    } else if (sortBy === 'quantity_high') {
      listings.sort((a, b) => b.quantity - a.quantity);
    } else {
      // Default: newest listed first
      listings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching listings' });
  }
};

// @desc    Get single produce details
// @route   GET /api/produce/:id
// @access  Public
const getProduceDetails = async (req, res) => {
  try {
    const produce = await db.findOne('produce', { id: req.params.id });
    if (!produce) {
      return res.status(404).json({ success: false, message: 'Produce listing not found' });
    }
    res.status(200).json({ success: true, data: produce });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete produce listing
// @route   DELETE /api/produce/:id
// @access  Private (Farmer only)
const deleteProduce = async (req, res) => {
  try {
    const produce = await db.findOne('produce', { id: req.params.id });
    if (!produce) {
      return res.status(404).json({ success: false, message: 'Produce not found' });
    }

    if (produce.farmerId !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this listing' });
    }

    await db.deleteOne('produce', { id: req.params.id });
    res.status(200).json({ success: true, message: 'Listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createProduce,
  getListings,
  getProduceDetails,
  deleteProduce
};
