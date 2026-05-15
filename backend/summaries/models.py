from django.db import models
from django.conf import settings
from notes.models import UploadedNote

class Summary(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='summaries')
    note = models.ForeignKey(UploadedNote, on_delete=models.CASCADE, related_name='summaries')
    summary_type = models.CharField(max_length=50, choices=[('short', 'Short'), ('detailed', 'Detailed')])
    content = models.TextField()
    key_points = models.JSONField(default=list)
    important_questions = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Summary for {self.note.title}"
