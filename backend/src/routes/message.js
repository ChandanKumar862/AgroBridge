const express = require('express');
const { sendMessage, getConversation, getChatsList } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', sendMessage);
router.get('/chats', getChatsList);
router.get('/thread/:userId', getConversation);

module.exports = router;
