from django.contrib import admin
from .models import UploadedNote


@admin.register(UploadedNote)
class UploadedNoteAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'file_type', 'created_at', 'has_content')
    list_filter = ('file_type', 'created_at')
    search_fields = ('title', 'user__username', 'user__email')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at', 'file_type')

    fieldsets = (
        ('Note Info', {
            'fields': ('user', 'title', 'file', 'file_type'),
        }),
        ('Content', {
            'fields': ('content',),
            'classes': ('collapse',),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
        }),
    )

    def has_content(self, obj):
        return bool(obj.content)
    has_content.boolean = True
    has_content.short_description = 'Text Extracted'
