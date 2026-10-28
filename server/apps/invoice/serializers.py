from rest_framework import serializers


class CreateInvoiceSerializer(serializers.Serializer):
    sales_id = serializers.IntegerField(required=True)
    invoice_no = serializers.CharField(max_length=20, required=True)
    invoice_date = serializers.DateField(required=False)
    tax_rate = serializers.DecimalField(max_digits=5, decimal_places=4, default=0.05)
    payment_status = serializers.ChoiceField(
        choices=['UNPAID', 'PARTIAL', 'PAID'],
        default='UNPAID'
    )


class UpdatePaymentStatusSerializer(serializers.Serializer):
    payment_status = serializers.ChoiceField(choices=['UNPAID', 'PARTIAL', 'PAID'])
