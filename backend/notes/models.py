from django.db import models
from django.conf import settings

class UploadedNote(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notes')
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='notes/')
    content = models.TextField(blank=True, help_text="Extracted text content from the file")
    file_type = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
