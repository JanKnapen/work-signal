"""
Signal API client for interacting with the private Signal controller.
"""
import requests
from django.conf import settings


class SignalAPIClient:
    """Client for Signal API operations."""
    
    def __init__(self):
        self.base_url = settings.SIGNAL_API_URL
        self.api_key = settings.SIGNAL_API_KEY
        self.headers = {"X-API-Key": self.api_key}
    
    def _make_request(self, method, endpoint, **kwargs):
        """Make a request to the Signal API."""
        url = f"{self.base_url}{endpoint}"
        kwargs['headers'] = self.headers
        
        try:
            response = requests.request(method, url, **kwargs, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Signal API request failed: {str(e)}")
    
    def get_conversations(self):
        """Get all conversations (individuals + groups)."""
        return self._make_request('GET', '/conversations')
    
    def get_groups(self):
        """Get only group conversations."""
        return self._make_request('GET', '/groups')
    
    def get_messages(self, sender=None, group_id=None, recipient=None):
        """Get messages with optional filters."""
        params = {}
        if sender:
            params['sender'] = sender
        if group_id:
            params['group_id'] = group_id
        if recipient:
            params['recipient'] = recipient
        
        return self._make_request('GET', '/messages', params=params)
    
    def get_message(self, message_id):
        """Get a specific message by ID."""
        return self._make_request('GET', f'/messages/{message_id}')
    
    def send_message(self, to, message):
        """
        Send a message to an individual or group.
        
        Args:
            to: Phone number (e.g., "+1234567890") or group ID
            message: Message text to send
        """
        data = {
            "to": to,
            "message": message
        }
        return self._make_request('POST', '/send', json=data)
    
    def get_stats(self):
        """Get message statistics."""
        return self._make_request('GET', '/stats')
    
    def health_check(self):
        """Check API health (no auth required)."""
        url = f"{self.base_url}/health"
        try:
            response = requests.get(url, timeout=5)
            return response.json()
        except requests.exceptions.RequestException:
            return {"status": "error", "message": "Cannot reach Signal API"}
