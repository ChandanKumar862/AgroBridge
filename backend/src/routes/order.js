const express = require('express');
const {
  createOrder,
  getOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createOrder)
  .get(getOrders);

router.route('/:id')
  .put(updateOrderStatus);

module.exports = router;
