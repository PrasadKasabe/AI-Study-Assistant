from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'password',
            'first_name', 'last_name',
            'profile_picture', 'gemini_api_key', 'groq_api_key', 'created_at'
        )
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},  # not required on updates
            'created_at': {'read_only': True},
            'profile_picture': {'required': False},
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        return user

    def update(self, instance, validated_data):
        # Never update password through this serializer
        validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
