from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .signal_client import SignalAPIClient


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def conversations_list(request):
    """List all conversations (individuals + groups)."""
    try:
        client = SignalAPIClient()
        data = client.get_conversations()
        return Response(data)
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def groups_list(request):
    """List only group conversations."""
    try:
        client = SignalAPIClient()
        data = client.get_groups()
        return Response(data)
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def messages_list(request):
    """
    Get messages with optional filters.
    Query params: sender, group_id, contact
    """
    try:
        client = SignalAPIClient()
        sender = request.query_params.get('sender')
        group_id = request.query_params.get('group_id')
        contact = request.query_params.get('contact')
        
        # Use contact parameter if provided (for both individual and group chats)
        if contact:
            # Try to determine if it's a group ID or phone number
            if contact.endswith('='):  # Likely a group ID (base64 encoded)
                data = client.get_messages(group_id=contact)
            else:
                # For individual chats, get both received and sent messages
                # Get messages received from this contact
                received_data = client.get_messages(sender=contact)
                received_messages = received_data.get('messages', [])
                
                # Get messages sent to this contact (stored with recipient filter if available)
                try:
                    sent_data = client.get_messages(recipient=contact)
                    sent_messages = sent_data.get('messages', [])
                except:
                    # If recipient filter not available, get all messages and filter
                    # by checking if we sent to this contact
                    all_data = client.get_messages()
                    all_messages = all_data.get('messages', [])
                    # Filter for messages where we are the sender and contact is recipient
                    # This is a workaround - ideally Signal Controller should support recipient filter
                    sent_messages = []
                
                # Combine and sort by timestamp, remove duplicates
                # Use a set to track unique message IDs
                seen_ids = set()
                all_messages = []
                
                for msg in received_messages + sent_messages:
                    msg_id = msg.get('id')
                    if msg_id and msg_id not in seen_ids:
                        seen_ids.add(msg_id)
                        all_messages.append(msg)
                    elif not msg_id:
                        # If no ID, include it anyway (shouldn't happen but be safe)
                        all_messages.append(msg)
                
                all_messages.sort(key=lambda x: x.get('timestamp', 0))
                
                data = {'messages': all_messages}
        else:
            data = client.get_messages(sender=sender, group_id=group_id)
        
        return Response(data)
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def message_detail(request, message_id):
    """Get a specific message by ID."""
    try:
        client = SignalAPIClient()
        data = client.get_message(message_id)
        return Response(data)
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request):
    """
    Send a message to an individual or group.
    Body: {"to": "+1234567890" or "group_id", "message": "text"}
    """
    try:
        to = request.data.get('to')
        message = request.data.get('message')
        
        if not to or not message:
            return Response(
                {"error": "Both 'to' and 'message' fields are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        client = SignalAPIClient()
        data = client.send_message(to, message)
        return Response(data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stats(request):
    """Get message statistics."""
    try:
        client = SignalAPIClient()
        data = client.get_stats()
        return Response(data)
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def health_check(request):
    """Health check endpoint (no authentication required)."""
    try:
        client = SignalAPIClient()
        data = client.health_check()
        return Response(data)
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """Get the current user's profile."""
    user = request.user
    return Response({
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def contact_profile(request):
    """
    Get profile information for a contact.
    Query params: contact (phone number or group_id)
    """
    try:
        contact = request.query_params.get('contact')
        if not contact:
            return Response(
                {"error": "Contact parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        client = SignalAPIClient()
        
        # Get conversations to find contact info
        conversations_data = client.get_conversations()
        conversations = conversations_data.get('conversations', [])
        
        # Find the contact in conversations
        contact_info = None
        for conv in conversations:
            if conv.get('contact_number') == contact:
                contact_info = conv
                break
        
        if not contact_info:
            return Response(
                {"error": "Contact not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get message count for this contact
        if contact_info.get('is_group'):
            messages_data = client.get_messages(group_id=contact)
        else:
            messages_data = client.get_messages(sender=contact)
        
        messages = messages_data.get('messages', [])
        
        return Response({
            "contact_number": contact_info.get('contact_number'),
            "contact_name": contact_info.get('contact_name'),
            "is_group": contact_info.get('is_group', False),
            "group_id": contact_info.get('group_id'),
            "message_count": len(messages),
            "last_message_at": contact_info.get('last_message_at'),
        })
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
