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

    const parsedQty = parseFloat(quantity);
    const parsedPrice = parseFloat(expectedPrice);
    if (isNaN(parsedQty) || parsedQty <= 0 || isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity and price must be valid positive numbers greater than 0' });
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

// @desc    Get all active produce listings with server-side filtering, indexing & pagination
// @route   GET /api/produce
// @access  Public
const getListings = async (req, res) => {
  try {
    const { grade, hexZone, search, minQuantity, maxPrice, sortBy, page, limit } = req.query;

    const query = { status: 'Available' };

    if (grade) {
      query['aiGrading.grade'] = grade;
    }

    if (hexZone) {
      query.hexZone = hexZone;
    }

    if (search) {
      const q = search.trim();
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { farmerName: { $regex: q, $options: 'i' } }
      ];
    }

    if (minQuantity) {
      const parsedMin = parseFloat(minQuantity);
      if (!isNaN(parsedMin)) query.quantity = { $gte: parsedMin };
    }

    if (maxPrice) {
      const parsedMax = parseFloat(maxPrice);
      if (!isNaN(parsedMax)) query.discountedPrice = { $lte: parsedMax };
    }

    // Server-side database sort mapping
    let sortObj = { createdAt: -1 };
    if (sortBy === 'urgency') {
      sortObj = { urgencyScore: -1, createdAt: -1 };
    } else if (sortBy === 'price_low') {
      sortObj = { discountedPrice: 1 };
    } else if (sortBy === 'quantity_high') {
      sortObj = { quantity: -1 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;

    const { docs, total, totalPages } = await db.findPaged('produce', query, {
      page: pageNum,
      limit: limitNum,
      sort: sortObj
    });

    res.status(200).json({
      success: true,
      count: docs.length,
      total,
      page: pageNum,
      totalPages,
      data: docs
    });
  } catch (error) {
    console.error('Fetch listings error:', error);
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
