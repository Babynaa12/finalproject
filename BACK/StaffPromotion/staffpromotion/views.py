from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny

from django.contrib.auth import authenticate, get_user_model
from django.utils import timezone
from django.db import transaction

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import (
    Department,
    JobTitle,
    Employee,
    StudentTeachingEvaluation,
    PeerReview,
    PromotionApplication,
    PromotionMaterial,
    AcademicMaterialReview,
    PromotionAppeal,
    PromotionHistory,
    SystemLog,
    ReviewerAssignment,
)

from .serializers import *


User = get_user_model()


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def create_system_log(user, action, description="", request=None):
    """
    Create an audit log for important system actions.
    """

    ip_address = None

    if request:
        forwarded = request.META.get("HTTP_X_FORWARDED_FOR")

        if forwarded:
            ip_address = forwarded.split(",")[0]
        else:
            ip_address = request.META.get("REMOTE_ADDR")

    SystemLog.objects.create(
        user=user,
        action=action,
        description=description,
        ip_address=ip_address
    )


def user_has_role(user, roles):
    """
    Check whether logged-in user has one of the required roles.
    """

    return user.is_authenticated and user.role in roles


# ============================================================
# JWT CUSTOM LOGIN
# ============================================================

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


# ============================================================
# REGISTER USER
# ============================================================

@api_view(["POST"])
@permission_classes([AllowAny])
def register_user(request):

    serializer = EmployeeRegisterSerializer(
        data=request.data
    )

    if serializer.is_valid():

        user = serializer.save()

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "user": EmployeeSerializer(user).data,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            },
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken


