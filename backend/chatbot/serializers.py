from rest_framework import serializers
from .models import ConversationHistory, ChatMessage

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = '__all__'

class ConversationHistorySerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = ConversationHistory
        fields = ('id', 'user', 'note', 'title', 'messages', 'created_at', 'updated_at')
        read_only_fields = ('user',)
