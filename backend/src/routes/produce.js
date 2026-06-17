const express = require('express');
const {
  createProduce,
  getListings,
  getProduceDetails,
  deleteProduce
} = require('../controllers/produceController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, restrictTo('farmer'), upload.single('image'), createProduce)
  .get(getListings);

router.route('/:id')
  .get(getProduceDetails)
  .delete(protect, restrictTo('farmer'), deleteProduce);

module.exports = router;
