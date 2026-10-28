from django.urls import path
from . import views

app_name = "invoice"

urlpatterns = [
    path("", views.get_all_invoices, name="invoice-list"),
    path("all/", views.get_all_invoices, name="invoice-list-all"),
    path("create/", views.create_invoice, name="invoice-create"),
    path("<int:pk>/", views.get_invoice_by_id, name="invoice-detail"),
    path("<int:pk>/payment-status/", views.update_payment_status, name="invoice-payment-status"),
]
