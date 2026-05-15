from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Summary
from .serializers import SummarySerializer
from notes.models import UploadedNote
from .utils import generate_full_summary

class SummaryListCreateView(generics.ListCreateAPIView):
    serializer_class = SummarySerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Summary.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        note_id = request.data.get('note')
        summary_type = request.data.get('summary_type', 'detailed')
        
        try:
            note = UploadedNote.objects.get(id=note_id, user=request.user)
        except UploadedNote.DoesNotExist:
            return Response({"error": "Note not found"}, status=status.HTTP_404_NOT_FOUND)

        # Check if summary already exists for this note and type
        existing_summary = Summary.objects.filter(note=note, summary_type=summary_type).first()
        if existing_summary:
            return Response(SummarySerializer(existing_summary).data)

        # Generate AI content
        try:
            full_data = generate_full_summary(
                note.content, 
                summary_type,
                user_groq_key=request.user.groq_api_key,
                user_gemini_key=request.user.gemini_api_key
            )
            
            summary = Summary.objects.create(
                user=request.user,
                note=note,
                summary_type=summary_type,
                content=full_data['summary'],
                key_points=full_data['key_points'],
                important_questions=full_data['questions']
            )
            return Response(SummarySerializer(summary).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SummaryDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = SummarySerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Summary.objects.filter(user=self.request.user)

from django.http import HttpResponse
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from rest_framework.views import APIView

class SummaryExportPDFView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, pk):
        try:
            summary = Summary.objects.get(pk=pk, user=request.user)
        except Summary.DoesNotExist:
            return Response({"error": "Summary not found"}, status=status.HTTP_404_NOT_FOUND)

        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="StudyAI_Summary_{summary.id}.pdf"'

        doc = SimpleDocTemplate(response, pagesize=letter)
        styles = getSampleStyleSheet()
        flowables = []

        flowables.append(Paragraph(f"Summary for: {summary.note.title}", styles['Title']))
        flowables.append(Spacer(1, 12))
        
        flowables.append(Paragraph("Detailed Summary", styles['Heading2']))
        for para in summary.content.split('\n'):
            if para.strip():
                flowables.append(Paragraph(para, styles['Normal']))
                flowables.append(Spacer(1, 6))

        flowables.append(Paragraph("Key Points", styles['Heading2']))
        for para in summary.key_points.split('\n'):
            if para.strip():
                flowables.append(Paragraph(para, styles['Normal']))
                flowables.append(Spacer(1, 6))

        flowables.append(Paragraph("Important Questions", styles['Heading2']))
        for para in summary.important_questions.split('\n'):
            if para.strip():
                flowables.append(Paragraph(para, styles['Normal']))
                flowables.append(Spacer(1, 6))

        doc.build(flowables)
        return response
