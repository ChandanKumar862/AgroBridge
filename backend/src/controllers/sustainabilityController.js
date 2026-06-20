const db = require('../config/db');

// @desc    Get platform-wide and user-specific sustainability metrics
// @route   GET /api/analytics
// @access  Public
const getSustainabilityMetrics = async (req, res) => {
  try {
    const globalData = await db.getGlobalAnalytics();
    
    // Check if user is logged in to return user-specific offset badges
    let userStats = null;
    
    if (req.user) {
      const dbUser = await db.findOne('users', { id: req.user.id });
      if (dbUser) {
        const boardItem = globalData.leaderboard.find(item => item.id === req.user.id);
        userStats = {
          score: boardItem ? boardItem.score : 0,
          badge: boardItem ? boardItem.badge : 'Green Seedling',
          balance: dbUser.balance,
          role: dbUser.role
        };
      }
    }

    res.status(200).json({
      success: true,
      data: {
        global: {
          totalWastePreventedKg: globalData.totalWastePrevented,
          co2ReducedKg: globalData.co2Reduced,
          waterSavedLitre: globalData.waterSaved,
        },
        leaderboard: globalData.leaderboard,
        userStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error loading analytics' });
  }
};

// @desc    Add manual wallet funds (for Buyer testing Razorpay integration)
// @route   POST /api/analytics/recharge
// @access  Private
const rechargeWallet = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide valid recharge amount' });
    }

    const updated = await db.updateOne('users', { id: req.user.id }, {
      balance: (req.user.balance || 0) + parseFloat(amount)
    });

    if (updated) {
      const updatedUser = await db.findOne('users', { id: req.user.id });
      res.status(200).json({
        success: true,
        message: `Wallet successfully recharged with ₹${parseFloat(amount).toFixed(2)}`,
        balance: updatedUser.balance
      });
    } else {
      res.status(400).json({ success: false, message: 'Wallet recharge failed' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getSustainabilityMetrics,
  rechargeWallet
};
