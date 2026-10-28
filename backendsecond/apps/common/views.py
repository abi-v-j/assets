from decimal import Decimal
from django.db import connection, transaction
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .serializers import ItemSerializer, CustomerSerializer


def dictfetchall(cursor):
    """Return all rows from a cursor as a dict"""
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]


def dictfetchone(cursor):
    """Return one row from a cursor as a dict"""
    columns = [col[0] for col in cursor.description]
    row = cursor.fetchone()
    if not row:
        return None
    return dict(zip(columns, row))


# ==============================================================================
# SEPARATE API FUNCTIONS: ITEM MASTER
# ==============================================================================

@api_view(["GET"])
def get_all_items(request):
    """
    GET: Retrieve all items via stored procedure refcursor (sp_get_all_items).
    """
    try:
        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute("CALL sp_get_all_items(%s);", ["cur_items"])
                cursor.execute('FETCH ALL FROM "cur_items";')
                items = dictfetchall(cursor)

        serializer = ItemSerializer(items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
def get_item_by_id(request, pk):
    """
    GET: Retrieve a single Item by item_id using cursor and stored procedure (sp_get_item_by_id).
    """
    try:
        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute("CALL sp_get_item_by_id(%s, %s);", [pk, "cur_item"])
                cursor.execute('FETCH ALL FROM "cur_item";')
                item = dictfetchone(cursor)

        if not item:
            return Response({"error": f"Item with id {pk} not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ItemSerializer(item)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
def create_item(request):
    """
    POST: Insert a new Item using cursor and stored procedure (sp_insert_item).
    """
    serializer = ItemSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    item_code = serializer.validated_data.get("item_code")
    item_name = serializer.validated_data.get("item_name")
    uom = serializer.validated_data.get("uom", "NOS")
    unit_price = serializer.validated_data.get("unit_price", Decimal("0.00"))

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "CALL sp_insert_item(%s, %s, %s, %s, %s);",
                [item_code, item_name, uom, unit_price, None],
            )
            row = cursor.fetchone()
            item_id = row[0] if row else None

        return Response(
            {
                "status": "success",
                "message": "Item created successfully using stored procedure (sp_insert_item)",
                "data": {
                    "item_id": item_id,
                    "item_code": item_code,
                    "item_name": item_name,
                    "uom": uom,
                    "unit_price": str(unit_price),
                },
            },
            status=status.HTTP_201_CREATED,
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PUT", "POST"])
def update_item(request, pk):
    """
    PUT/POST: Update an existing Item by item_id using stored procedure (sp_update_item).
    """
    serializer = ItemSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    item_code = serializer.validated_data.get("item_code")
    item_name = serializer.validated_data.get("item_name")
    uom = serializer.validated_data.get("uom", "NOS")
    unit_price = serializer.validated_data.get("unit_price", Decimal("0.00"))
    is_active = serializer.validated_data.get("is_active", True)

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "CALL common.sp_update_item(%s::bigint, %s::varchar, %s::varchar, %s::varchar, %s::numeric, %s::boolean);",
                [pk, item_code, item_name, uom, unit_price, is_active],
            )
        return Response(
            {"status": "success", "message": f"Item {pk} updated successfully (sp_update_item)"},
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE", "POST"])
def delete_item(request, pk):
    """
    DELETE/POST: Delete an Item by item_id using stored procedure (sp_delete_item).
    """
    try:
        with connection.cursor() as cursor:
            cursor.execute("CALL sp_delete_item(%s::bigint);", [pk])
        return Response(
            {"status": "success", "message": f"Item {pk} deleted successfully (sp_delete_item)"},
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ==============================================================================
# SEPARATE API FUNCTIONS: CUSTOMER MASTER
# ==============================================================================

@api_view(["GET"])
def get_all_customers(request):
    """
    GET: Retrieve all customers via stored procedure refcursor (sp_get_all_customers).
    """
    try:
        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute("CALL sp_get_all_customers(%s);", ["cur_customers"])
                cursor.execute('FETCH ALL FROM "cur_customers";')
                customers = dictfetchall(cursor)

        serializer = CustomerSerializer(customers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
def get_customer_by_id(request, pk):
    """
    GET: Retrieve a single Customer by customer_id using cursor and stored procedure (sp_get_customer_by_id).
    """
    try:
        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute("CALL sp_get_customer_by_id(%s, %s);", [pk, "cur_customer"])
                cursor.execute('FETCH ALL FROM "cur_customer";')
                customer = dictfetchone(cursor)

        if not customer:
            return Response({"error": f"Customer with id {pk} not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = CustomerSerializer(customer)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
def create_customer(request):
    """
    POST: Insert a new Customer using cursor and stored procedure (sp_insert_customer).
    """
    serializer = CustomerSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    customer_code = serializer.validated_data.get("customer_code")
    customer_name = serializer.validated_data.get("customer_name")
    phone = serializer.validated_data.get("phone")
    email = serializer.validated_data.get("email")
    address = serializer.validated_data.get("address")

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "CALL sp_insert_customer(%s, %s, %s, %s, %s, %s);",
                [customer_code, customer_name, phone, email, address, None],
            )
            row = cursor.fetchone()
            customer_id = row[0] if row else None

        return Response(
            {
                "status": "success",
                "message": "Customer created successfully using stored procedure (sp_insert_customer)",
                "data": {
                    "customer_id": customer_id,
                    "customer_code": customer_code,
                    "customer_name": customer_name,
                    "phone": phone,
                    "email": email,
                    "address": address,
                },
            },
            status=status.HTTP_201_CREATED,
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PUT", "POST"])
def update_customer(request, pk):
    """
    PUT/POST: Update an existing Customer by customer_id using stored procedure (sp_update_customer).
    """
    serializer = CustomerSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    customer_code = serializer.validated_data.get("customer_code")
    customer_name = serializer.validated_data.get("customer_name")
    phone = serializer.validated_data.get("phone")
    email = serializer.validated_data.get("email")
    address = serializer.validated_data.get("address")
    is_active = serializer.validated_data.get("is_active", True)

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "CALL sp_update_customer(%s, %s, %s, %s, %s, %s, %s);",
                [pk, customer_code, customer_name, phone, email, address, is_active],
            )
        return Response(
            {"status": "success", "message": f"Customer {pk} updated successfully (sp_update_customer)"},
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE", "POST"])
def delete_customer(request, pk):
    """
    DELETE/POST: Delete a Customer by customer_id using stored procedure (sp_delete_customer).
    """
    try:
        with connection.cursor() as cursor:
            cursor.execute("CALL sp_delete_customer(%s);", [pk])
        return Response(
            {"status": "success", "message": f"Customer {pk} deleted successfully (sp_delete_customer)"},
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ==============================================================================
# COMBINED / RESTFUL ALIAS ENDPOINTS
# ==============================================================================

@api_view(["GET", "POST"])
def items_view(request):
    """Combined endpoint for GET (list) and POST (create)"""
    if request.method == "POST":
        return create_item(request._request)
    return get_all_items(request._request)


@api_view(["GET", "PUT", "DELETE"])
def item_detail_view(request, pk):
    """Combined endpoint for GET (detail), PUT (update), DELETE (delete)"""
    if request.method == "PUT":
        return update_item(request._request, pk)
    elif request.method == "DELETE":
        return delete_item(request._request, pk)
    return get_item_by_id(request._request, pk)


@api_view(["GET", "POST"])
def customers_view(request):
    """Combined endpoint for GET (list) and POST (create)"""
    if request.method == "POST":
        return create_customer(request._request)
    return get_all_customers(request._request)


@api_view(["GET", "PUT", "DELETE"])
def customer_detail_view(request, pk):
    """Combined endpoint for GET (detail), PUT (update), DELETE (delete)"""
    if request.method == "PUT":
        return update_customer(request._request, pk)
    elif request.method == "DELETE":
        return delete_customer(request._request, pk)
    return get_customer_by_id(request._request, pk)


# Backward compatibility aliases
insert_item_orm = items_view
insert_customer_orm = customers_view
