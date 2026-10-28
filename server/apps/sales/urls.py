from django.urls import path
from . import views

app_name = "sales"

urlpatterns = [
    path("", views.get_all_sales_orders, name="sales-list"),
    path("all/", views.get_all_sales_orders, name="sales-list-all"),
    path("create/", views.create_sales_order, name="sales-create"),
    path("<int:pk>/", views.get_sales_order_by_id, name="sales-detail"),
    path("<int:pk>/status/", views.update_sales_status, name="sales-update-status"),
]
