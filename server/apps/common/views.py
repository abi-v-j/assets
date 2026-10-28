from decimal import Decimal
from django.db import connection, transaction
from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes

from apps.core.authentication import AdminJWTAuthentication
from apps.core.permissions import IsAuthenticatedAdmin
from apps.core.response import api_success, api_error
from apps.core.database import dictfetchall, dictfetchone, call_refcursor_procedure, call_refcursor_procedure_single
from .serializers import ItemSerializer, CustomerSerializer


# ==============================================================================
# ITEM MASTER VIEWS
# ==============================================================================

@api_view(["GET"])
@authentication_classes([AdminJWTAuthentication])
@permission_classes([IsAuthenticatedAdmin])
def get_all_items(request):
    """
    GET: Retrieve all items via stored procedure refcursor (sp_get_all_items).
    """
    try:
        items = call_refcursor_procedure("sp_get_all_items", "cur_items")
        serializer = ItemSerializer(items, many=True)
        return api_success(data=serializer.data, message="Items retrieved successfully")
    except Exception as e:
        return api_error(message=f"Failed to fetch items: {str(e)}", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@authentication_classes([AdminJWTAuthentication])
@permission_classes([IsAuthenticatedAdmin])
def get_item_by_id(request, pk):
    """
    GET: Retrieve a single Item by item_id using stored procedure (sp_get_item_by_id).
    """
    try:
        item = call_refcursor_procedure_single("sp_get_item_by_id", "cur_item", [pk])
        if not item:
            return api_error(message=f"Item with id {pk} not found.", status_code=status.HTTP_404_NOT_FOUND)
        serializer = ItemSerializer(item)
        return api_success(data=serializer.data, message="Item retrieved successfully")
    except Exception as e:
        return api_error(message=f"Failed to fetch item: {str(e)}", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@authentication_classes([AdminJWTAuthentication])
@permission_classes([IsAuthenticatedAdmin])
def create_item(request):
    """
    POST: Insert a new Item using stored procedure (sp_insert_item).
    """
    serializer = ItemSerializer(data=request.data)
    if not serializer.is_valid():
        return api_error(message="Validation failed", error=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

    item_code = serializer.validated_data.get("item_code")
    item_name = serializer.validated_data.get("item_name")
    uom = serializer.validated_data.get("uom", "NOS")
    unit_price = serializer.validated_data.get("unit_price", Decimal("0.00"))

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "CALL sp_insert_item(%s, %s, %s, %s, NULL);",
                [item_code, item_name, uom, unit_price],
            )
            row = cursor.fetchone()
            item_id = row[0] if row else None

        return api_success(
            data={
                "item_id": item_id,
                "item_code": item_code,
                "item_name": item_name,
                "uom": uom,
                "unit_price": str(unit_price),
            },
            message="Item created successfully",
            status_code=status.HTTP_201_CREATED,
        )
    except Exception as e:
        return api_error(message=str(e), status_code=status.HTTP_400_BAD_REQUEST)


@api_view(["PUT"])
@authentication_classes([AdminJWTAuthentication])
@permission_classes([IsAuthenticatedAdmin])
def update_item(request, pk):
    """
    PUT: Update an existing Item using stored procedure (sp_update_item).
    """
    serializer = ItemSerializer(data=request.data)
    if not serializer.is_valid():
        return api_error(message="Validation failed", error=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

    item_code = serializer.validated_data.get("item_code")
    item_name = serializer.validated_data.get("item_name")
    uom = serializer.validated_data.get("uom", "NOS")
    unit_price = serializer.validated_data.get("unit_price", Decimal("0.00"))
    is_active = serializer.validated_data.get("is_active", True)

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "CALL sp_update_item(%s, %s, %s, %s, %s, %s);",
                [pk, item_code, item_name, uom, unit_price, is_active],
            )

        return api_success(
            data={
                "item_id": pk,
                "item_code": item_code,
                "item_name": item_name,
                "uom": uom,
                "unit_price": str(unit_price),
                "is_active": is_active,
            },
            message="Item updated successfully",
        )
    except Exception as e:
        return api_error(message=str(e), status_code=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
@authentication_classes([AdminJWTAuthentication])
@permission_classes([IsAuthenticatedAdmin])
def delete_item(request, pk):
    """
    DELETE: Remove an Item using stored procedure (sp_delete_item).
    """
    try:
        with connection.cursor() as cursor:
            cursor.execute("CALL sp_delete_item(%s);", [pk])

        return api_success(data={"item_id": pk}, message=f"Item with id {pk} deleted successfully.")
    except Exception as e:
        return api_error(message=str(e), status_code=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "POST"])
@authentication_classes([AdminJWTAuthentication])
@permission_classes([IsAuthenticatedAdmin])
def items_view(request):
    if request.method == "GET":
        return get_all_items(request)
    elif request.method == "POST":
        return create_item(request)


@api_view(["GET", "PUT", "DELETE"])
@authentication_classes([AdminJWTAuthentication])
@permission_classes([IsAuthenticatedAdmin])
def item_detail_view(request, pk):
    if request.method == "GET":
        return get_item_by_id(request, pk)
    elif request.method == "PUT":
        return update_item(request, pk)
    elif request.method == "DELETE":
        return delete_item(request, pk)


# ==============================================================================
# CUSTOMER MASTER VIEWS
# ==============================================================================

@api_view(["GET"])
@authentication_classes([AdminJWTAuthentication])
@permission_classes([IsAuthenticatedAdmin])
def get_all_customers(request):
    """
    GET: Retrieve all customers via stored procedure refcursor (sp_get_all_customers).
    """
    try:
        customers = call_refcursor_procedure("sp_get_all_customers", "cur_customers")
        serializer = CustomerSerializer(customers, many=True)
        return api_success(data=serializer.data, message="Customers retrieved successfully")
    except Exception as e:
        return api_error(message=f"Failed to fetch customers: {str(e)}", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@authentication_classes([AdminJWTAuthentication])
@permission_classes([IsAuthenticatedAdmin])
def get_customer_by_id(request, pk):
    """
    GET: Retrieve a single Customer by customer_id using stored procedure (sp_get_customer_by_id).
    """
    try:
        customer = call_refcursor_procedure_single("sp_get_customer_by_id", "cur_customer", [pk])
        if not customer:
            return api_error(message=f"Customer with id {pk} not found.", status_code=status.HTTP_404_NOT_FOUND)
        serializer = CustomerSerializer(customer)
        return api_success(data=serializer.data, message="Customer retrieved successfully")
    except Exception as e:
        return api_error(message=f"Failed to fetch customer: {str(e)}", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@authentication_classes([AdminJWTAuthentication])
@permission_classes([IsAuthenticatedAdmin])
def create_customer(request):
    """
    POST: Insert a new Customer using stored procedure (sp_insert_customer).
    """
    serializer = CustomerSerializer(data=request.data)
    if not serializer.is_valid():
        return api_error(message="Validation failed", error=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

    customer_code = serializer.validated_data.get("customer_code")
    customer_name = serializer.validated_data.get("customer_name")
    phone = serializer.validated_data.get("phone", "")
    email = serializer.validated_data.get("email", "")
    address = serializer.validated_data.get("address", "")

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "CALL sp_insert_customer(%s, %s, %s, %s, %s, NULL);",
                [customer_code, customer_name, phone, email, address],
            )
            row = cursor.fetchone()
            customer_id = row[0] if row else None

        return api_success(
            data={
                "customer_id": customer_id,
                "customer_code": customer_code,
                "customer_name": customer_name,
                "phone": phone,
                "email": email,
                "address": address,
            },
            message="Customer created successfully",
            status_code=status.HTTP_201_CREATED,
        )
    except Exception as e:
        return api_error(message=str(e), status_code=status.HTTP_400_BAD_REQUEST)


@api_view(["PUT"])
@authentication_classes([AdminJWTAuthentication])
@permission_classes([IsAuthenticatedAdmin])
def update_customer(request, pk):
    """
    PUT: Update an existing Customer using stored procedure (sp_update_customer).
    """
    serializer = CustomerSerializer(data=request.data)
    if not serializer.is_valid():
        return api_error(message="Validation failed", error=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

    customer_code = serializer.validated_data.get("customer_code")
    customer_name = serializer.validated_data.get("customer_name")
    phone = serializer.validated_data.get("phone", "")
    email = serializer.validated_data.get("email", "")
    address = serializer.validated_data.get("address", "")
    is_active = serializer.validated_data.get("is_active", True)

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "CALL sp_update_customer(%s, %s, %s, %s, %s, %s, %s);",
                [pk, customer_code, customer_name, phone, email, address, is_active],
            )

        return api_success(
            data={
                "customer_id": pk,
                "customer_code": customer_code,
                "customer_name": customer_name,
                "phone": phone,
                "email": email,
                "address": address,
                "is_active": is_active,
            },
            message="Customer updated successfully",
        )
    except Exception as e:
        return api_error(message=str(e), status_code=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
@authentication_classes([AdminJWTAuthentication])
@permission_classes([IsAuthenticatedAdmin])
def delete_customer(request, pk):
    """
    DELETE: Remove a Customer using stored procedure (sp_delete_customer).
    """
    try:
        with connection.cursor() as cursor:
            cursor.execute("CALL sp_delete_customer(%s);", [pk])

        return api_success(data={"customer_id": pk}, message=f"Customer with id {pk} deleted successfully.")
    except Exception as e:
        return api_error(message=str(e), status_code=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "POST"])
@authentication_classes([AdminJWTAuthentication])
@permission_classes([IsAuthenticatedAdmin])
def customers_view(request):
    if request.method == "GET":
        return get_all_customers(request)
    elif request.method == "POST":
        return create_customer(request)


@api_view(["GET", "PUT", "DELETE"])
@authentication_classes([AdminJWTAuthentication])
@permission_classes([IsAuthenticatedAdmin])
def customer_detail_view(request, pk):
    if request.method == "GET":
        return get_customer_by_id(request, pk)
    elif request.method == "PUT":
        return update_customer(request, pk)
    elif request.method == "DELETE":
        return delete_customer(request, pk)
