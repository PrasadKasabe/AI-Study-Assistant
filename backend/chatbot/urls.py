from django.urls import path
from .views import ConversationListView, ChatMessageCreateView, ConversationDetailView

urlpatterns = [
    path('conversations/', ConversationListView.as_view(), name='conversation-list'),
    path('conversations/<int:pk>/', ConversationDetailView.as_view(), name='conversation-detail'),
    path('messages/', ChatMessageCreateView.as_view(), name='message-create'),
]
