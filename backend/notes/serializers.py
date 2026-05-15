from rest_framework import serializers
from .models import UploadedNote

class UploadedNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedNote
        fields = ('id', 'title', 'file', 'content', 'file_type', 'created_at', 'updated_at')
        read_only_fields = ('content', 'file_type')
