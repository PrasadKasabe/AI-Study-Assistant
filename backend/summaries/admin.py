from django.contrib import admin
from .models import Summary


@admin.register(Summary)
class SummaryAdmin(admin.ModelAdmin):
    list_display = ('note', 'user', 'summary_type', 'created_at', 'key_points_count')
    list_filter = ('summary_type', 'created_at')
    search_fields = ('note__title', 'user__username', 'user__email')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)

    fieldsets = (
        ('Summary Info', {
            'fields': ('user', 'note', 'summary_type'),
        }),
        ('Content', {
            'fields': ('content', 'key_points', 'important_questions'),
        }),
        ('Timestamps', {
            'fields': ('created_at',),
        }),
    )

    def key_points_count(self, obj):
        return len(obj.key_points) if obj.key_points else 0
    key_points_count.short_description = '# Key Points'
