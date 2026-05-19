from django.contrib import admin
from .models import ConversationHistory, ChatMessage


class ChatMessageInline(admin.TabularInline):
    model = ChatMessage
    extra = 0
    readonly_fields = ('role', 'message', 'created_at')
    can_delete = False


@admin.register(ConversationHistory)
class ConversationHistoryAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'note', 'message_count', 'created_at', 'updated_at')
    list_filter = ('created_at',)
    search_fields = ('title', 'user__username', 'note__title')
    ordering = ('-updated_at',)
    readonly_fields = ('created_at', 'updated_at')
    inlines = [ChatMessageInline]

    def message_count(self, obj):
        return obj.messages.count()
    message_count.short_description = '# Messages'


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('conversation', 'role', 'short_message', 'created_at')
    list_filter = ('role', 'created_at')
    search_fields = ('message', 'conversation__user__username')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)

    def short_message(self, obj):
        return obj.message[:80] + '...' if len(obj.message) > 80 else obj.message
    short_message.short_description = 'Message'
