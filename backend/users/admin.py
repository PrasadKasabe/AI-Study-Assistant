from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'is_active', 'is_staff', 'created_at', 'has_groq_key', 'has_gemini_key')
    list_filter = ('is_active', 'is_staff', 'is_superuser')
    search_fields = ('username', 'email')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'last_login', 'date_joined')

    fieldsets = BaseUserAdmin.fieldsets + (
        ('AI API Keys', {
            'fields': ('groq_api_key', 'gemini_api_key'),
            'classes': ('collapse',),
        }),
        ('Profile', {
            'fields': ('profile_picture', 'created_at'),
        }),
    )

    def has_groq_key(self, obj):
        return bool(obj.groq_api_key)
    has_groq_key.boolean = True
    has_groq_key.short_description = 'Groq Key'

    def has_gemini_key(self, obj):
        return bool(obj.gemini_api_key)
    has_gemini_key.boolean = True
    has_gemini_key.short_description = 'Gemini Key'
