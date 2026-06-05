import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import { Send, MessageSquare, User, Loader2 } from 'lucide-react';

const Messages = () => {
  const { user } = useAuth();
  const location = useLocation();

  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadChats();
  }, []);

  // Handle direct navigation redirects from "Message Farmer" button
  useEffect(() => {
    if (location.state?.recipientId) {
      const recipientId = location.state.recipientId;
      
      // Look for recipient in existing chats list
      const existing = chats.find(c => c.userId === recipientId);
      if (existing) {
        handleSelectChat(existing);
      } else {
        // Create an ephemeral active chat placeholder
        const newChatPlaceholder = {
          userId: recipientId,
          userName: location.state.recipientName || 'Farming Partner',
          lastMessage: 'Starting conversation...',
          unread: false
        };
        setChats(prev => [newChatPlaceholder, ...prev]);
        handleSelectChat(newChatPlaceholder);
      }
    }
  }, [chats, location.state]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChats = async () => {
    try {
      setLoadingChats(true);
      const res = await api.get('/messages/chats');
      if (res.data.success) {
        setChats(res.data.data);
        if (res.data.data.length > 0 && !location.state?.recipientId) {
          // Auto select first chat
          handleSelectChat(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load chats list:', err);
    } finally {
      setLoadingChats(false);
    }
  };

  const handleSelectChat = async (chat) => {
    setActiveChat(chat);
    try {
      setLoadingMessages(true);
      const res = await api.get(`/messages/thread/${chat.userId}`);
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load message thread:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeChat) return;

    const messageText = text;
    setText(''); // clear input immediately

    try {
      const res = await api.post('/messages', {
        receiverId: activeChat.userId,
        text: messageText
      });

      if (res.data.success) {
        setMessages(prev => [...prev, res.data.data]);
        
        // Update chats list summary locally
        setChats(prev => prev.map(c => {
          if (c.userId === activeChat.userId) {
            return { ...c, lastMessage: messageText, createdAt: new Date().toISOString() };
          }
          return c;
        }));
      }
    } catch (err) {
      console.error('Failed to dispatch message:', err);
    }
  };

  return (
    <div className="flex-grow flex bg-brand-cream/20">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-0 border-r border-l border-brand-sand bg-white min-h-[calc(100vh-80px)]">
        
        {/* LEFT 4-COLUMNS: Chats list */}
        <div className="md:col-span-4 border-r border-brand-sand flex flex-col h-full overflow-hidden">
          <div className="p-5 border-b border-brand-sand bg-brand-cream/30">
            <h2 className="font-display font-extrabold text-xl text-brand-earth flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-emerald" />
              <span>Inbox Contacts</span>
            </h2>
          </div>

          <div className="flex-grow overflow-y-auto divide-y divide-brand-cream">
            {loadingChats ? (
              <div className="py-20 text-center">
                <Loader2 className="w-8 h-8 text-brand-emerald animate-spin mx-auto" />
              </div>
            ) : chats.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500 font-accent space-y-2">
                <p>No active message logs found.</p>
                <p className="text-[10px]">Message a farmer directly from any produce listing in the marketplace!</p>
              </div>
            ) : (
              chats.map((c) => {
                const isActive = activeChat?.userId === c.userId;
                return (
                  <div
                    key={c.userId}
                    onClick={() => handleSelectChat(c)}
                    className={`p-4 flex gap-3 items-center cursor-pointer transition-all hover:bg-brand-cream/60 ${
                      isActive ? 'bg-brand-sage/20 border-l-4 border-brand-emerald' : ''
                    }`}
                  >
                    <div className="w-10 h-10 bg-brand-clay rounded-full flex items-center justify-center text-brand-earth shrink-0 font-bold">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold text-brand-earth truncate">{c.userName}</h4>
                        {c.unread && (
                          <span className="w-2 h-2 bg-brand-amber rounded-full shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5 font-accent">{c.lastMessage}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT 8-COLUMNS: Conversation logs */}
        <div className="md:col-span-8 flex flex-col h-full overflow-hidden bg-brand-cream/10">
          {activeChat ? (
            <>
              {/* Header */}
              <div className="p-5 border-b border-brand-sand bg-white flex items-center gap-3 shrink-0">
                <div className="w-10 h-10 bg-brand-clay rounded-full flex items-center justify-center text-brand-earth font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-brand-earth text-sm">{activeChat.userName}</h3>
                  <span className="text-[10px] text-brand-emerald font-accent font-bold uppercase tracking-wider block mt-0.5">Active Session</span>
                </div>
              </div>

              {/* Chat history bubbles */}
              <div className="flex-grow overflow-y-auto p-6 space-y-4">
                {loadingMessages ? (
                  <div className="py-20 text-center">
                    <Loader2 className="w-8 h-8 text-brand-emerald animate-spin mx-auto" />
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMe = msg.senderId === user.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? 'bg-brand-earth text-white rounded-tr-none'
                            : 'bg-white border border-brand-sand text-brand-dark rounded-tl-none'
                        }`}>
                          <p className="font-accent">{msg.text}</p>
                          <span className={`block text-[9px] mt-1 text-right ${isMe ? 'text-brand-sage' : 'text-gray-400'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Footer */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-brand-sand shrink-0 flex gap-3">
                <input
                  type="text"
                  required
                  placeholder="Type your message coordination details here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full bg-brand-cream border border-brand-sand rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand-emerald font-accent"
                />
                <button
                  type="submit"
                  className="btn-primary py-3 px-5 text-xs font-semibold shrink-0"
                >
                  <Send className="w-4 h-4 text-brand-sage" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-grow flex flex-col justify-center items-center text-center p-8 space-y-4">
              <span className="text-5xl animate-bounce">💬</span>
              <h3 className="font-display font-extrabold text-xl text-brand-earth">Select a Contact</h3>
              <p className="text-gray-500 text-xs font-accent max-w-xs">
                Pick a partner chat bubble from the left contacts list to begin messaging, or browse produce listings to start new inquiries.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Messages;
