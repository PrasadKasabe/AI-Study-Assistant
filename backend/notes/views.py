import fitz  # PyMuPDF
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import UploadedNote
from .serializers import UploadedNoteSerializer

class NoteListCreateView(generics.ListCreateAPIView):
    serializer_class = UploadedNoteSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return UploadedNote.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        file = self.request.FILES.get('file')
        content = ""
        file_type = file.name.split('.')[-1].lower() if file else ""

        if file_type == 'pdf':
            # Extract text from PDF
            file_content = file.read()
            doc = fitz.open(stream=file_content, filetype="pdf")
            for page in doc:
                text = page.get_text()
                if text.strip():
                    content += text + "\n"
                else:
                    # Fallback to OCR for scanned PDF pages
                    try:
                        from .utils import extract_text_from_image
                        # Render page to image with higher resolution for better OCR
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
            if file_type == 'jpg': mime_type = 'image/jpeg'
            
            file_content = file.read()
            content = extract_text_from_image(file_content, mime_type)
            file.seek(0)
        
        serializer.save(user=self.request.user, content=content, file_type=file_type)

class NoteDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = UploadedNoteSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return UploadedNote.objects.filter(user=self.request.user)
