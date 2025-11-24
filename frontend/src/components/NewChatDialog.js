import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
} from '@mui/material';

function NewChatDialog({ open, onClose, onSubmit }) {
  const [contact, setContact] = useState('');

  const handleSubmit = () => {
    if (contact.trim()) {
      onSubmit(contact.trim());
      setContact('');
    }
  };

  const handleClose = () => {
    setContact('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Start New Chat</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Enter a phone number (e.g., +1234567890) or group ID to start a new conversation.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Phone Number or Group ID"
            placeholder="+1234567890"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            margin="normal"
            helperText="For international numbers, include country code (e.g., +31 for Netherlands)"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!contact.trim()}
        >
          Start Chat
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default NewChatDialog;
