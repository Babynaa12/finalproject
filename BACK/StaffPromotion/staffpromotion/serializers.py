from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

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

User = get_user_model()


# ============================================================
# 1. DEPARTMENT SERIALIZER
# ============================================================

class DepartmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Department
        fields = "__all__"


# ============================================================
# 2. JOB TITLE / ACADEMIC RANK SERIALIZER
# ============================================================

class JobTitleSerializer(serializers.ModelSerializer):

    class Meta:
        model = JobTitle
        fields = "__all__"


# ============================================================
# 3. EMPLOYEE SERIALIZER
# ============================================================

class EmployeeSerializer(serializers.ModelSerializer):

    department_name = serializers.CharField(
        source="department.department_name",
        read_only=True
    )

    job_title_name = serializers.CharField(
        source="job_title.title_name",
        read_only=True
    )

    first_appointment_position_name = serializers.CharField(
        source="first_appointment_position.title_name",
        read_only=True
    )

    manager_name = serializers.SerializerMethodField()

    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Employee

        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "full_name",
            "email",

            # Role
            "role",
            "status",

            # Personal information
            "phone_number",
            "date_of_birth",
            "nationality",

            # Organization
            "department",
            "department_name",

            "job_title",
            "job_title_name",

            "manager",
            "manager_name",

            # Employment
            "appointment_date",
            "first_appointment_position",
            "first_appointment_position_name",
            "current_position_appointment_date",
            "employment_status",

            # Profile
            "profile_photo",
            "address",

            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

    def get_full_name(self, obj):

        return f"{obj.first_name} {obj.last_name}".strip()

    def get_manager_name(self, obj):

        if obj.manager:
            return (
                f"{obj.manager.first_name} "
                f"{obj.manager.last_name}"
            ).strip()

        return None


# ============================================================
# 4. REGISTER EMPLOYEE / USER
# ============================================================

class EmployeeRegisterSerializer(serializers.ModelSerializer):

    class Meta:
        model = Employee

        fields = [
            "username",
            "first_name",
            "last_name",
            "email",
            "password",

            "role",
            "department",
            "job_title",
            "manager",

            "phone_number",
            "date_of_birth",
            "nationality",

            "appointment_date",
            "first_appointment_position",
            "current_position_appointment_date",
            "employment_status",

            "address",
        ]

        extra_kwargs = {
            "password": {
                "write_only": True
            }
        }

    def create(self, validated_data):

        password = validated_data.pop("password")

        user = Employee(**validated_data)

        user.set_password(password)

        user.save()

        return user


# ============================================================
# 5. STUDENT TEACHING EVALUATION
# APPENDIX 1
# ============================================================

class StudentTeachingEvaluationSerializer(
    serializers.ModelSerializer
):

    student_name = serializers.SerializerMethodField()

    instructor_name = serializers.SerializerMethodField()

    department_name = serializers.CharField(
        source="department.department_name",
        read_only=True
    )

    class Meta:
        model = StudentTeachingEvaluation

        fields = "__all__"

        read_only_fields = [
            "submitted_at"
        ]

    def get_student_name(self, obj):

        return (
            f"{obj.student.first_name} "
            f"{obj.student.last_name}"
        ).strip()

    def get_instructor_name(self, obj):

        return (
            f"{obj.instructor.first_name} "
            f"{obj.instructor.last_name}"
        ).strip()


# ============================================================
# 6. PEER REVIEW
# APPENDIX 2
# ============================================================

class PeerReviewSerializer(serializers.ModelSerializer):

    reviewer_name = serializers.SerializerMethodField()

    instructor_name = serializers.SerializerMethodField()

    department_name = serializers.CharField(
        source="department.department_name",
        read_only=True
    )

    academic_rank_name = serializers.CharField(
        source="academic_rank.title_name",
        read_only=True
    )

    class Meta:
        model = PeerReview

        fields = "__all__"

        read_only_fields = [
            "overall_points",
            "submitted_at"
        ]

    def get_reviewer_name(self, obj):

        return (
            f"{obj.reviewer.first_name} "
            f"{obj.reviewer.last_name}"
        ).strip()

    def get_instructor_name(self, obj):

        return (
            f"{obj.instructor.first_name} "
            f"{obj.instructor.last_name}"
        ).strip()


