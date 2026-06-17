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

// @desc    Get message logs between two users
// @route   GET /api/messages/thread/:userId
// @access  Private
const getConversation = async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const messages = await db.getCollection('messages');

    // Filter message logs in this thread
    const thread = messages.filter(m => 
      (m.senderId === req.user.id && m.receiverId === otherUserId) ||
      (m.senderId === otherUserId && m.receiverId === req.user.id)
    );

    // Mark received messages as read
    for (const m of thread) {
      if (m.receiverId === req.user.id && !m.read) {
        await db.updateOne('messages', { id: m.id }, { read: true });
      }
    }

    // Sort by chronological order
    thread.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    res.status(200).json({
      success: true,
      data: thread
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error loading thread' });
  }
};

// @desc    Get recent chat participants
// @route   GET /api/messages/chats
// @access  Private
const getChatsList = async (req, res) => {
  try {
    const messages = await db.getCollection('messages');
    const myId = req.user.id;

    // Filter messages involving current user
    const myMessages = messages.filter(m => m.senderId === myId || m.receiverId === myId);

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
