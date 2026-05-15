from django.urls import path
from .views import SummaryListCreateView, SummaryDetailView, SummaryExportPDFView

urlpatterns = [
    path('', SummaryListCreateView.as_view(), name='summary-list-create'),
    path('<int:pk>/', SummaryDetailView.as_view(), name='summary-detail'),
    path('<int:pk>/export/', SummaryExportPDFView.as_view(), name='summary-export'),
]
