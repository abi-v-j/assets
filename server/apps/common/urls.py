from django.urls import path
from . import views

app_name = "common"

urlpatterns = [
    # -------------------------------------------------------------------------
    # ITEM MASTER: SEPARATE API ENDPOINTS
    # -------------------------------------------------------------------------
    path("items/all/", views.get_all_items, name="item-get-all"),
    path("items/create/", views.create_item, name="item-create"),
    path("items/<int:pk>/detail/", views.get_item_by_id, name="item-get-by-id"),
    path("items/<int:pk>/update/", views.update_item, name="item-update"),
    path("items/<int:pk>/delete/", views.delete_item, name="item-delete"),

    # RESTful combined endpoints
    path("items/", views.items_view, name="items"),
    path("items/<int:pk>/", views.item_detail_view, name="item-detail"),

    # -------------------------------------------------------------------------
    # CUSTOMER MASTER: SEPARATE API ENDPOINTS
    # -------------------------------------------------------------------------
    path("customers/all/", views.get_all_customers, name="customer-get-all"),
    path("customers/create/", views.create_customer, name="customer-create"),
    path("customers/<int:pk>/detail/", views.get_customer_by_id, name="customer-get-by-id"),
    path("customers/<int:pk>/update/", views.update_customer, name="customer-update"),
    path("customers/<int:pk>/delete/", views.delete_customer, name="customer-delete"),

    # RESTful combined endpoints
    path("customers/", views.customers_view, name="customers"),
    path("customers/<int:pk>/", views.customer_detail_view, name="customer-detail"),
]