from decimal import Decimal
from django.db import connection
from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes

from apps.core.authentication import AdminJWTAuthentication
from apps.core.permissions import IsAuthenticatedAdmin
from apps.core.response import api_success, api_error
from apps.core.database import call_refcursor_procedure, call_refcursor_procedure_single
from .serializers import CreateInvoiceSerializer, UpdatePaymentStatusSerializer


@api_view(["GET"])
@authentication_classes([AdminJWTAuthentication])
@permission_classes([IsAuthenticatedAdmin])
def get_all_invoices(request):
    """
    GET: Retrieve all invoices via stored procedure (sp_get_all_invoices).
    """
    try:
        invoices = call_refcursor_procedure("sp_get_all_invoices", "cur_invoices")
        return api_success(data=invoices, message="Invoices retrieved successfully")
    except Exception as e:
        return api_error(message=f"Failed to fetch invoices: {str(e)}", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@authentication_classes([AdminJWTAuthentication])
@permission_classes([IsAuthenticatedAdmin])
def get_invoice_by_id(request, pk):
    """
    GET: Retrieve a single invoice by ID with sales & customer details (sp_get_invoice_by_id).
    """
    try:
        invoice = call_refcursor_procedure_single("sp_get_invoice_by_id", "cur_invoice", [pk])
        if not invoice:
            return api_error(message=f"Invoice with id {pk} not found.", status_code=status.HTTP_404_NOT_FOUND)
        return api_success(data=invoice, message="Invoice retrieved successfully")
    except Exception as e:
        return api_error(message=f"Failed to fetch invoice: {str(e)}", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@authentication_classes([AdminJWTAuthentication])
@permission_classes([IsAuthenticatedAdmin])
def create_invoice(request):
    """
    POST: Generate invoice from a sales order via stored procedure (sp_create_invoice).
    """
    serializer = CreateInvoiceSerializer(data=request.data)
    if not serializer.is_valid():
        return api_error(message="Validation failed", error=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

    sales_id = serializer.validated_data.get("sales_id")
    invoice_no = serializer.validated_data.get("invoice_no").strip().upper()
    invoice_date = serializer.validated_data.get("invoice_date")
    tax_rate = serializer.validated_data.get("tax_rate", Decimal("0.05"))
    payment_status = serializer.validated_data.get("payment_status", "UNPAID")

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "CALL sp_create_invoice(%s, %s, %s, %s, %s, NULL);",
                [sales_id, invoice_no, invoice_date, tax_rate, payment_status],
            )
            row = cursor.fetchone()
            invoice_id = row[0] if row else None

        invoice = call_refcursor_procedure_single("sp_get_invoice_by_id", "cur_created_invoice", [invoice_id])

        return api_success(
            data=invoice or {"invoice_id": invoice_id, "invoice_no": invoice_no},
            message="Invoice created successfully",
            status_code=status.HTTP_201_CREATED,
        )
    except Exception as e:
        return api_error(message=str(e), status_code=status.HTTP_400_BAD_REQUEST)


@api_view(["PATCH", "POST"])
@authentication_classes([AdminJWTAuthentication])
@permission_classes([IsAuthenticatedAdmin])
def update_payment_status(request, pk):
    """
    PATCH/POST: Update invoice payment status (sp_update_invoice_payment_status).
    """
    serializer = UpdatePaymentStatusSerializer(data=request.data)
    if not serializer.is_valid():
        return api_error(message="Validation failed", error=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

    new_payment_status = serializer.validated_data.get("payment_status")

    try:
        with connection.cursor() as cursor:
            cursor.execute("CALL sp_update_invoice_payment_status(%s, %s);", [pk, new_payment_status])

        return api_success(
            data={"invoice_id": pk, "payment_status": new_payment_status},
            message="Payment status updated successfully"
        )
    except Exception as e:
        return api_error(message=str(e), status_code=status.HTTP_400_BAD_REQUEST)
