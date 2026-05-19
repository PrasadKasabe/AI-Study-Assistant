import fitz  # PyMuPDF
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import UploadedNote
from .serializers import UploadedNoteSerializer


class NoteListCreateView(generics.ListCreateAPIView):
    serializer_class = UploadedNoteSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        qs = UploadedNote.objects.filter(user=self.request.user)
        search = self.request.query_params.get('search', '').strip()
        tag = self.request.query_params.get('tag', '').strip()
        if search:
            qs = qs.filter(title__icontains=search)
        if tag:
            # JSONField contains check — works for SQLite & Postgres
            qs = [n for n in qs if tag.lower() in [t.lower() for t in (n.tags or [])]]
        return qs

    def perform_create(self, serializer):
        file = self.request.FILES.get('file')
        content = ""
        file_type = file.name.split('.')[-1].lower() if file else ""

        if file_type == 'pdf':
            file_content = file.read()
            doc = fitz.open(stream=file_content, filetype="pdf")
            for page in doc:
                text = page.get_text()
                if text.strip():
                    content += text + "\n"
                else:
                    try:
                        from .utils import extract_text_from_image
                        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                        img_bytes = pix.tobytes("png")
                        ocr_text = extract_text_from_image(img_bytes, "image/png")
                        if ocr_text:
                            content += ocr_text + "\n"
                    except Exception as e:
                        print(f"OCR failed for PDF page: {e}")
            doc.close()
            file.seek(0)
        elif file_type == 'txt':
            file_content = file.read()
            content = file_content.decode('utf-8')
            file.seek(0)
        elif file_type in ['png', 'jpg', 'jpeg']:
            from .utils import extract_text_from_image
            mime_type = f"image/{file_type}"
            if file_type == 'jpg':
                mime_type = 'image/jpeg'
            file_content = file.read()
            content = extract_text_from_image(file_content, mime_type)
            file.seek(0)

        # Parse tags from request data
        import json
        tags_raw = self.request.data.get('tags', '[]')
        try:
            tags = json.loads(tags_raw) if isinstance(tags_raw, str) else tags_raw
        except Exception:
            tags = []

        serializer.save(user=self.request.user, content=content, file_type=file_type, tags=tags)


class NoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UploadedNoteSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return UploadedNote.objects.filter(user=self.request.user)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)


class AnalyticsView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        from summaries.models import Summary
        from chatbot.models import ConversationHistory
        from django.db.models.functions import TruncDate
        from django.db.models import Count
        import datetime

        user = request.user

        # Last 7 days activity
        today = datetime.date.today()
        days = [(today - datetime.timedelta(days=i)).isoformat() for i in range(6, -1, -1)]

        notes_by_day = (
            UploadedNote.objects
            .filter(user=user, created_at__date__gte=today - datetime.timedelta(days=6))
            .annotate(day=TruncDate('created_at'))
            .values('day')
            .annotate(count=Count('id'))
        )
        notes_map = {str(r['day']): r['count'] for r in notes_by_day}

        summaries_by_day = (
            Summary.objects
            .filter(user=user, created_at__date__gte=today - datetime.timedelta(days=6))
            .annotate(day=TruncDate('created_at'))
            .values('day')
            .annotate(count=Count('id'))
        )
        summaries_map = {str(r['day']): r['count'] for r in summaries_by_day}

        chart_data = [
            {
                'date': d,
                'label': datetime.date.fromisoformat(d).strftime('%b %d'),
                'notes': notes_map.get(d, 0),
                'summaries': summaries_map.get(d, 0),
            }
            for d in days
        ]

        # Overall totals
        total_notes = UploadedNote.objects.filter(user=user).count()
        total_summaries = Summary.objects.filter(user=user).count()
        total_chats = ConversationHistory.objects.filter(user=user).count()

        # All unique tags used
        all_tags = []
        for note in UploadedNote.objects.filter(user=user):
            all_tags.extend(note.tags or [])
        unique_tags = list(set(all_tags))

        return Response({
            'chart_data': chart_data,
            'totals': {
                'notes': total_notes,
                'summaries': total_summaries,
                'chats': total_chats,
            },
            'tags': unique_tags,
        })
