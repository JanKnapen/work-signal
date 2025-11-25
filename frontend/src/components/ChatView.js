import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  List,
  ListItem,
  Avatar,
  Chip,
  Divider,
} from '@mui/material';
import {
  Send as SendIcon,
  Person as PersonIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { signalAPI } from '../services/api';

function ChatView({ onRefresh }) {
  const { contactId } = useParams();
  const decodedContactId = decodeURIComponent(contactId);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [contactInfo, setContactInfo] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMessages();
    loadContactInfo();
    // Poll for new messages every 3 seconds
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [contactId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const response = await signalAPI.getMessages({ contact: decodedContactId });
      const msgs = response.data.messages || [];
      
      // Debug: Log first few messages to see structure
      if (msgs.length > 0) {
        console.log('First message structure:', {
          id: msgs[0].id,
          sender_number: msgs[0].sender_number,
          sender_name: msgs[0].sender_name,
          is_outgoing: msgs[0].is_outgoing,
          message_body: msgs[0].message_body?.substring(0, 50)
        });
        
        // Check if any messages have is_outgoing flag
        const hasOutgoing = msgs.some(m => m.is_outgoing === 1 || m.is_outgoing === true);
        console.log('Has outgoing flag:', hasOutgoing);
        console.log('Total messages:', msgs.length);
      }
      
      setMessages(msgs);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadContactInfo = async () => {
    try {
      const response = await signalAPI.getContactProfile(decodedContactId);
      setContactInfo(response.data);
    } catch (error) {
      console.error('Failed to load contact info:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      await signalAPI.sendMessage(decodedContactId, newMessage);
      setNewMessage('');
      await loadMessages();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      {/* Chat Header */}
      <Paper elevation={2} sx={{ p: 2, borderRadius: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar>
            {contactInfo?.is_group ? <GroupIcon /> : <PersonIcon />}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">
              {contactInfo?.contact_name || decodedContactId}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {contactInfo?.is_group ? 'Group' : 'Individual'} • {messages.length} messages
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Messages List */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, bgcolor: '#f5f5f5' }}>
        {messages.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No messages yet. Start the conversation!
            </Typography>
          </Box>
        ) : (
          <List>
            {messages.map((msg, index) => {
              // Check multiple ways to identify sent messages
              const myNumber = process.env.REACT_APP_MY_NUMBER || '+1234567890';
              const myNumberShort = myNumber.replace(/^\+\d{2}/, '0'); // Convert +31612345678 to 0612345678
              
              const isSentByMe = msg.is_outgoing === 1 || 
                                msg.is_outgoing === true || 
                                msg.sender_name === 'Me' ||
                                msg.sender_number === myNumber ||
                                msg.sender_number === myNumberShort;
              
              const prevMsg = index > 0 ? messages[index - 1] : null;
              const prevIsSentByMe = prevMsg ? (
                prevMsg.is_outgoing === 1 || 
                prevMsg.is_outgoing === true || 
                prevMsg.sender_name === 'Me' ||
                prevMsg.sender_number === myNumber ||
                prevMsg.sender_number === myNumberShort
              ) : null;
              
              // Group messages by sender (or sent by me status)
              const isFirstInGroup = index === 0 || (isSentByMe !== prevIsSentByMe) || 
                                    (!isSentByMe && prevMsg.sender_number !== msg.sender_number);
              
              return (
                <ListItem
                  key={msg.id}
                  sx={{
                    flexDirection: 'column',
                    alignItems: isSentByMe ? 'flex-end' : 'flex-start',
                    mb: isFirstInGroup ? 2 : 0.5,
                    px: 2,
                  }}
                >
                  {isFirstInGroup && !isSentByMe && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, ml: 1 }}>
                      <Avatar sx={{ width: 24, height: 24 }}>
                        <PersonIcon sx={{ fontSize: 16 }} />
                      </Avatar>
                      <Typography variant="caption" fontWeight="bold">
                        {msg.sender_name || msg.sender_number}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTimestamp(msg.received_at)}
                      </Typography>
                    </Box>
                  )}
                  {isFirstInGroup && isSentByMe && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, mr: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {formatTimestamp(msg.received_at)}
                      </Typography>
                    </Box>
                  )}
                  <Paper
                    elevation={1}
                    sx={{
                      p: 1.5,
                      maxWidth: '70%',
                      bgcolor: isSentByMe ? '#0084ff' : 'white',
                      color: isSentByMe ? 'white' : 'inherit',
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body1">{msg.message_body}</Typography>
                  </Paper>
                </ListItem>
              );
            })}
            <div ref={messagesEndRef} />
          </List>
        )}
      </Box>

      {/* Message Input */}
      <Paper elevation={3} sx={{ p: 2, borderRadius: 0 }}>
        <form onSubmit={handleSendMessage}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={sending}
              autoComplete="off"
            />
            <IconButton
              color="primary"
              type="submit"
              disabled={sending || !newMessage.trim()}
            >
              {sending ? <CircularProgress size={24} /> : <SendIcon />}
            </IconButton>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}

export default ChatView;
