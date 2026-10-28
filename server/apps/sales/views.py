import json
from decimal import Decimal
from django.db import connection
from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes

from apps.core.authentication import AdminJWTAuthentication
from apps.core.permissions import IsAuthenticatedAdmin
from apps.core.response import api_success, api_error
from apps.core.database import call_refcursor_procedure, call_refcursor_procedure_single
from .serializers import CreateSalesOrderSerializer, UpdateSalesStatusSerializer


@api_view(["GET"])
@authentication_classes([AdminJWTAuthentication])
@permission_classes([IsAuthenticatedAdmin])
def get_all_sales_orders(request):
    """
    GET: Retrieve all sales orders with customer and nested line items (sp_get_all_sales_orders).
    """
    try:
        orders = call_refcursor_procedure("sp_get_all_sales_orders", "cur_sales_orders")
        return api_success(data=orders, message="Sales orders retrieved successfully")
    except Exception as e:
        return api_error(message=f"Failed to fetch sales orders: {str(e)}", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@authentication_classes([AdminJWTAuthentication])
@permission_classes([IsAuthenticatedAdmin])
def get_sales_order_by_id(request, pk):
    """
    GET: Retrieve a single sales order by ID with details (sp_get_sales_order_by_id).
    """
    try:
        order = call_refcursor_procedure_single("sp_get_sales_order_by_id", "cur_sales_order", [pk])
        if not order:
            return api_error(message=f"Sales order with id {pk} not found.", status_code=status.HTTP_404_NOT_FOUND)
        return api_success(data=order, message="Sales order retrieved successfully")
    except Exception as e:
        return api_error(message=f"Failed to fetch sales order: {str(e)}", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@authentication_classes([AdminJWTAuthentication])
@permission_classes([IsAuthenticatedAdmin])
def create_sales_order(request):
    """
    POST: Create a new sales order with line items atomically via stored procedure (sp_create_sales_order).
    """
    serializer = CreateSalesOrderSerializer(data=request.data)
    if not serializer.is_valid():
        return api_error(message="Validation failed", error=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

    sales_no = serializer.validated_data.get("sales_no").strip().upper()
    sales_date = serializer.validated_data.get("sales_date")
    customer_id = serializer.validated_data.get("customer_id")
    order_status = serializer.validated_data.get("status", "DRAFT")
    remarks = serializer.validated_data.get("remarks", "")
    lines = serializer.validated_data.get("lines")

    # Format lines into JSON for stored procedure JSONB argument
    lines_formatted = []
    for line in lines:
        lines_formatted.append({
            "item_id": line["item_id"],
            "quantity": float(line["quantity"]),
            "unit_price": float(line["unit_price"]) if line.get("unit_price") is not None else None,
        })
    lines_json = json.dumps(lines_formatted)

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "CALL sp_create_sales_order(%s, %s, %s, %s, %s, %s, NULL);",
                [sales_no, sales_date, customer_id, order_status, remarks, lines_json],
            )
            row = cursor.fetchone()
            sales_id = row[0] if row else None

        # Fetch the created order with nested lines
        order = call_refcursor_procedure_single("sp_get_sales_order_by_id", "cur_created_sales", [sales_id])

        return api_success(
            data=order or {"sales_id": sales_id, "sales_no": sales_no},
            message="Sales order created successfully",
            status_code=status.HTTP_201_CREATED,
        )
    except Exception as e:
        return api_error(message=str(e), status_code=status.HTTP_400_BAD_REQUEST)


@api_view(["PATCH", "POST"])
@authentication_classes([AdminJWTAuthentication])
@permission_classes([IsAuthenticatedAdmin])
def update_sales_status(request, pk):
    """
    PATCH/POST: Update status of a sales order (sp_update_sales_status).
    """
    serializer = UpdateSalesStatusSerializer(data=request.data)
    if not serializer.is_valid():
        return api_error(message="Validation failed", error=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

    new_status = serializer.validated_data.get("status")

    try:
        with connection.cursor() as cursor:
            cursor.execute("CALL sp_update_sales_status(%s, %s);", [pk, new_status])

        return api_success(data={"sales_id": pk, "status": new_status}, message="Sales order status updated")
    except Exception as e:
        return api_error(message=str(e), status_code=status.HTTP_400_BAD_REQUEST)
