from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny

from django.contrib.auth import authenticate, get_user_model
from django.utils import timezone

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import *
from .serializers import *

User = get_user_model()


# ========================================================
# JWT CUSTOM LOGIN
# ========================================================
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


# ========================================================
# REGISTER USER
# ========================================================
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = EmployeeRegisterSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.save()

        refresh = RefreshToken.for_user(user)

        return Response({
            "user": EmployeeSerializer(user).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token)
        }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ========================================================
# LOGIN USER (FIXED FOR EMAIL SYSTEM)
# ========================================================
@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    username_or_email = request.data.get('username')  # can be email OR username
    password = request.data.get('password')

    if not username_or_email or not password:
        return Response(
            {"error": "Username/Email and password are required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(
        request,
        username=username_or_email,
        password=password
    )

    if user is None:
        return Response(
            {"error": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    refresh = RefreshToken.for_user(user)

    return Response({
        "refresh": str(refresh),
        "access": str(refresh.access_token),
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "role": user.role,
            "name": f"{user.first_name} {user.last_name}"
        }
    })

# ========================================================
# DASHBOARD (ROLE BASED)
# ========================================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    user = request.user
    role = getattr(user, 'role', 'Staff')

    data = {
        "role": role,
        "summary": {},
        "data": []
    }

    # STAFF
    if role == 'Staff':
        apps = PromotionApplication.objects.filter(employee=user)

        data["summary"] = {
            "total_applications": apps.count(),
            "pending": apps.filter(manager_status='Pending').count(),
        }

        data["data"] = PromotionApplicationSerializer(apps, many=True).data

    # MANAGER
    elif role == 'Manager':
        sub = Employee.objects.filter(manager=user)
        apps = PromotionApplication.objects.filter(employee__in=sub)

        data["summary"] = {
            "subordinates": sub.count(),
            "pending": apps.filter(manager_status='Pending').count(),
        }

        data["data"] = PromotionApplicationSerializer(apps, many=True).data

    # HR / ADMIN
    elif role in ['HR', 'Admin']:
        apps = PromotionApplication.objects.all()

        data["summary"] = {
            "employees": Employee.objects.count(),
            "pending": apps.filter(manager_status='Pending').count(),
            "departments": Department.objects.count(),
        }

        data["data"] = PromotionApplicationSerializer(apps, many=True).data

    return Response(data, status=status.HTTP_200_OK)


# ========================================================
# ELIGIBILITY CHECK
# ========================================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_eligibility(request):
    user = request.user

    if not user.job_title:
        return Response({"eligible": False, "reason": "No job title"})

    years = (timezone.now().date() - user.hire_date).days / 365.25

    if years < user.job_title.min_years_required:
        return Response({"eligible": False, "reason": "Not enough experience"})

    appraisal = Appraisal.objects.filter(employee=user).order_by('-created_at').first()

    if not appraisal:
        return Response({"eligible": False, "reason": "No appraisal record"})

    if appraisal.score < user.job_title.min_appraisal_score:
        return Response({"eligible": False, "reason": "Low performance score"})

    return Response({
        "eligible": True,
        "message": "Eligible for promotion"
    })


# ========================================================
# PROMOTION DECISION
# ========================================================
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def process_promotion_decision(request, pk):
    if request.user.role not in ['Manager', 'HR', 'Admin']:
        return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

    try:
        app = PromotionApplication.objects.get(id=pk)
    except PromotionApplication.DoesNotExist:
        return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get("status")
    comments = request.data.get("comments", "")

    app.final_status = new_status
    app.manager_comments = comments
    app.save()

    if new_status == "Approved":
        emp = app.employee

        PromotionHistory.objects.create(
            employee=emp,
            old_title=emp.job_title,
            new_title=app.targeted_title
        )

        emp.job_title = app.targeted_title
        emp.status = "Promoted"
        emp.save()

    return Response({"message": "Updated successfully"})


# ========================================================
# GENERIC CRUD
# ========================================================
def generic_api(model, serializer):

    @api_view(['GET', 'POST'])
    @permission_classes([IsAuthenticated])
    def list_create(request):
        if request.method == "GET":
            qs = model.objects.all()
            return Response(serializer(qs, many=True).data)

        serializer_obj = serializer(data=request.data)

        if serializer_obj.is_valid():
            serializer_obj.save()
            return Response(serializer_obj.data)

        return Response(serializer_obj.errors, status=400)

    @api_view(['GET', 'PUT', 'DELETE'])
    @permission_classes([IsAuthenticated])
    def detail(request, pk):
        try:
            obj = model.objects.get(id=pk)
        except model.DoesNotExist:
            return Response({"error": "Not found"}, status=404)

        if request.method == "GET":
            return Response(serializer(obj).data)

        if request.method == "PUT":
            s = serializer(obj, data=request.data)
            if s.is_valid():
                s.save()
                return Response(s.data)
            return Response(s.errors)

        if request.method == "DELETE":
            obj.delete()
            return Response({"message": "Deleted"})

    return list_create, detail


# ========================================================
# CRUD INSTANCES
# ========================================================
manage_employees_list, manage_employees_detail = generic_api(Employee, EmployeeSerializer)
manage_departments_list, manage_departments_detail = generic_api(Department, DepartmentSerializer)
manage_jobtitles_list, manage_jobtitles_detail = generic_api(JobTitle, JobTitleSerializer)
manage_appraisals_list, manage_appraisals_detail = generic_api(Appraisal, AppraisalSerializer)
manage_applications_list, manage_applications_detail = generic_api(PromotionApplication, PromotionApplicationSerializer)
manage_histories_list, manage_histories_detail = generic_api(PromotionHistory, PromotionHistorySerializer)