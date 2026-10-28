from rest_framework import serializers


class SalesLineItemSerializer(serializers.Serializer):
    item_id = serializers.IntegerField(required=True)
    quantity = serializers.DecimalField(max_digits=12, decimal_places=3, required=True)
    unit_price = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)


class CreateSalesOrderSerializer(serializers.Serializer):
    sales_no = serializers.CharField(max_length=20, required=True)
    sales_date = serializers.DateField(required=False)
    customer_id = serializers.IntegerField(required=True)
    status = serializers.ChoiceField(
        choices=['DRAFT', 'CONFIRMED', 'INVOICED', 'CANCELLED'],
        default='DRAFT'
    )
    remarks = serializers.CharField(max_length=250, required=False, allow_blank=True, allow_null=True)
    lines = serializers.ListField(
        child=SalesLineItemSerializer(),
        allow_empty=False,
        required=True
    )


class UpdateSalesStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=['DRAFT', 'CONFIRMED', 'INVOICED', 'CANCELLED'])