# ============================================================
# 7. PROMOTION APPLICATION
# APPENDIX 3 - FORM A
# ============================================================

class PromotionApplicationSerializer(
    serializers.ModelSerializer
):

    employee_name = serializers.SerializerMethodField()

    employee_email = serializers.EmailField(
        source="employee.email",
        read_only=True
    )

    department_name = serializers.CharField(
        source="employee.department.department_name",
        read_only=True
    )

    current_title_name = serializers.CharField(
        source="current_title.title_name",
        read_only=True
    )

    targeted_title_name = serializers.CharField(
        source="targeted_title.title_name",
        read_only=True
    )

    position_applied_for_name = serializers.CharField(
        source="position_applied_for.title_name",
        read_only=True
    )

    present_position_name = serializers.CharField(
        source="present_position.title_name",
        read_only=True
    )

    first_position_name = serializers.CharField(
        source="position_at_first_appointment.title_name",
        read_only=True
    )

    hod_name = serializers.SerializerMethodField()

    dean_name = serializers.SerializerMethodField()

    reviewer_name = serializers.SerializerMethodField()

    materials = serializers.SerializerMethodField()

    class Meta:
        model = PromotionApplication

        fields = "__all__"

        read_only_fields = [
            "submitted_at",
            "created_at",
            "updated_at",
            "total_points",
            "points_difference",
        ]

    def get_employee_name(self, obj):

        return (
            f"{obj.employee.first_name} "
            f"{obj.employee.last_name}"
        ).strip()

    def get_hod_name(self, obj):

        if obj.hod:
            return (
                f"{obj.hod.first_name} "
                f"{obj.hod.last_name}"
            ).strip()

        return None

    def get_dean_name(self, obj):

        if obj.dean:
            return (
                f"{obj.dean.first_name} "
                f"{obj.dean.last_name}"
            ).strip()

        return None

    def get_reviewer_name(self, obj):

        if obj.assigned_reviewer:
            return (
                f"{obj.assigned_reviewer.first_name} "
                f"{obj.assigned_reviewer.last_name}"
            ).strip()

        return None

    def get_materials(self, obj):

        return PromotionMaterialSerializer(
            obj.promotion_materials.all(),
            many=True
        ).data


# ============================================================
# 8. PROMOTION MATERIAL SERIALIZER
# APPENDIX 3 - PROMOTION CHECKLIST
# ============================================================

