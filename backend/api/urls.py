from django.urls import path
from . import views

urlpatterns = [
    # Conversations
    path('conversations/', views.conversations_list, name='conversations-list'),
    path('groups/', views.groups_list, name='groups-list'),
    
    # Messages
    path('messages/', views.messages_list, name='messages-list'),
    path('messages/<int:message_id>/', views.message_detail, name='message-detail'),
    path('send/', views.send_message, name='send-message'),
    
    # Stats and Health
    path('stats/', views.stats, name='stats'),
    path('health/', views.health_check, name='health-check'),
    
    # Profile
    path('profile/', views.user_profile, name='user-profile'),
    path('contact/profile/', views.contact_profile, name='contact-profile'),
]
