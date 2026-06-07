from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializers import *
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import date
from django.utils import timezone

User = get_user_model()

# ========================================================
# 1. AUTH VIEWS (Registration & Login via JWT)
# ========================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Register user => returns user info + JWT tokens
    """
    serializer = EmployeeRegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': EmployeeSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token)
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """
    Login existing user and return JWT tokens
    """
    username = request.data.get('username')  # Or email depending on your setting
    password = request.data.get('password')

    if not username or not password:
        return Response({'error': 'Username/Email and password required'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(username=username, password=password)
    if user is None:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_411_UNAUTHORIZED if hasattr(status, 'HTTP_411_UNAUTHORIZED') else status.HTTP_401_UNAUTHORIZED)

    refresh = RefreshToken.for_user(user)
    return Response({
        'refresh': str(refresh),
        'access': str(refresh.access_token),
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': getattr(user, 'role', None),
            'name': f"{user.first_name} {user.last_name}"
        }
    }, status=status.HTTP_200_OK)


# ========================================================
# 2. MAIN FUNCTION: UNIVERSAL DASHBOARD STATS
# ========================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    Main single dashboard view tailored to the logged-in user's role
    """
    user = request.user
    role = getattr(user, 'role', 'Staff')
    today = timezone.now().date()

    data = {
        'user_role': role,
        'summary_stats': {},
        'main_content': []
    }

    # --- ROLE: STANDARD STAFF ---
    if role == 'Staff':
        my_apps = PromotionApplication.objects.filter(employee=user).order_by('-created_at')
        my_appraisals = Appraisal.objects.filter(employee=user).order_by('-evaluation_date')
        
        data['summary_stats'] = {
            'total_applications': my_apps.count(),
            'pending_applications': my_apps.filter(status='Pending').count(),
            'latest_appraisal_score': my_appraisals.first().score if my_appraisals.exists() else "N/A"
        }
        data['main_content'] = PromotionApplicationSerializer(my_apps, many=True).data

    # --- ROLE: LINE MANAGER ---
    elif role == 'Manager':
        subordinates = Employee.objects.filter(manager=user)
        subordinate_apps = PromotionApplication.objects.filter(employee__in=subordinates).order_by('-created_at')
        
        data['summary_stats'] = {
            'total_subordinates': subordinates.count(),
            'pending_reviews': subordinate_apps.filter(status='Pending').count()
        }
        data['main_content'] = PromotionApplicationSerializer(subordinate_apps, many=True).data

    # --- ROLE: HR OR ADMIN ---
    elif role in ['HR', 'Admin']:
        data['summary_stats'] = {
            'total_company_staff': Employee.objects.count(),
            'total_pending_applications': PromotionApplication.objects.filter(status='Pending').count(),
            'total_departments': Department.objects.count(),
        }
        all_apps = PromotionApplication.objects.all().order_by('-created_at')
        data['main_content'] = PromotionApplicationSerializer(all_apps, many=True).data

    return Response(data, status=status.HTTP_200_OK)


# ========================================================
# 3. AUTOMATED PROMOTION ENGINE LOGIC
# ========================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_eligibility(request):
    """
    Automated evaluation engine check for custom promotion criteria
    """
    user = request.user
    if not getattr(user, 'job_title', None):
        return Response({'eligible': False, 'reason': 'No current Job Title assigned.'})

    # Evaluate service longevity
    years_served = (timezone.now().date() - user.hire_date).days / 365.25
    required_years = user.job_title.min_years_required
    
    if years_served < required_years:
        return Response({
            'eligible': False, 
            'reason': f'Requires {required_years} years of service. Current: {round(years_served, 1)} years.'
        })

    # Evaluate metric appraisal points
    latest_appraisal = Appraisal.objects.filter(employee=user).order_by('-evaluation_date').first()
    if not latest_appraisal:
        return Response({'eligible': False, 'reason': 'No performance evaluations on record.'})
        
    required_score = user.job_title.min_appraisal_score
    if latest_appraisal.score < required_score:
        return Response({
            'eligible': False,
            'reason': f'Minimum performance threshold not met. Score: {latest_appraisal.score} (Requires {required_score}).'
        })

    return Response({
        'eligible': True,
        'reason': 'All promotion eligibility thresholds met successfully.',
        'current_title': user.job_title.title
    })


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def process_promotion_decision(request, pk):
    """
    Updates application status. Automatically switches job titles upon approval.
    """
    if request.user.role not in ['Manager', 'HR', 'Admin']:
        return Response({'error': 'Unauthorized action'}, status=status.HTTP_403_FORBIDDEN)

    try:
        application = PromotionApplication.objects.get(pk=pk)
    except PromotionApplication.DoesNotExist:
        return Response({'error': 'Application record not found'}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status') # 'Approved' or 'Rejected'
    application.status = new_status
    application.comments = request.data.get('comments', '')
    application.save()

    if new_status == 'Approved':
        employee = application.employee
        # Archive history records
        PromotionHistory.objects.create(
            employee=employee,
            old_job_title=employee.job_title,
            new_job_title=application.proposed_job_title,
            promotion_date=timezone.now().date()
        )
        # Apply promotion updates
        employee.job_title = application.proposed_job_title
        employee.save()

    return Response({'message': f'Application has been updated to {new_status}'}, status=status.HTTP_200_OK)


# ========================================================
# 4. THE GENERIC CRUD FACTORY FUNCTION
# ========================================================

def generic_api(model_class, serializer_class):
    
    @api_view(['GET', 'POST'])
    @permission_classes([IsAuthenticated])
    def manage_view(request):
        if request.method == 'GET':
            objects = model_class.objects.all()
            serializer = serializer_class(objects, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == 'POST':
            serializer = serializer_class(data=request.data, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @api_view(['GET', 'PUT', 'DELETE'])
    @permission_classes([IsAuthenticated])
    def manage_detail_view(request, pk):
        try:
            obj = model_class.objects.get(pk=pk)
        except model_class.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        if request.method == 'GET':
            serializer = serializer_class(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == 'PUT':
            serializer = serializer_class(obj, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        elif request.method == 'DELETE':
            obj.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        
    return manage_view, manage_detail_view


# ========================================================
# 5. INSTANTIATE ALL 7 ARCHITECTURAL CRUD ENDPOINTS
# ========================================================

manage_employees_list, manage_employees_detail = generic_api(Employee, EmployeeSerializer)
manage_departments_list, manage_departments_detail = generic_api(Department, DepartmentSerializer)
manage_jobtitles_list, manage_jobtitles_detail = generic_api(JobTitle, JobTitleSerializer)
manage_appraisals_list, manage_appraisals_detail = generic_api(Appraisal, AppraisalSerializer)
manage_applications_list, manage_applications_detail = generic_api(PromotionApplication, PromotionApplicationSerializer)
manage_histories_list, manage_histories_detail = generic_api(PromotionHistory, PromotionHistorySerializer)