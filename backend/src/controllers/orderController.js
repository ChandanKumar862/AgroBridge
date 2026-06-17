const db = require('../config/db');

// @desc    Create a new produce purchase order (with mock Razorpay and Wallet fallback)
// @route   POST /api/orders
// @access  Private (Buyer, Animal Care, Compost only)
const createOrder = async (req, res) => {
  try {
    const { produceId, paymentMethod, deliveryDetails } = req.body;

    if (!produceId || !deliveryDetails) {
      return res.status(400).json({ success: false, message: 'Please provide produce ID and delivery details' });
    }

    // Find produce listing
    const produce = await db.findOne('produce', { id: produceId });
    if (!produce) {
      return res.status(404).json({ success: false, message: 'Produce listing not found' });
    }

    if (produce.status !== 'Available') {
      return res.status(400).json({ success: false, message: 'Produce is already sold or redirected' });
    }

    // Parse the requested checkout quantity
    const requestedQuantity = parseFloat(req.body.quantity) || produce.quantity;

    if (requestedQuantity <= 0) {
      return res.status(400).json({ success: false, message: 'Requested quantity must be greater than 0' });
    }

    if (requestedQuantity > produce.quantity) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity (${requestedQuantity} kg) exceeds available produce quantity (${produce.quantity} kg)`
      });
    }

    const pricePerKg = produce.discountedPrice;
    const totalCost = pricePerKg * requestedQuantity;

    // Retrieve buyer, farmer
    const buyer = await db.findOne('users', { id: req.user.id });
    const farmer = await db.findOne('users', { id: produce.farmerId });

    if (!farmer) {
      return res.status(404).json({ success: false, message: 'Listing farmer not found' });
    }

    // Razorpay or Wallet Deduction Simulation
    if (req.user.role === 'buyer') {
      if (buyer.balance < totalCost) {
        return res.status(400).json({
          success: false, 
          message: `Insufficient wallet balance. You have ₹${buyer.balance.toFixed(2)}, but order cost is ₹${totalCost.toFixed(2)}. Please recharge or select cash on delivery.`
        });
      }

      // Deduct from buyer, add to farmer balance
      await db.updateOne('users', { id: buyer.id }, { balance: buyer.balance - totalCost });
      await db.updateOne('users', { id: farmer.id }, { balance: farmer.balance + totalCost });
    }

    // Generate Mock Invoice
    const invoiceNumber = `KS-INV-${Math.floor(100000 + Math.random() * 900000)}`;

    // Create Order document (storing totalCost as the price, and requestedQuantity as the quantity)
    const newOrder = await db.insertOne('orders', {
      produceId,
      produceName: produce.name,
      quantity: requestedQuantity,
      grade: produce.aiGrading.grade,
      price: totalCost,
      farmerId: produce.farmerId,
      farmerName: produce.farmerName,
      farmerPhone: farmer.phone || '9876543210',
      buyerId: req.user.id,
      buyerName: req.user.name,
      buyerPhone: buyer.phone || '9988776655',
      buyerRole: req.user.role,
      status: req.user.role === 'buyer' ? 'Paid' : 'Pickup Scheduled',
      paymentMethod: paymentMethod || 'Wallet',
      paymentStatus: req.user.role === 'buyer' ? 'Completed' : 'N/A (Free Rescued Food)',
      deliveryDetails,
      invoiceNumber,
      razorpayPaymentId: req.user.role === 'buyer' ? `pay_${Math.random().toString(36).substr(2, 9)}` : null,
      scheduledPickupDate: req.body.scheduledPickupDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // default tomorrow
    });

    // Mark Produce remaining quantity & status
    const remainingQuantity = produce.quantity - requestedQuantity;
    const isSoldOut = remainingQuantity <= 0;

    await db.updateOne('produce', { id: produceId }, {
      quantity: remainingQuantity,
      status: isSoldOut ? (req.user.role === 'buyer' ? 'Sold' : 'Redirected') : 'Available',
      buyerId: isSoldOut ? req.user.id : produce.buyerId,
      orderId: isSoldOut ? newOrder.id : produce.orderId
    });

    // Award sustainability scores & Update platform environmental metrics
    await db.updateGlobalAnalytics(requestedQuantity); // total waste prevented calculations

    // Award Points
    let farmerScore = 30;
    let buyerScore = 40;

    if (produce.aiGrading.grade === 'Grade B') {
      farmerScore = 60;
      buyerScore = 60;
    } else if (produce.aiGrading.grade === 'Grade C') {
      farmerScore = 90;
      buyerScore = 80;
    }

    // Farmer score
    await db.updateUserScore(farmer.id, farmer.name, 'farmer', farmerScore);
    // Buyer / Animal Care / Compost score
    await db.updateUserScore(buyer.id, buyer.name, buyer.role, buyerScore);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: newOrder
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ success: false, message: 'Server error creating order' });
  }
};

// @desc    Get orders for active user session
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    const orders = await db.getCollection('orders');
    let filteredOrders = [];

    if (req.user.role === 'farmer') {
      filteredOrders = orders.filter(o => o.farmerId === req.user.id);
    } else if (req.user.role === 'admin') {
      filteredOrders = orders; // Admin views all
    } else {
      filteredOrders = orders.filter(o => o.buyerId === req.user.id);
    }

    // Sort by newest orders
    filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      count: filteredOrders.length,
      data: filteredOrders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching orders' });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await db.findOne('orders', { id: req.params.id });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify permission (farmer or buyer or admin)
    const isAuthorized = 
      req.user.role === 'admin' ||
      order.farmerId === req.user.id ||
      order.buyerId === req.user.id;

    if (!isAuthorized) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this order' });
    }

    await db.updateOne('orders', { id: req.params.id }, { status });
    const updatedOrder = await db.findOne('orders', { id: req.params.id });

    res.status(200).json({
      success: true,
      message: `Order status updated to: ${status}`,
      data: updatedOrder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating order' });
  }
};

module.exports = {
  createOrder,
  getOrders,
  updateOrderStatus
};