@api_view(["POST"])
@permission_classes([AllowAny])
def login_user(request):

    # Accept either:
    # {
    #     "username": "...",
    #     "password": "..."
    # }
    #
    # OR
    #
    # {
    #     "email": "...",
    #     "password": "..."
    # }

    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")

    # ---------------------------------------------
    # VALIDATE PASSWORD
    # ---------------------------------------------

    if not password:
        return Response(
            {
                "error": "Password is required"
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ---------------------------------------------
    # FIND LOGIN IDENTIFIER
    # ---------------------------------------------

    if email:
        try:
            user = Employee.objects.get(email__iexact=email)
        except Employee.DoesNotExist:
            return Response(
                {
                    "error": "Invalid email or password"
                },
                status=status.HTTP_401_UNAUTHORIZED
            )

        username = user.username

    elif username:
        try:
            user = Employee.objects.get(username=username)
        except Employee.DoesNotExist:
            return Response(
                {
                    "error": "Invalid username or password"
                },
                status=status.HTTP_401_UNAUTHORIZED
            )

    else:
        return Response(
            {
                "error": "Username or email is required"
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ---------------------------------------------
    # AUTHENTICATE PASSWORD
    # ---------------------------------------------

    user = authenticate(
        request,
        username=username,
        password=password
    )

    if user is None:
        return Response(
            {
                "error": "Invalid username/email or password"
            },
            status=status.HTTP_401_UNAUTHORIZED
        )

    # ---------------------------------------------
    # CHECK ACCOUNT STATUS
    # ---------------------------------------------

    if not user.is_active:
        return Response(
            {
                "error": "Your account is inactive"
            },
            status=status.HTTP_403_FORBIDDEN
        )

    # ---------------------------------------------
    # JWT TOKEN
    # ---------------------------------------------

    refresh = RefreshToken.for_user(user)

    # ---------------------------------------------
    # SYSTEM LOG
    # ---------------------------------------------

    create_system_log(
        user,
        "LOGIN",
        "User logged into the system",
        request
    )

    # ---------------------------------------------
    # USER DATA
    # ---------------------------------------------

    user_data = {
        "id": user.id,
        "email": user.email,
        "username": user.username,

        "first_name": user.first_name,
        "last_name": user.last_name,

        "name": f"{user.first_name} {user.last_name}".strip(),

        "role": user.role,

        "department": (
            user.department.department_name
            if user.department
            else None
        ),

        "job_title": (
            user.job_title.title_name
            if user.job_title
            else None
        ),
    }

    # ---------------------------------------------
    # RESPONSE
    # ---------------------------------------------

    return Response(
        {
            "success": True,

            "refresh": str(refresh),

            "access": str(refresh.access_token),

            "user": user_data
        },
        status=status.HTTP_200_OK
    )

    # ==========================================
    # USER INFORMATION
    # ==========================================

    user_data = {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "name": f"{user.first_name} {user.last_name}".strip(),

        "role": role,

        "department": (
            user.department.department_name
            if user.department else None
        ),

        "job_title": (
            user.job_title.title_name
            if user.job_title else None
        ),
    }

    # ==========================================
    # RESPONSE
    # ==========================================

    return Response(
        {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": user_data
        },
        status=status.HTTP_200_OK
    )
# ============================================================
# CURRENT USER PROFILE
# ============================================================

@api_view(["GET", "PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def my_profile(request):

    user = request.user

    if request.method == "GET":

        return Response(
            EmployeeSerializer(user).data
        )

    serializer = EmployeeSerializer(
        user,
        data=request.data,
        partial=True
    )

    if serializer.is_valid():

        # Staff should not change their own role
        if "role" in request.data:
            return Response(
                {
                    "error":
                    "System role cannot be changed from profile."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # Staff should not change promotion-controlled fields
        if user.role == "STAFF":

            protected = [
                "job_title",
                "status",
                "manager",
            ]

            for field in protected:

                if field in request.data:

                    return Response(
                        {
                            "error":
                            f"You cannot change {field}."
                        },
                        status=status.HTTP_403_FORBIDDEN
                    )

        serializer.save()

        create_system_log(
            user,
            "PROFILE_UPDATE",
            "User updated personal profile",
            request
        )

        return Response(
            EmployeeSerializer(user).data
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


# ============================================================
# DASHBOARD
# ============================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):

    user = request.user
    role = user.role

    data = {
        "role": role,
        "summary": {},
        "recent_applications": []
    }

    # ========================================================
    # STAFF DASHBOARD
    # ========================================================

    if role == "STAFF":

        applications = PromotionApplication.objects.filter(
            employee=user
        )

        data["summary"] = {
            "applications":
                applications.count(),

            "draft":
                applications.filter(
                    status="DRAFT"
                ).count(),

            "pending":
                applications.exclude(
                    status__in=[
                        "APPROVED",
                        "REJECTED"
                    ]
                ).count(),

            "approved":
                applications.filter(
                    status="APPROVED"
                ).count(),

            "rejected":
                applications.filter(
                    status="REJECTED"
                ).count(),
        }

        recent = applications.order_by(
            "-created_at"
        )[:10]

        data["recent_applications"] = (
            PromotionApplicationSerializer(
                recent,
                many=True
            ).data
        )

    # ========================================================
    # STUDENT DASHBOARD
    # ========================================================

    elif role == "STUDENT":

        evaluations = StudentTeachingEvaluation.objects.filter(
            student=user
        )

        data["summary"] = {
            "evaluations":
                evaluations.count()
        }

    # ========================================================
    # HOD DASHBOARD
    # ========================================================

    elif role == "HOD":

        applications = PromotionApplication.objects.filter(
            hod=user
        )

        data["summary"] = {
            "applications":
                applications.count(),

            "pending":
                applications.filter(
                    status="HOD_REVIEW"
                ).count(),

            "approved":
                applications.filter(
                    status="DEAN_REVIEW"
                ).count(),

            "rejected":
                applications.filter(
                    status="REJECTED"
                ).count(),
        }

        recent = applications.order_by(
            "-created_at"
        )[:10]

        data["recent_applications"] = (
            PromotionApplicationSerializer(
                recent,
                many=True
            ).data
        )

    # ========================================================
    # DEAN DASHBOARD
    # ========================================================

    elif role == "DEAN":

        applications = PromotionApplication.objects.filter(
            dean=user
        )

        data["summary"] = {
            "applications":
                applications.count(),

            "pending":
                applications.filter(
                    status="DEAN_REVIEW"
                ).count(),

            "under_review":
                applications.filter(
                    status="UNDER_REVIEW"
                ).count(),

            "rejected":
                applications.filter(
                    status="REJECTED"
                ).count(),
        }

    # ========================================================
    # REVIEWER DASHBOARD
    # ========================================================

    elif role == "REVIEWER":

        assignments = ReviewerAssignment.objects.filter(
            reviewer=user
        )

        data["summary"] = {
            "assigned":
                assignments.count(),

            "pending":
                assignments.filter(
                    completed=False
                ).count(),

            "completed":
                assignments.filter(
                    completed=True
                ).count(),
        }

    # ========================================================
    # COMMITTEE DASHBOARD
    # ========================================================

    elif role == "COMMITTEE":

        applications = PromotionApplication.objects.filter(
            status="COMMITTEE_REVIEW"
        )

        data["summary"] = {
            "pending":
                applications.count(),

            "approved":
                PromotionApplication.objects.filter(
                    status="APPROVED"
                ).count(),

            "rejected":
                PromotionApplication.objects.filter(
                    status="REJECTED"
                ).count(),
        }

    # ========================================================
    # APPEAL COMMITTEE
    # ========================================================

    elif role == "APPEAL_COMMITTEE":

        appeals = PromotionAppeal.objects.all()

        data["summary"] = {
            "total":
                appeals.count(),

            "pending":
                appeals.filter(
                    status="UNDER_REVIEW"
                ).count(),

            "upheld":
                appeals.filter(
                    status="UPHELD"
                ).count(),

            "rejected":
                appeals.filter(
                    status="REJECTED"
                ).count(),
        }

    # ========================================================
    # ADMIN
    # ========================================================

    elif role == "ADMIN":

        applications = PromotionApplication.objects.all()

        data["summary"] = {
            "employees":
                Employee.objects.count(),

            "departments":
                Department.objects.count(),

            "applications":
                applications.count(),

            "pending":
                applications.exclude(
                    status__in=[
                        "APPROVED",
                        "REJECTED"
                    ]
                ).count(),

            "approved":
                applications.filter(
                    status="APPROVED"
                ).count(),

            "rejected":
                applications.filter(
                    status="REJECTED"
                ).count(),

            "reviews":
                AcademicMaterialReview.objects.count(),

            "appeals":
                PromotionAppeal.objects.count(),
        }

    return Response(data)


# ============================================================
# ELIGIBILITY CHECK
# ============================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def check_eligibility(request):

    user = request.user

    if user.role != "STAFF":

        return Response(
            {
                "eligible": False,
                "reason":
                "Only academic staff can apply for promotion."
            }
        )

    if not user.job_title:

        return Response(
            {
                "eligible": False,
                "reason":
                "Current academic rank is not assigned."
            }
        )

    if not user.current_position_appointment_date:

        return Response(
            {
                "eligible": False,
                "reason":
                "Current position appointment date is missing."
            }
        )

    today = timezone.now().date()

    years = (
        today -
        user.current_position_appointment_date
    ).days / 365.25

    if years < user.job_title.min_years_required:

        return Response(
            {
                "eligible": False,
                "reason":
                "Required years in current position have not been completed.",
                "years_completed":
                round(years, 2),
                "years_required":
                user.job_title.min_years_required
            }
        )

    # ========================================================
    # CHECK TEACHING EVALUATION
    # ========================================================

    teaching_evaluations = (
        StudentTeachingEvaluation.objects.filter(
            instructor=user
        )
    )

    if not teaching_evaluations.exists():

        return Response(
            {
                "eligible": False,
                "reason":
                "No student teaching evaluation found."
            }
        )

    # ========================================================
    # CHECK PEER REVIEW
    # ========================================================

    peer_reviews = PeerReview.objects.filter(
        instructor=user
    )

    if not peer_reviews.exists():

        return Response(
            {
                "eligible": False,
                "reason":
                "No peer review found."
            }
        )

    return Response(
        {
            "eligible": True,
            "message":
            "Staff member meets the basic promotion eligibility requirements.",
            "years_completed":
            round(years, 2)
        }
    )


# ============================================================
# STUDENT TEACHING EVALUATION
# ============================================================

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def teaching_evaluations(request):

    # ========================================================
    # GET
    # ========================================================

    if request.method == "GET":

        if request.user.role == "STUDENT":

            evaluations = (
                StudentTeachingEvaluation.objects.filter(
                    student=request.user
                )
            )

        elif request.user.role == "STAFF":

            evaluations = (
                StudentTeachingEvaluation.objects.filter(
                    instructor=request.user
                )
            )

        elif request.user.role in [
            "HOD",
            "DEAN",
            "ADMIN",
            "COMMITTEE"
        ]:

            evaluations = (
                StudentTeachingEvaluation.objects.all()
            )

        else:

            return Response(
                {"error": "Unauthorized"},
                status=status.HTTP_403_FORBIDDEN
            )

        return Response(
            StudentTeachingEvaluationSerializer(
                evaluations,
                many=True
            ).data
        )

    # ========================================================
    # POST
    # ========================================================

    if request.user.role != "STUDENT":

        return Response(
            {
                "error":
                "Only students can submit teaching evaluations."
            },
            status=status.HTTP_403_FORBIDDEN
        )

    data = request.data.copy()

    data["student"] = request.user.id

    serializer = StudentTeachingEvaluationSerializer(
        data=data
    )

    if serializer.is_valid():

        evaluation = serializer.save()

        create_system_log(
            request.user,
            "TEACHING_EVALUATION_SUBMITTED",
            f"Evaluation submitted for {evaluation.instructor}",
            request
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


# ============================================================
# PEER REVIEW
# ============================================================

@api_view(["GET", "POST", "PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def peer_reviews(request, pk=None):

    # ========================================================
    # GET LIST
    # ========================================================

    if request.method == "GET":

        if pk:

            try:

                review = PeerReview.objects.get(
                    id=pk
                )

            except PeerReview.DoesNotExist:

                return Response(
                    {"error": "Peer review not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            return Response(
                PeerReviewSerializer(review).data
            )

        if request.user.role == "REVIEWER":

            reviews = PeerReview.objects.filter(
                reviewer=request.user
            )

        elif request.user.role == "STAFF":

            reviews = PeerReview.objects.filter(
                instructor=request.user
            )

        else:

            reviews = PeerReview.objects.all()

        return Response(
            PeerReviewSerializer(
                reviews,
                many=True
            ).data
        )

    # ========================================================
    # CREATE PEER REVIEW
    # ========================================================

    if request.method == "POST":

        if request.user.role != "REVIEWER":

            return Response(
                {
                    "error":
                    "Only assigned reviewers can submit peer reviews."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        data = request.data.copy()

        data["reviewer"] = request.user.id

        serializer = PeerReviewSerializer(
            data=data
        )

        if serializer.is_valid():

            review = serializer.save()

            create_system_log(
                request.user,
                "PEER_REVIEW_SUBMITTED",
                f"Peer review submitted for {review.instructor}",
                request
            )

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    # ========================================================
    # UPDATE REVIEW
    # ========================================================

    if request.user.role != "REVIEWER":

        return Response(
            {
                "error":
                "Only reviewers can update peer reviews."
            },
            status=status.HTTP_403_FORBIDDEN
        )

    try:

        review = PeerReview.objects.get(
            id=pk,
            reviewer=request.user
        )

    except PeerReview.DoesNotExist:

        return Response(
            {"error": "Peer review not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = PeerReviewSerializer(
        review,
        data=request.data,
        partial=True
    )

    if serializer.is_valid():

        serializer.save()

        return Response(
            serializer.data
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


# ============================================================
# CREATE PROMOTION APPLICATION
# ============================================================

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def promotion_applications(request):

    # ========================================================
    # GET
    # ========================================================

    if request.method == "GET":

        user = request.user

        if user.role == "STAFF":

            applications = (
                PromotionApplication.objects.filter(
                    employee=user
                )
            )

        elif user.role == "HOD":

            applications = (
                PromotionApplication.objects.filter(
                    hod=user
                )
            )

        elif user.role == "DEAN":

            applications = (
                PromotionApplication.objects.filter(
                    dean=user
                )
            )

        elif user.role == "REVIEWER":

            assignments = ReviewerAssignment.objects.filter(
                reviewer=user
            )

            applications = (
                PromotionApplication.objects.filter(
                    reviewer_assignments__in=assignments
                )
            )

        elif user.role in [
            "COMMITTEE",
            "ADMIN"
        ]:

            applications = (
                PromotionApplication.objects.all()
            )

        else:

            applications = (
                PromotionApplication.objects.none()
            )

        return Response(
            PromotionApplicationSerializer(
                applications.order_by("-created_at"),
                many=True
            ).data
        )

    # ========================================================
    # STAFF SUBMITS APPLICATION
    # ========================================================

    if request.user.role != "STAFF":

        return Response(
            {
                "error":
                "Only academic staff can submit promotion applications."
            },
            status=status.HTTP_403_FORBIDDEN
        )

    # ========================================================
    # CHECK ELIGIBILITY
    # ========================================================

    if not request.user.job_title:

        return Response(
            {
                "error":
                "Current job title is required."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    data = request.data.copy()

    data["employee"] = request.user.id

    serializer = PromotionApplicationSerializer(
        data=data
    )

    if serializer.is_valid():

        application = serializer.save()

        create_system_log(
            request.user,
            "PROMOTION_APPLICATION_CREATED",
            f"Promotion application created: {application.id}",
            request
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )

# ============================================================
# PROMOTION DECISION
# ============================================================

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def process_promotion_decision(request, pk):
    """
    Process a promotion application according to the user's role.

    Workflow:
    STAFF -> HOD -> DEAN -> REVIEWER/COMMITTEE -> APPROVED/REJECTED
    """

    try:
        application = PromotionApplication.objects.get(pk=pk)
    except PromotionApplication.DoesNotExist:
        return Response(
            {"error": "Promotion application not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    user = request.user
    role = user.role

    decision = request.data.get("decision")
    comments = request.data.get("comments", "")
    recommendation = request.data.get("recommendation", "")

    # --------------------------------------------------------
    # HOD
    # --------------------------------------------------------

    if role == "HOD":

        if application.status not in ["SUBMITTED", "HOD_REVIEW"]:
            return Response(
                {
                    "error": (
                        "This application is not currently "
                        "available for HOD review."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        application.hod = user
        application.hod_recommendation = recommendation
        application.hod_comments = comments
        application.hod_reviewed_at = timezone.now()

        if decision == "RECOMMENDED":
            application.status = "DEAN_REVIEW"

        elif decision == "REJECTED":
            application.status = "REJECTED"

        else:
            return Response(
                {
                    "error": (
                        "Invalid HOD decision. "
                        "Use RECOMMENDED or REJECTED."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        application.save()

        return Response(
            {
                "message": "HOD decision recorded successfully.",
                "status": application.status
            },
            status=status.HTTP_200_OK
        )

    # --------------------------------------------------------
    # DEAN
    # --------------------------------------------------------

    elif role == "DEAN":

        if application.status != "DEAN_REVIEW":
            return Response(
                {
                    "error": (
                        "This application is not currently "
                        "available for Dean review."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        application.dean = user
        application.dean_recommendation = recommendation
        application.dean_comments = comments
        application.dean_reviewed_at = timezone.now()

        if decision == "RECOMMENDED":
            application.status = "UNDER_REVIEW"

        elif decision == "REJECTED":
            application.status = "REJECTED"

        else:
            return Response(
                {
                    "error": (
                        "Invalid Dean decision. "
                        "Use RECOMMENDED or REJECTED."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        application.save()

        return Response(
            {
                "message": "Dean decision recorded successfully.",
                "status": application.status
            },
            status=status.HTTP_200_OK
        )

    # --------------------------------------------------------
    # REVIEWER
    # --------------------------------------------------------

    elif role == "REVIEWER":

        if application.status != "UNDER_REVIEW":
            return Response(
                {
                    "error": (
                        "This application is not currently "
                        "available for academic review."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        application.assigned_reviewer = user
        application.status = "COMMITTEE_REVIEW"

        application.save()

        return Response(
            {
                "message": "Reviewer assessment submitted successfully.",
                "status": application.status
            },
            status=status.HTTP_200_OK
        )

    # --------------------------------------------------------
    # PROMOTION COMMITTEE
    # --------------------------------------------------------

    elif role == "COMMITTEE":

        if application.status != "COMMITTEE_REVIEW":
            return Response(
                {
                    "error": (
                        "This application is not currently "
                        "available for committee decision."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        application.committee_decision = decision
        application.committee_comments = comments
        application.committee_decided_at = timezone.now()

        if decision == "APPROVED":

            old_title = application.current_title
            new_title = application.targeted_title
            employee = application.employee

            # Create promotion history
            PromotionHistory.objects.create(
                employee=employee,
                application=application,
                old_title=old_title,
                new_title=new_title,
                approval_date=timezone.now().date(),
                comments=comments
            )

            # Update employee's current academic rank
            employee.job_title = new_title
            employee.save()

            application.status = "APPROVED"

        elif decision == "REJECTED":

            application.status = "REJECTED"

        else:
            return Response(
                {
                    "error": (
                        "Invalid committee decision. "
                        "Use APPROVED or REJECTED."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        application.save()

        return Response(
            {
                "message": "Promotion committee decision recorded.",
                "status": application.status
            },
            status=status.HTTP_200_OK
        )

    # --------------------------------------------------------
    # APPEAL COMMITTEE
    # --------------------------------------------------------

    elif role == "APPEAL_COMMITTEE":

        return Response(
            {
                "error": (
                    "Appeals must be processed through "
                    "the promotion appeal endpoint."
                )
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # --------------------------------------------------------
    # ADMIN
    # --------------------------------------------------------

    elif role == "ADMIN":

        if decision == "APPROVED":

            old_title = application.current_title
            new_title = application.targeted_title
            employee = application.employee

            PromotionHistory.objects.create(
                employee=employee,
                application=application,
                old_title=old_title,
                new_title=new_title,
                approval_date=timezone.now().date(),
                comments=comments
            )

            employee.job_title = new_title
            employee.save()

            application.status = "APPROVED"

        elif decision == "REJECTED":

            application.status = "REJECTED"

        else:
            return Response(
                {"error": "Invalid decision."},
                status=status.HTTP_400_BAD_REQUEST
            )

        application.committee_comments = comments
        application.committee_decided_at = timezone.now()
        application.save()

        return Response(
            {
                "message": "Application updated by administrator.",
                "status": application.status
            },
            status=status.HTTP_200_OK
        )

    # --------------------------------------------------------
    # STAFF / STUDENT / OTHER USERS
    # --------------------------------------------------------

    return Response(
        {
            "error": (
                "You are not authorized to process "
                "this promotion application."
            )
        },
        status=status.HTTP_403_FORBIDDEN
    )

# ============================================================
# SUBMIT PROMOTION APPLICATION
# ============================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def submit_promotion_application(request, pk):

    if request.user.role != "STAFF":

        return Response(
            {
                "error":
                "Only the applicant can submit the application."
            },
            status=status.HTTP_403_FORBIDDEN
        )

    try:

        application = PromotionApplication.objects.get(
            id=pk,
            employee=request.user
        )

    except PromotionApplication.DoesNotExist:

        return Response(
            {"error": "Application not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    if application.status != "DRAFT":

        return Response(
            {
                "error":
                "Only draft applications can be submitted."
            },
            status=status.HTTP_400_BAD_REQUEST
        )
# ============================================================
# PROMOTION MATERIALS / CHECKLIST
# Appendix 3 - Promotion Checklist Materials
# ============================================================

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def promotion_materials(request):

    # ========================================================
    # GET MATERIALS
    # ========================================================

    if request.method == "GET":

        application_id = request.query_params.get("application")

        # ----------------------------------------------------
        # STAFF
        # ----------------------------------------------------

        if request.user.role == "STAFF":

            materials = PromotionMaterial.objects.filter(
                application__employee=request.user
            )

        # ----------------------------------------------------
        # REVIEWER / COMMITTEE / ADMIN
        # ----------------------------------------------------

        elif request.user.role in [
            "REVIEWER",
            "COMMITTEE",
            "ADMIN",
            "DEAN",
            "HOD",
        ]:

            materials = PromotionMaterial.objects.all()

        else:

            return Response(
                {
                    "error": "You are not authorized to view promotion materials."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # ----------------------------------------------------
        # FILTER BY APPLICATION
        # ----------------------------------------------------

        if application_id:

            materials = materials.filter(
                application_id=application_id
            )

        materials = materials.order_by("-created_at")

        return Response(
            PromotionMaterialSerializer(
                materials,
                many=True
            ).data
        )

    # ========================================================
    # POST MATERIAL
    # ========================================================

    if request.user.role != "STAFF":

        return Response(
            {
                "error":
                "Only academic staff can add promotion materials."
            },
            status=status.HTTP_403_FORBIDDEN
        )

    data = request.data.copy()

    application_id = data.get("application")

    if not application_id:

        return Response(
            {
                "error":
                "Promotion application is required."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # --------------------------------------------------------
    # CHECK APPLICATION
    # --------------------------------------------------------

    try:

        application = PromotionApplication.objects.get(
            id=application_id,
            employee=request.user
        )

    except PromotionApplication.DoesNotExist:

        return Response(
            {
                "error":
                "Promotion application not found."
            },
            status=status.HTTP_404_NOT_FOUND
        )

    # --------------------------------------------------------
    # ONLY DRAFT APPLICATION
    # --------------------------------------------------------

    if application.status != "DRAFT":

        return Response(
            {
                "error":
                "Materials can only be added while the application is in DRAFT status."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # --------------------------------------------------------
    # SERIALIZE
    # --------------------------------------------------------

    serializer = PromotionMaterialSerializer(
        data=data
    )

    if serializer.is_valid():

        material = serializer.save(
            application=application
        )

        create_system_log(
            request.user,
            "PROMOTION_MATERIAL_CREATED",
            (
                f"Promotion material '{material.title}' "
                f"added to application {application.id}"
            ),
            request
        )

        return Response(
            PromotionMaterialSerializer(material).data,
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


# ============================================================
# PROMOTION MATERIAL DETAIL
# ============================================================

@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def promotion_material_detail(request, pk):

    # --------------------------------------------------------
    # FIND MATERIAL
    # --------------------------------------------------------

    try:

        material = PromotionMaterial.objects.get(
            id=pk
        )

    except PromotionMaterial.DoesNotExist:

        return Response(
            {
                "error":
                "Promotion material not found."
            },
            status=status.HTTP_404_NOT_FOUND
        )

    # --------------------------------------------------------
    # ACCESS CONTROL
    # --------------------------------------------------------

    if request.user.role == "STAFF":

        if material.application.employee != request.user:

            return Response(
                {
                    "error":
                    "You are not authorized to access this material."
                },
                status=status.HTTP_403_FORBIDDEN
            )

    elif request.user.role not in [
        "REVIEWER",
        "COMMITTEE",
        "ADMIN",
        "DEAN",
        "HOD",
    ]:

        return Response(
            {
                "error":
                "You are not authorized to access this material."
            },
            status=status.HTTP_403_FORBIDDEN
        )

    # ========================================================
    # GET
    # ========================================================

    if request.method == "GET":

        return Response(
            PromotionMaterialSerializer(
                material
            ).data
        )

    # ========================================================
    # STAFF UPDATE / DELETE
    # ========================================================

    if request.user.role == "STAFF":

        if material.application.status != "DRAFT":

            return Response(
                {
                    "error":
                    "Materials can only be modified while the application is in DRAFT status."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

    # ========================================================
    # UPDATE
    # ========================================================

    if request.method in [
        "PUT",
        "PATCH"
    ]:

        serializer = PromotionMaterialSerializer(
            material,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            updated_material = serializer.save()

            create_system_log(
                request.user,
                "PROMOTION_MATERIAL_UPDATED",
                (
                    f"Promotion material "
                    f"{updated_material.id} updated"
                ),
                request
            )

            return Response(
                PromotionMaterialSerializer(
                    updated_material
                ).data
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    # ========================================================
    # DELETE
    # ========================================================

    if request.method == "DELETE":

        material_id = material.id

        material.delete()

        create_system_log(
            request.user,
            "PROMOTION_MATERIAL_DELETED",
            f"Promotion material {material_id} deleted",
            request
        )

        return Response(
            {
                "message":
                "Promotion material deleted successfully."
            },
            status=status.HTTP_204_NO_CONTENT
        )

        
    # ========================================================
    # REQUIRED DOCUMENT CHECK
    # ========================================================

    if not application.cv:

        return Response(
            {"error": "CV is required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not application.promotion_application_form:

        return Response(
            {
                "error":
                "Promotion application form is required."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    if not application.checklist_form:

        return Response(
            {
                "error":
                "Checklist form is required."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    application.status = "HOD_REVIEW"
    application.submitted_at = timezone.now()
    application.save()

    create_system_log(
        request.user,
        "PROMOTION_APPLICATION_SUBMITTED",
        f"Application {application.id} submitted to HOD",
        request
    )

    return Response(
        {
            "message":
            "Promotion application submitted successfully.",
            "status":
            application.status
        }
    )


# ============================================================
# HOD REVIEW
# ============================================================

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def hod_review_application(request, pk):

    if request.user.role not in [
        "HOD",
        "ADMIN"
    ]:

        return Response(
            {
                "error":
                "Only HOD or Admin can perform this action."
            },
            status=status.HTTP_403_FORBIDDEN
        )

    try:

        application = PromotionApplication.objects.get(
            id=pk
        )

    except PromotionApplication.DoesNotExist:

        return Response(
            {"error": "Application not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    decision = request.data.get(
        "decision"
    )

    comments = request.data.get(
        "comments",
        ""
    )

    # ========================================================
    # REJECT
    # ========================================================

    if decision == "REJECT":

        application.status = "REJECTED"
        application.hod = request.user
        application.hod_comments = comments
        application.hod_reviewed_at = timezone.now()

    # ========================================================
    # RECOMMEND
    # ========================================================

    elif decision == "RECOMMEND":

        application.status = "DEAN_REVIEW"
        application.hod = request.user
        application.hod_recommendation = "Recommended"
        application.hod_comments = comments
        application.hod_reviewed_at = timezone.now()

    else:

        return Response(
            {
                "error":
                "Decision must be RECOMMEND or REJECT."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    application.save()

    create_system_log(
        request.user,
        "HOD_REVIEW",
        f"HOD reviewed application {application.id}: {decision}",
        request
    )

    return Response(
        PromotionApplicationSerializer(
            application
        ).data
    )


# ============================================================
# DEAN REVIEW
# ============================================================

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def dean_review_application(request, pk):

    if request.user.role not in [
        "DEAN",
        "ADMIN"
    ]:

        return Response(
            {
                "error":
                "Only Dean or Admin can perform this action."
            },
            status=status.HTTP_403_FORBIDDEN
        )

    try:

        application = PromotionApplication.objects.get(
            id=pk
        )

    except PromotionApplication.DoesNotExist:

        return Response(
            {"error": "Application not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    decision = request.data.get(
        "decision"
    )

    comments = request.data.get(
        "comments",
        ""
    )

    if decision == "REJECT":

        application.status = "REJECTED"

    elif decision == "RECOMMEND":

        application.status = "UNDER_REVIEW"

    else:

        return Response(
            {
                "error":
                "Decision must be RECOMMEND or REJECT."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    application.dean = request.user
    application.dean_recommendation = decision
    application.dean_comments = comments
    application.dean_reviewed_at = timezone.now()

    application.save()

    create_system_log(
        request.user,
        "DEAN_REVIEW",
        f"Dean reviewed application {application.id}: {decision}",
        request
    )

    return Response(
        PromotionApplicationSerializer(
            application
        ).data
    )


# ============================================================
# ASSIGN REVIEWER
# ============================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def assign_reviewer(request, application_id):

    if request.user.role not in [
        "DEAN",
        "COMMITTEE",
        "ADMIN"
    ]:

        return Response(
            {
                "error":
                "Only Dean, Committee or Admin can assign reviewers."
            },
            status=status.HTTP_403_FORBIDDEN
        )

    reviewer_id = request.data.get(
        "reviewer"
    )

    if not reviewer_id:

        return Response(
            {
                "error":
                "Reviewer is required."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    try:

        application = PromotionApplication.objects.get(
            id=application_id
        )

        reviewer = Employee.objects.get(
            id=reviewer_id,
            role="REVIEWER"
        )

    except (
        PromotionApplication.DoesNotExist,
        Employee.DoesNotExist
    ):

        return Response(
            {
                "error":
                "Application or reviewer not found."
            },
            status=status.HTTP_404_NOT_FOUND
        )

    assignment = ReviewerAssignment.objects.create(
        application=application,
        reviewer=reviewer,
        assigned_by=request.user
    )

    application.assigned_reviewer = reviewer
    application.status = "UNDER_REVIEW"
    application.save()

    create_system_log(
        request.user,
        "REVIEWER_ASSIGNED",
        f"Reviewer {reviewer} assigned to application {application.id}",
        request
    )

    return Response(
        ReviewerAssignmentSerializer(
            assignment
        ).data,
        status=status.HTTP_201_CREATED
    )


# ============================================================
# REVIEW PROMOTION MATERIAL
# ============================================================

@api_view(["GET", "POST", "PATCH"])
@permission_classes([IsAuthenticated])
def material_reviews(request, pk=None):

    # ========================================================
    # GET
    # ========================================================

    if request.method == "GET":

        if request.user.role == "REVIEWER":

            reviews = (
                AcademicMaterialReview.objects.filter(
                    reviewer=request.user
                )
            )

        elif request.user.role in [
            "COMMITTEE",
            "ADMIN"
        ]:

            reviews = (
                AcademicMaterialReview.objects.all()
            )

        else:

            reviews = (
                AcademicMaterialReview.objects.none()
            )

        return Response(
            AcademicMaterialReviewSerializer(
                reviews,
                many=True
            ).data
        )

    # ========================================================
    # REVIEWER ONLY
    # ========================================================

    if request.user.role != "REVIEWER":

        return Response(
            {
                "error":
                "Only reviewers can review academic materials."
            },
            status=status.HTTP_403_FORBIDDEN
        )

    # ========================================================
    # CREATE
    # ========================================================

    if request.method == "POST":

        data = request.data.copy()

        data["reviewer"] = request.user.id

        serializer = AcademicMaterialReviewSerializer(
            data=data
        )

        if serializer.is_valid():

            review = serializer.save()

            create_system_log(
                request.user,
                "ACADEMIC_MATERIAL_REVIEW",
                f"Material review submitted for {review.material}",
                request
            )

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    # ========================================================
    # UPDATE
    # ========================================================

    try:

        review = AcademicMaterialReview.objects.get(
            id=pk,
            reviewer=request.user
        )

    except AcademicMaterialReview.DoesNotExist:

        return Response(
            {
                "error":
                "Review not found."
            },
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = AcademicMaterialReviewSerializer(
        review,
        data=request.data,
        partial=True
    )

    if serializer.is_valid():

        serializer.save()

        return Response(
            serializer.data
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


# ============================================================
# PROMOTION COMMITTEE DECISION
# ============================================================

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def committee_decision(request, pk):

    if request.user.role not in [
        "COMMITTEE",
        "ADMIN"
    ]:

        return Response(
            {
                "error":
                "Only Promotion Committee can make decisions."
            },
            status=status.HTTP_403_FORBIDDEN
        )

    try:

        application = PromotionApplication.objects.get(
            id=pk
        )

    except PromotionApplication.DoesNotExist:

        return Response(
            {
                "error":
                "Application not found."
            },
            status=status.HTTP_404_NOT_FOUND
        )

    decision = request.data.get(
        "decision"
    )

    comments = request.data.get(
        "comments",
        ""
    )

    if decision not in [
        "APPROVED",
        "REJECTED"
    ]:

        return Response(
            {
                "error":
                "Decision must be APPROVED or REJECTED."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    with transaction.atomic():

        application.committee_decision = decision
        application.committee_comments = comments
        application.committee_decided_at = timezone.now()
        application.status = decision

        application.save()

        # ====================================================
        # APPROVED
        # ====================================================

        if decision == "APPROVED":

            employee = application.employee

            old_title = employee.job_title

            new_title = application.targeted_title

            if old_title and new_title:

                PromotionHistory.objects.create(
                    employee=employee,
                    application=application,
                    old_title=old_title,
                    new_title=new_title,
                    approval_date=timezone.now().date(),
                    comments=comments
                )

                employee.job_title = new_title
                employee.save()

    create_system_log(
        request.user,
        "COMMITTEE_DECISION",
        f"Committee decision for application {application.id}: {decision}",
        request
    )

    return Response(
        {
            "message":
            "Promotion decision recorded.",
            "status":
            application.status
        }
    )


# ============================================================
# APPEAL
# Appendix 5
# ============================================================

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def promotion_appeals(request):

    # ========================================================
    # GET
    # ========================================================

    if request.method == "GET":

        if request.user.role == "STAFF":

            appeals = PromotionAppeal.objects.filter(
                applicant=request.user
            )

        elif request.user.role in [
            "APPEAL_COMMITTEE",
            "ADMIN"
        ]:

            appeals = PromotionAppeal.objects.all()

        else:

            return Response(
                {
                    "error":
                    "Unauthorized"
                },
                status=status.HTTP_403_FORBIDDEN
            )

        return Response(
            PromotionAppealSerializer(
                appeals,
                many=True
            ).data
        )

    # ========================================================
    # CREATE APPEAL
    # ========================================================

    if request.user.role != "STAFF":

        return Response(
            {
                "error":
                "Only academic staff can submit an appeal."
            },
            status=status.HTTP_403_FORBIDDEN
        )

    application_id = request.data.get(
        "application"
    )

    try:

        application = PromotionApplication.objects.get(
            id=application_id,
            employee=request.user
        )

    except PromotionApplication.DoesNotExist:

        return Response(
            {
                "error":
                "Application not found."
            },
            status=status.HTTP_404_NOT_FOUND
        )

    if application.status != "REJECTED":

        return Response(
            {
                "error":
                "Appeal can only be submitted against a rejected application."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    data = request.data.copy()

    data["applicant"] = request.user.id

    serializer = PromotionAppealSerializer(
        data=data
    )

    if serializer.is_valid():

        appeal = serializer.save()

        application.status = "APPEALED"
        application.save()

        create_system_log(
            request.user,
            "PROMOTION_APPEAL_SUBMITTED",
            f"Appeal submitted for application {application.id}",
            request
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


# ============================================================
# APPEAL COMMITTEE DECISION
# ============================================================

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def appeal_decision(request, pk):

    if request.user.role not in [
        "APPEAL_COMMITTEE",
        "ADMIN"
    ]:

        return Response(
            {
                "error":
                "Only Appeal Committee can process appeals."
            },
            status=status.HTTP_403_FORBIDDEN
        )

    try:

        appeal = PromotionAppeal.objects.get(
            id=pk
        )

    except PromotionAppeal.DoesNotExist:

        return Response(
            {
                "error":
                "Appeal not found."
            },
            status=status.HTTP_404_NOT_FOUND
        )

    decision = request.data.get(
        "decision"
    )

    comments = request.data.get(
        "comments",
        ""
    )

    if decision not in [
        "UPHELD",
        "REJECTED"
    ]:

        return Response(
            {
                "error":
                "Decision must be UPHELD or REJECTED."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    appeal.status = decision
    appeal.appeal_decision = decision
    appeal.appeal_committee_comments = comments
    appeal.decided_at = timezone.now()

    appeal.save()

    # ========================================================
    # IF APPEAL IS UPHELD
    # ========================================================

    if decision == "UPHELD":

        application = appeal.application

        employee = application.employee

        old_title = employee.job_title

        new_title = application.targeted_title

        if old_title and new_title:

            PromotionHistory.objects.create(
                employee=employee,
                application=application,
                old_title=old_title,
                new_title=new_title,
                approval_date=timezone.now().date(),
                comments="Promotion approved through appeal."
            )

            employee.job_title = new_title
            employee.save()

        application.status = "APPROVED"
        application.save()

    create_system_log(
        request.user,
        "APPEAL_DECISION",
        f"Appeal {appeal.id}: {decision}",
        request
    )

    return Response(
        {
            "message":
            "Appeal decision recorded.",
            "status":
            appeal.status
        }
    )


# ============================================================
# GENERIC CRUD
# ============================================================

def generic_api(model, serializer_class):

    @api_view(["GET", "POST"])
    @permission_classes([IsAuthenticated])
    def list_create(request):

        if request.method == "GET":

            queryset = model.objects.all()

            return Response(
                serializer_class(
                    queryset,
                    many=True
                ).data
            )

        serializer = serializer_class(
            data=request.data
        )

        if serializer.is_valid():

            obj = serializer.save()

            create_system_log(
                request.user,
                f"{model.__name__.upper()}_CREATED",
                f"Created {model.__name__} ID {obj.id}",
                request
            )

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    @api_view(["GET", "PUT", "PATCH", "DELETE"])
    @permission_classes([IsAuthenticated])
    def detail(request, pk):

        try:

            obj = model.objects.get(
                id=pk
            )

        except model.DoesNotExist:

            return Response(
                {
                    "error":
                    "Not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # ====================================================
        # GET
        # ====================================================

        if request.method == "GET":

            return Response(
                serializer_class(obj).data
            )

        # ====================================================
        # PUT / PATCH
        # ====================================================

        if request.method in [
            "PUT",
            "PATCH"
        ]:

            serializer = serializer_class(
                obj,
                data=request.data,
                partial=True
            )

            if serializer.is_valid():

                serializer.save()

                return Response(
                    serializer.data
                )

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        # ====================================================
        # DELETE
        # ====================================================

        obj.delete()

        return Response(
            {
                "message":
                "Deleted successfully"
            },
            status=status.HTTP_204_NO_CONTENT
        )

    return list_create, detail


# ============================================================
# CRUD INSTANCES
# ============================================================

manage_employees_list, manage_employees_detail = generic_api(
    Employee,
    EmployeeSerializer
)

manage_departments_list, manage_departments_detail = generic_api(
    Department,
    DepartmentSerializer
)

manage_jobtitles_list, manage_jobtitles_detail = generic_api(
    JobTitle,
    JobTitleSerializer
)

manage_teaching_evaluations_list, manage_teaching_evaluations_detail = generic_api(
    StudentTeachingEvaluation,
    StudentTeachingEvaluationSerializer
)

manage_peer_reviews_list, manage_peer_reviews_detail = generic_api(
    PeerReview,
    PeerReviewSerializer
)

manage_applications_list, manage_applications_detail = generic_api(
    PromotionApplication,
    PromotionApplicationSerializer
)

manage_materials_list, manage_materials_detail = generic_api(
    PromotionMaterial,
    PromotionMaterialSerializer
)

manage_material_reviews_list, manage_material_reviews_detail = generic_api(
    AcademicMaterialReview,
    AcademicMaterialReviewSerializer
)

manage_appeals_list, manage_appeals_detail = generic_api(
    PromotionAppeal,
    PromotionAppealSerializer
)

manage_histories_list, manage_histories_detail = generic_api(
    PromotionHistory,
    PromotionHistorySerializer
)

manage_reviewer_assignments_list, manage_reviewer_assignments_detail = generic_api(
    ReviewerAssignment,
    ReviewerAssignmentSerializer
)

# ============================================================
# PROMOTION MATERIALS
# Appendix 3 - Promotion Checklist Materials
# ============================================================

manage_promotion_materials_list, manage_promotion_materials_detail = generic_api(
    PromotionMaterial,
    PromotionMaterialSerializer
)


# ============================================================
# ACADEMIC MATERIAL REVIEWS
# Appendix 4 - Form C
# ============================================================

manage_academic_material_reviews_list, manage_academic_material_reviews_detail = generic_api(
    AcademicMaterialReview,
    AcademicMaterialReviewSerializer
)


# ============================================================
# PROMOTION APPEALS
# Appendix 5 - Form D
# ============================================================

manage_promotion_appeals_list, manage_promotion_appeals_detail = generic_api(
    PromotionAppeal,
    PromotionAppealSerializer
)


# ============================================================
# REVIEWER ASSIGNMENTS
# ============================================================

manage_reviewer_assignments_list, manage_reviewer_assignments_detail = generic_api(
    ReviewerAssignment,
    ReviewerAssignmentSerializer
)

# ============================================================
# SYSTEM LOGS
# ============================================================

manage_system_logs_list, manage_system_logs_detail = generic_api(
    SystemLog,
    SystemLogSerializer
)


# ============================================================
# STUDENT TEACHING EVALUATIONS
# ============================================================

manage_teaching_evaluations_list, manage_teaching_evaluations_detail = generic_api(
    StudentTeachingEvaluation,
    StudentTeachingEvaluationSerializer
)


# ============================================================
# PEER REVIEWS
# ============================================================

manage_peer_reviews_list, manage_peer_reviews_detail = generic_api(
    PeerReview,
    PeerReviewSerializer
)


# ============================================================
# PROMOTION MATERIALS
# ============================================================

manage_promotion_materials_list, manage_promotion_materials_detail = generic_api(
    PromotionMaterial,
    PromotionMaterialSerializer
)


# ============================================================
# ACADEMIC MATERIAL REVIEWS
# ============================================================

manage_academic_material_reviews_list, manage_academic_material_reviews_detail = generic_api(
    AcademicMaterialReview,
    AcademicMaterialReviewSerializer
)


# ============================================================
# PROMOTION APPEALS
# ============================================================

manage_promotion_appeals_list, manage_promotion_appeals_detail = generic_api(
    PromotionAppeal,
    PromotionAppealSerializer
)


# ============================================================
# REVIEWER ASSIGNMENTS
# ============================================================

manage_reviewer_assignments_list, manage_reviewer_assignments_detail = generic_api(
    ReviewerAssignment,
    ReviewerAssignmentSerializer
)


# ============================================================
# PROMOTION HISTORY
# ============================================================

manage_histories_list, manage_histories_detail = generic_api(
    PromotionHistory,
    PromotionHistorySerializer
)