class PromotionMaterialSerializer(serializers.ModelSerializer):

    # --------------------------------------------------------
    # Display material type
    # Example: JOURNAL_ARTICLE -> Journal Articles
    # --------------------------------------------------------

    material_type_display = serializers.CharField(
        source="get_material_type_display",
        read_only=True
    )

    # --------------------------------------------------------
    # Employee information
    # --------------------------------------------------------

    employee_name = serializers.SerializerMethodField()

    # --------------------------------------------------------
    # Application status
    # --------------------------------------------------------

    application_status = serializers.CharField(
        source="application.status",
        read_only=True
    )

    # --------------------------------------------------------
    # Applicant full name
    # --------------------------------------------------------

    applicant_name = serializers.CharField(
        source="application.full_name",
        read_only=True
    )

    # --------------------------------------------------------
    # Target position
    # --------------------------------------------------------

    targeted_title = serializers.CharField(
        source="application.targeted_title.name",
        read_only=True
    )

    # --------------------------------------------------------
    # Current position
    # --------------------------------------------------------

    current_title = serializers.CharField(
        source="application.current_title.name",
        read_only=True
    )

    class Meta:
        model = PromotionMaterial

        fields = [
            # =================================================
            # BASIC
            # =================================================
            "id",

            # =================================================
            # APPLICATION
            # =================================================
            "application",
            "application_status",

            # =================================================
            # APPLICANT
            # =================================================
            "employee_name",
            "applicant_name",

            # =================================================
            # POSITION
            # =================================================
            "current_title",
            "targeted_title",

            # =================================================
            # MATERIAL
            # =================================================
            "material_type",
            "material_type_display",

            # =================================================
            # POINTS
            # =================================================
            "points",

            # =================================================
            # SUPPORTING DOCUMENT
            # =================================================
            "document",

            # =================================================
            # DATE
            # =================================================
            "created_at",
        ]

        read_only_fields = [
            "id",
            "application_status",
            "employee_name",
            "applicant_name",
            "current_title",
            "targeted_title",
            "material_type_display",
            "created_at",
        ]

    # ========================================================
    # EMPLOYEE NAME
    # ========================================================

    def get_employee_name(self, obj):

        try:
            employee = obj.application.employee

            if not employee:
                return ""

            # Try common name fields safely
            if hasattr(employee, "full_name") and employee.full_name:
                return employee.full_name

            if hasattr(employee, "user") and employee.user:
                return (
                    employee.user.get_full_name()
                    or employee.user.username
                )

            return str(employee)

        except Exception:
            return ""

    # ========================================================
    # EMPLOYEE NAME
    # ========================================================

    def get_employee_name(self, obj):

        if (
            obj.application
            and obj.application.employee
        ):

            employee = obj.application.employee

            return (
                f"{employee.first_name} "
                f"{employee.last_name}"
            ).strip()

        return None

    # ========================================================
    # REVIEWER NAME
    # ========================================================

    def get_reviewer_name(self, obj):

        # If your PromotionMaterial model has a reviewer FK
        # this will display the reviewer's name.

        if hasattr(obj, "reviewer") and obj.reviewer:

            return (
                f"{obj.reviewer.first_name} "
                f"{obj.reviewer.last_name}"
            ).strip()

        return None

# ============================================================
# 9. ACADEMIC MATERIAL REVIEW
# APPENDIX 4 - FORM C
# ============================================================

class AcademicMaterialReviewSerializer(
    serializers.ModelSerializer
):

    reviewer_full_name = serializers.SerializerMethodField()

    material_title = serializers.CharField(
        source="material.title",
        read_only=True
    )

    employee_name = serializers.SerializerMethodField()

    class Meta:
        model = AcademicMaterialReview

        fields = "__all__"

        read_only_fields = [
            "points",
            "submitted_at"
        ]

    def get_reviewer_full_name(self, obj):

        if obj.reviewer:

            return (
                f"{obj.reviewer.first_name} "
                f"{obj.reviewer.last_name}"
            ).strip()

        return None

    def get_employee_name(self, obj):

        if (
            obj.material
            and obj.material.application
            and obj.material.application.employee
        ):

            employee = obj.material.application.employee

            return (
                f"{employee.first_name} "
                f"{employee.last_name}"
            ).strip()

        return None


# ============================================================
# 10. PROMOTION APPEAL
# APPENDIX 5 - FORM D
# ============================================================

class PromotionAppealSerializer(
    serializers.ModelSerializer
):

    applicant_name = serializers.SerializerMethodField()

    department_name = serializers.CharField(
        source="department.department_name",
        read_only=True
    )

    position_name = serializers.CharField(
        source="position.title_name",
        read_only=True
    )

    application_status = serializers.CharField(
        source="application.status",
        read_only=True
    )

    class Meta:
        model = PromotionAppeal

        fields = "__all__"

        read_only_fields = [
            "received_at",
            "decided_at"
        ]

    def get_applicant_name(self, obj):

        return (
            f"{obj.applicant.first_name} "
            f"{obj.applicant.last_name}"
        ).strip()


# ============================================================
# 11. PROMOTION HISTORY
# ============================================================

class PromotionHistorySerializer(
    serializers.ModelSerializer
):

    employee_name = serializers.SerializerMethodField()

    old_title_name = serializers.CharField(
        source="old_title.title_name",
        read_only=True
    )

    new_title_name = serializers.CharField(
        source="new_title.title_name",
        read_only=True
    )

    class Meta:
        model = PromotionHistory

        fields = "__all__"

        read_only_fields = [
            "created_at"
        ]

    def get_employee_name(self, obj):

        return (
            f"{obj.employee.first_name} "
            f"{obj.employee.last_name}"
        ).strip()


