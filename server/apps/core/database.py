from decimal import Decimal
from typing import Any, Dict, List, Optional
from django.db import connection, transaction


def dictfetchall(cursor) -> List[Dict[str, Any]]:
    """Return all rows from a cursor as a list of dictionaries."""
    if not cursor.description:
        return []
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]


def dictfetchone(cursor) -> Optional[Dict[str, Any]]:
    """Return one row from a cursor as a dictionary."""
    if not cursor.description:
        return None
    columns = [col[0] for col in cursor.description]
    row = cursor.fetchone()
    if not row:
        return None
    return dict(zip(columns, row))


def call_refcursor_procedure(procedure_name: str, cursor_name: str, params: Optional[List[Any]] = None) -> List[Dict[str, Any]]:
    """
    Executes a PostgreSQL stored procedure that returns a REFCURSOR and fetches all rows.
    Must be executed within a transaction block.
    """
    if params is None:
        params = []

    # Assemble procedure call
    all_params = list(params) + [cursor_name]
    placeholders = ", ".join(["%s"] * len(all_params))
    call_sql = f"CALL {procedure_name}({placeholders});"

    with transaction.atomic():
        with connection.cursor() as cursor:
            cursor.execute(call_sql, all_params)
            cursor.execute(f'FETCH ALL FROM "{cursor_name}";')
            return dictfetchall(cursor)


def call_refcursor_procedure_single(procedure_name: str, cursor_name: str, params: Optional[List[Any]] = None) -> Optional[Dict[str, Any]]:
    """
    Executes a PostgreSQL stored procedure that returns a REFCURSOR and fetches a single row.
    """
    rows = call_refcursor_procedure(procedure_name, cursor_name, params)
    return rows[0] if rows else None
