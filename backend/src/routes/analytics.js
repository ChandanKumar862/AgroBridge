const express = require('express');
const { getSustainabilityMetrics, rechargeWallet } = require('../controllers/sustainabilityController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Optional JWT checking for user badges on analytics load
router.get('/', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
}, getSustainabilityMetrics);

router.post('/recharge', protect, rechargeWallet);

module.exports = router;