# ============================================================
# 12. REVIEWER ASSIGNMENT
# ============================================================

class ReviewerAssignmentSerializer(
    serializers.ModelSerializer
):

    # --------------------------------------------------------
    # APPLICATION ID
    # --------------------------------------------------------

    application_id = serializers.IntegerField(
        source="application.id",
        read_only=True
    )

    # --------------------------------------------------------
    # REVIEWER NAME
    # --------------------------------------------------------

    reviewer_name = serializers.SerializerMethodField()

    # --------------------------------------------------------
    # ASSIGNED BY NAME
    # --------------------------------------------------------

    assigned_by_name = serializers.SerializerMethodField()

    # --------------------------------------------------------
    # APPLICANT / EMPLOYEE NAME
    # --------------------------------------------------------

    employee_name = serializers.SerializerMethodField()

    # --------------------------------------------------------
    # APPLICATION STATUS
    # --------------------------------------------------------

    application_status = serializers.CharField(
        source="application.status",
        read_only=True
    )

    class Meta:
        model = ReviewerAssignment

        fields = [
            "id",

            # Application
            "application",
            "application_id",
            "application_status",

            # Reviewer
            "reviewer",
            "reviewer_name",

            # Assignment information
            "assigned_by",
            "assigned_by_name",
            "assigned_at",

            # Employee
            "employee_name",

            # Completion
            "completed",
            "completed_at",

            # Comments
            "comments",
        ]

        read_only_fields = [
            "id",
            "application_id",
            "application_status",
            "reviewer_name",
            "assigned_by_name",
            "employee_name",
            "assigned_at",
            "completed_at",
        ]

    # ========================================================
    # REVIEWER NAME
    # ========================================================

    def get_reviewer_name(self, obj):

        if obj.reviewer:
            return (
                f"{obj.reviewer.first_name} "
                f"{obj.reviewer.last_name}"
            ).strip()

        return None

    # ========================================================
    # ASSIGNED BY NAME
    # ========================================================

    def get_assigned_by_name(self, obj):

        if obj.assigned_by:
            return (
                f"{obj.assigned_by.first_name} "
                f"{obj.assigned_by.last_name}"
            ).strip()

        return None

    # ========================================================
    # EMPLOYEE NAME
    # ========================================================

    def get_employee_name(self, obj):

        if (
            obj.application
            and obj.application.employee
        ):

            employee = obj.application.employee

            return (
                f"{employee.first_name} "
                f"{employee.last_name}"
            ).strip()

        return None
# ============================================================
# 13. SYSTEM LOG
# ============================================================

class SystemLogSerializer(
    serializers.ModelSerializer
):

    user_name = serializers.SerializerMethodField()

    class Meta:
        model = SystemLog

        fields = "__all__"

        read_only_fields = [
            "created_at"
        ]

    def get_user_name(self, obj):

        if obj.user:

            return (
                f"{obj.user.first_name} "
                f"{obj.user.last_name}"
            ).strip()

        return None


# ============================================================
# 14. JWT LOGIN SERIALIZER
# ============================================================

class MyTokenObtainPairSerializer(
    TokenObtainPairSerializer
):

    username_field = "email"

    def validate(self, attrs):

        data = super().validate(attrs)

        user = self.user

        data["user"] = {
            "id": user.id,
            "username": user.username,
            "email": user.email,

            "first_name": user.first_name,
            "last_name": user.last_name,

            "name": (
                f"{user.first_name} "
                f"{user.last_name}"
            ).strip(),

            "role": user.role,
            "status": user.status,

            "department": (
                user.department.id
                if user.department
                else None
            ),

            "department_name": (
                user.department.department_name
                if user.department
                else None
            ),

            "job_title": (
                user.job_title.id
                if user.job_title
                else None
            ),

            "job_title_name": (
                user.job_title.title_name
                if user.job_title
                else None
            ),
        }

        return data
