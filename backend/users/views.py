from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .serializers import UserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserSerializer

from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        return self.request.user

    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = UserSerializer(
            user,          # ← instance passed here so unique validators exclude self
            data=request.data,
            partial=True,
            context={'request': request}
        )
        if not serializer.is_valid():
            print("--- PROFILE UPDATE VALIDATION ERRORS ---")
            print(serializer.errors)
            print("----------------------------------------")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data)

    def put(self, request, *args, **kwargs):
        return self.patch(request, *args, **kwargs)

from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from rest_framework.views import APIView

class PasswordResetRequestView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # We return success even if user doesn't exist for security (avoid email enumeration)
            return Response({"message": "If an account exists with this email, a reset link has been sent."}, status=status.HTTP_200_OK)

        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # In a real app, this would be your frontend URL
        reset_url = f"http://localhost:5173/reset-password/{uid}/{token}"
        
        send_mail(
            "Password Reset Request",
            f"Click the link below to reset your password:\n{reset_url}",
            None, # Use DEFAULT_FROM_EMAIL
            [email],
            fail_silently=False,
        )
        
        return Response({"message": "If an account exists with this email, a reset link has been sent."}, status=status.HTTP_200_OK)

class PasswordResetConfirmView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('password')

        if not all([uidb64, token, new_password]):
            return Response({"error": "Missing fields"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            return Response({"message": "Password has been reset successfully."}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

from .google_auth import verify_google_token
from rest_framework_simplejwt.tokens import RefreshToken
import uuid

class GoogleLoginView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        token = request.data.get('credential')
        if not token:
            return Response({"error": "No credential provided"}, status=status.HTTP_400_BAD_REQUEST)

        idinfo = verify_google_token(token)
        if not idinfo:
            return Response({"error": "Invalid Google token"}, status=status.HTTP_400_BAD_REQUEST)

        email = idinfo.get('email')
        first_name = idinfo.get('given_name', '')
        last_name = idinfo.get('family_name', '')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            user = User.objects.create(
                username=email,
                email=email,
                first_name=first_name,
                last_name=last_name
            )
            user.set_unusable_password()
            user.save()

        refresh = RefreshToken.for_user(user)
        
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')

        if not all([current_password, new_password, confirm_password]):
            return Response({"error": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

        if new_password != confirm_password:
            return Response({"error": "New passwords do not match."}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 8:
            return Response({"error": "Password must be at least 8 characters."}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        if not user.check_password(current_password):
            return Response({"error": "Current password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({"message": "Password changed successfully."}, status=status.HTTP_200_OK)
