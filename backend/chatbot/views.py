from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import ConversationHistory, ChatMessage
from .serializers import ConversationHistorySerializer, ChatMessageSerializer
from notes.models import UploadedNote
from .utils import get_chatbot_response

class ConversationListView(generics.ListCreateAPIView):
    serializer_class = ConversationHistorySerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return ConversationHistory.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ChatMessageCreateView(generics.CreateAPIView):
    serializer_class = ChatMessageSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def create(self, request, *args, **kwargs):
        conversation_id = request.data.get('conversation')
        user_message = request.data.get('message')
        
        try:
            conversation = ConversationHistory.objects.get(id=conversation_id, user=request.user)
        except ConversationHistory.DoesNotExist:
            return Response({"error": "Conversation not found"}, status=status.HTTP_404_NOT_FOUND)

        # Save user message
        ChatMessage.objects.create(
            conversation=conversation,
            role='user',
            message=user_message
        )

        # Get AI response
        note_content = conversation.note.content
        
        # Get history for context (optional, let's include last few messages)
        history_objs = list(conversation.messages.all().order_by('created_at'))
        history = []
        for msg in history_objs[:-1]: # exclude the one we just created to avoid duplication in full_prompt logic if needed, but Gemini API history is separate
            history.append({"role": "user" if msg.role == 'user' else "assistant", "content": msg.message})

        try:
            ai_response_text = get_chatbot_response(
                note_content, 
                user_message, 
                history,
                user_groq_key=request.user.groq_api_key,
                user_gemini_key=request.user.gemini_api_key
            )
            
            # Save AI message
            ai_message = ChatMessage.objects.create(
                conversation=conversation,
                role='ai',
                message=ai_response_text
            )
            
            return Response(ChatMessageSerializer(ai_message).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ConversationDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = ConversationHistorySerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return ConversationHistory.objects.filter(user=self.request.user)
