const db = require('../config/db');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { receiverId, produceId, text } = req.body;

    if (!receiverId || !text) {
      return res.status(400).json({ success: false, message: 'Please provide receiver ID and message text' });
    }

    const receiver = await db.findOne('users', { id: receiverId });
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Recipient not found' });
    }

    const newMessage = await db.insertOne('messages', {
      senderId: req.user.id,
      senderName: req.user.name,
      receiverId,
      receiverName: receiver.name,
      produceId: produceId || null,
      text,
      read: false
    });

    res.status(201).json({
      success: true,
      data: newMessage
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error sending message' });
  }
};

// @desc    Get message logs between two users with indexed query and atomic read update
// @route   GET /api/messages/thread/:userId
// @access  Private
const getConversation = async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const query = {
      $or: [
        { senderId: req.user.id, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: req.user.id }
      ]
    };

    const thread = await db.find('messages', query, {
      sort: { createdAt: 1 }
    });

    // Atomic batch update for all unread messages in thread (eliminates N+1 DB calls)
    await db.updateMany('messages', {
      senderId: otherUserId,
      receiverId: req.user.id,
      read: false
    }, { read: true });

    res.status(200).json({
      success: true,
      data: thread
    });
  } catch (error) {
    console.error('Error loading thread:', error);
    res.status(500).json({ success: false, message: 'Server error loading thread' });
  }
};

// @desc    Get recent chat participants with user-scoped DB query
// @route   GET /api/messages/chats
// @access  Private
const getChatsList = async (req, res) => {
  try {
    const myId = req.user.id;
    // User-scoped query leveraging compound index
    const myMessages = await db.find('messages', {
      $or: [{ senderId: myId }, { receiverId: myId }]
    }, { sort: { createdAt: -1 } });

    // Extract unique active chats
    const chatsMap = new Map();

    myMessages.forEach(m => {
      const otherId = m.senderId === myId ? m.receiverId : m.senderId;
      const otherName = m.senderId === myId ? m.receiverName : m.senderName;
      
      const lastChat = chatsMap.get(otherId);
      if (!lastChat || new Date(m.createdAt) > new Date(lastChat.createdAt)) {
        chatsMap.set(otherId, {
          userId: otherId,
          userName: otherName,
          lastMessage: m.text,
          createdAt: m.createdAt,
          unread: m.receiverId === myId && !m.read
        });
      }
    });

    const chatsList = Array.from(chatsMap.values());
    chatsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      data: chatsList
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error loading chat summaries' });
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getChatsList
};
