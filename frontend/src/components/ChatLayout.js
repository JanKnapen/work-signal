import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Badge,
  CircularProgress,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  AccountCircle,
  Group as GroupIcon,
  Person as PersonIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { AuthContext } from '../contexts/AuthContext';
import { signalAPI } from '../services/api';
import ChatView from './ChatView';
import ProfileView from './ProfileView';
import NewChatDialog from './NewChatDialog';

const drawerWidth = 320;

function ChatLayout() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [lastReadMessages, setLastReadMessages] = useState({});
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { contactId } = useParams();

  // Load last read messages from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('lastReadMessages');
    if (stored) {
      try {
        setLastReadMessages(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse lastReadMessages:', e);
      }
    }
  }, []);

  useEffect(() => {
    loadConversations();
    // Poll for new messages every 5 seconds
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadConversations = async () => {
    try {
      const response = await signalAPI.getConversations();
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleConversationClick = (contact) => {
    const contactNumber = contact.contact_number;
    
    // Mark conversation as read by storing the current message count
    const newLastRead = {
      ...lastReadMessages,
      [contactNumber]: contact.message_count || 0
    };
    setLastReadMessages(newLastRead);
    localStorage.setItem('lastReadMessages', JSON.stringify(newLastRead));
    
    navigate(`/chat/${encodeURIComponent(contactNumber)}`);
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNewChat = (contactNumber) => {
    // Mark new chat as read immediately
    const newLastRead = {
      ...lastReadMessages,
      [contactNumber]: 0
    };
    setLastReadMessages(newLastRead);
    localStorage.setItem('lastReadMessages', JSON.stringify(newLastRead));
    
    navigate(`/chat/${encodeURIComponent(contactNumber)}`);
    setNewChatOpen(false);
  };

  // Calculate unread count for a conversation
  const getUnreadCount = (conv) => {
    const lastRead = lastReadMessages[conv.contact_number] || 0;
    const totalMessages = conv.message_count || 0;
    const unread = totalMessages - lastRead;
    
    // Debug logging
    if (unread > 0) {
      console.log(`Unread for ${conv.contact_name}: total=${totalMessages}, lastRead=${lastRead}, unread=${unread}`);
    }
    
    return unread > 0 ? unread : 0;
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Conversations
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton color="inherit" onClick={() => setNewChatOpen(true)}>
          <AddIcon />
        </IconButton>
      </Toolbar>
      <Divider />
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <List>
          {conversations.map((conv) => {
            const unreadCount = getUnreadCount(conv);
            return (
              <ListItem key={conv.id} disablePadding>
                <ListItemButton
                  selected={contactId === encodeURIComponent(conv.contact_number)}
                  onClick={() => handleConversationClick(conv)}
                >
                  <ListItemAvatar>
                    <Avatar>
                      {conv.is_group ? <GroupIcon /> : <PersonIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={conv.contact_name || conv.contact_number}
                    secondary={
                      conv.last_message_at
                        ? new Date(conv.last_message_at).toLocaleString()
                        : 'No messages'
                    }
                  />
                  {unreadCount > 0 && (
                    <Badge badgeContent={unreadCount} color="primary" />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
          {conversations.length === 0 && (
            <ListItem>
              <ListItemText
                primary="No conversations"
                secondary="Start a new chat to begin messaging"
              />
            </ListItem>
          )}
        </List>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Work Signal
          </Typography>
          <IconButton color="inherit" onClick={() => navigate('/profile')}>
            <AccountCircle />
          </IconButton>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <Toolbar />
        <Routes>
          <Route path="/" element={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)' }}>
              <Typography variant="h6" color="text.secondary">
                Select a conversation to start messaging
              </Typography>
            </Box>
          } />
          <Route path="/chat/:contactId" element={<ChatView onRefresh={loadConversations} />} />
          <Route path="/profile" element={<ProfileView />} />
        </Routes>
      </Box>
      <NewChatDialog
        open={newChatOpen}
        onClose={() => setNewChatOpen(false)}
        onSubmit={handleNewChat}
      />
    </Box>
  );
}

export default ChatLayout;
