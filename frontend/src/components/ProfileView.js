import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  AccountCircle,
  Email,
  Person,
} from '@mui/icons-material';
import { signalAPI } from '../services/api';

function ProfileView() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
    loadStats();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await signalAPI.getProfile();
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await signalAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: 'primary.main' }}>
            <AccountCircle sx={{ fontSize: 60 }} />
          </Avatar>
          <Typography variant="h5" gutterBottom>
            {profile?.username}
          </Typography>
          {profile?.email && (
            <Typography variant="body2" color="text.secondary">
              {profile.email}
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Profile Information
        </Typography>
        <List>
          <ListItem>
            <Person sx={{ mr: 2, color: 'text.secondary' }} />
            <ListItemText
              primary="Username"
              secondary={profile?.username || 'Not set'}
            />
          </ListItem>
          {profile?.first_name && (
            <ListItem>
              <ListItemText
                primary="First Name"
                secondary={profile.first_name}
                sx={{ ml: 5 }}
              />
            </ListItem>
          )}
          {profile?.last_name && (
            <ListItem>
              <ListItemText
                primary="Last Name"
                secondary={profile.last_name}
                sx={{ ml: 5 }}
              />
            </ListItem>
          )}
          {profile?.email && (
            <ListItem>
              <Email sx={{ mr: 2, color: 'text.secondary' }} />
              <ListItemText
                primary="Email"
                secondary={profile.email}
              />
            </ListItem>
          )}
        </List>

        {stats && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>
              Statistics
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Total Messages"
                  secondary={stats.total_messages || 0}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Total Conversations"
                  secondary={stats.total_conversations || 0}
                />
              </ListItem>
              {stats.total_groups !== undefined && (
                <ListItem>
                  <ListItemText
                    primary="Total Groups"
                    secondary={stats.total_groups}
                  />
                </ListItem>
              )}
            </List>
          </>
        )}
      </Paper>
    </Box>
  );
}

export default ProfileView;
