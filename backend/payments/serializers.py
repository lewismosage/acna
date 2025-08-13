from rest_framework import serializers
from .models import Payment
from users.serializers import MemberSerializer

class PaymentSerializer(serializers.ModelSerializer):
    user = MemberSerializer(read_only=True)

    class Meta:
        model = Payment
        fields = '__all__'
