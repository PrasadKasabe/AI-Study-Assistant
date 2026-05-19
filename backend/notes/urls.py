from django.urls import path
from .views import NoteListCreateView, NoteDetailView, AnalyticsView

urlpatterns = [
    path('', NoteListCreateView.as_view(), name='note-list-create'),
    path('<int:pk>/', NoteDetailView.as_view(), name='note-detail'),
    path('analytics/', AnalyticsView.as_view(), name='analytics'),
]
