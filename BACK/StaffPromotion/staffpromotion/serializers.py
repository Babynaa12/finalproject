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
    PromotionNotification,
)

User = get_user_model()


# ============================================================
# HELPER
# ============================================================

def employee_full_name(employee):
    """
    Safely return an employee's full name.
    """
    if not employee:
        return None

    first_name = getattr(employee, "first_name", "") or ""
    last_name = getattr(employee, "last_name", "") or ""

    full_name = f"{first_name} {last_name}".strip()

    if full_name:
        return full_name

    username = getattr(employee, "username", None)

    if username:
        return username

    email = getattr(employee, "email", None)

    if email:
        return email

    return str(employee)


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

class PromotionNotificationSerializer(serializers.ModelSerializer):

    employee_name = serializers.SerializerMethodField()
    application_id = serializers.SerializerMethodField()

    class Meta:
        model = PromotionNotification
        fields = [
            "id",
            "employee",
            "employee_name",
            "application",
            "application_id",
            "notification_type",
            "title",
            "message",
            "status",
            "is_read",
            "created_at",
            "read_at",
        ]
        read_only_fields = [
            "id",
            "employee",
            "application",
            "employee_name",
            "application_id",
            "created_at",
            "read_at",
        ]

    def get_employee_name(self, obj):
        return employee_full_name(getattr(obj, "employee", None))

    def get_application_id(self, obj):
        return getattr(obj.application, "id", None)


class EmployeeSerializer(serializers.ModelSerializer):

    department_name = serializers.SerializerMethodField()

    job_title_name = serializers.SerializerMethodField()

    first_appointment_position_name = serializers.SerializerMethodField()

    manager_name = serializers.SerializerMethodField()

    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Employee

        fields = [
            "id",

            # Account
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

            # Dates
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "full_name",
            "department_name",
            "job_title_name",
            "first_appointment_position_name",
            "manager_name",
            "created_at",
            "updated_at",
        ]

    # --------------------------------------------------------
    # FULL NAME
    # --------------------------------------------------------

    def get_full_name(self, obj):
        return employee_full_name(obj)

    # --------------------------------------------------------
    # DEPARTMENT NAME
    # --------------------------------------------------------

    def get_department_name(self, obj):

        department = getattr(obj, "department", None)

        if not department:
            return None

        return getattr(
            department,
            "department_name",
            str(department)
        )

    # --------------------------------------------------------
    # JOB TITLE NAME
    # --------------------------------------------------------

    def get_job_title_name(self, obj):

        job_title = getattr(obj, "job_title", None)

        if not job_title:
            return None

        return getattr(
            job_title,
            "title_name",
            str(job_title)
        )

    # --------------------------------------------------------
    # FIRST APPOINTMENT POSITION
    # --------------------------------------------------------

    def get_first_appointment_position_name(self, obj):

        position = getattr(
            obj,
            "first_appointment_position",
            None
        )

        if not position:
            return None

        return getattr(
            position,
            "title_name",
            str(position)
        )

    # --------------------------------------------------------
    # MANAGER NAME
    # --------------------------------------------------------

    def get_manager_name(self, obj):

        manager = getattr(obj, "manager", None)

        return employee_full_name(manager)


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
                "write_only": True,
                "required": True,
            }
        }

    def create(self, validated_data):

        password = validated_data.pop("password")

        user = Employee(**validated_data)

        user.set_password(password)

        user.save()

        return user

    def update(self, instance, validated_data):

        password = validated_data.pop("password", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()

        return instance


# ============================================================
# 5. STUDENT TEACHING EVALUATION
# APPENDIX 1
# ============================================================

class StudentTeachingEvaluationSerializer(
    serializers.ModelSerializer
):

    student_name = serializers.SerializerMethodField()

    instructor_name = serializers.SerializerMethodField()

    department_name = serializers.SerializerMethodField()

    class Meta:
        model = StudentTeachingEvaluation

        fields = "__all__"

        read_only_fields = [
            "submitted_at",
        ]

    # --------------------------------------------------------
    # STUDENT NAME
    # --------------------------------------------------------

    def get_student_name(self, obj):

        student = getattr(obj, "student", None)

        return employee_full_name(student)

    # --------------------------------------------------------
    # INSTRUCTOR NAME
    # --------------------------------------------------------

    def get_instructor_name(self, obj):

        instructor = getattr(obj, "instructor", None)

        return employee_full_name(instructor)

    # --------------------------------------------------------
    # DEPARTMENT
    # --------------------------------------------------------

    def get_department_name(self, obj):

        department = getattr(obj, "department", None)

        if not department:
            return None

        return getattr(
            department,
            "department_name",
            str(department)
        )


# ============================================================
# 6. PEER REVIEW
# APPENDIX 2
# ============================================================

class PeerReviewSerializer(serializers.ModelSerializer):

    reviewer_name = serializers.SerializerMethodField()

    instructor_name = serializers.SerializerMethodField()

    department_name = serializers.SerializerMethodField()

    academic_rank_name = serializers.SerializerMethodField()

    class Meta:
        model = PeerReview

        fields = "__all__"

        read_only_fields = [
            "overall_points",
            "submitted_at",
        ]

    # --------------------------------------------------------
    # REVIEWER
    # --------------------------------------------------------

    def get_reviewer_name(self, obj):

        reviewer = getattr(obj, "reviewer", None)

        return employee_full_name(reviewer)

    # --------------------------------------------------------
    # INSTRUCTOR
    # --------------------------------------------------------

    def get_instructor_name(self, obj):

        instructor = getattr(obj, "instructor", None)

        return employee_full_name(instructor)

    # --------------------------------------------------------
    # DEPARTMENT
    # --------------------------------------------------------

    def get_department_name(self, obj):

        department = getattr(obj, "department", None)

        if not department:
            return None

        return getattr(
            department,
            "department_name",
            str(department)
        )

    # --------------------------------------------------------
    # ACADEMIC RANK
    # --------------------------------------------------------

    def get_academic_rank_name(self, obj):

        rank = getattr(obj, "academic_rank", None)

        if not rank:
            return None

        return getattr(
            rank,
            "title_name",
            str(rank)
        )


# ============================================================
# 7. PROMOTION APPLICATION
# APPENDIX 3 - FORM A
# ============================================================

class PromotionApplicationSerializer(
    serializers.ModelSerializer
):

    reviewer_stage_completed = serializers.SerializerMethodField()
    student_evaluation_stage_completed = serializers.SerializerMethodField()
    ready_for_committee = serializers.SerializerMethodField()

    # ========================================================
    # APPLICANT
    # ========================================================

    employee_name = serializers.SerializerMethodField()

    employee_email = serializers.SerializerMethodField()

    department_name = serializers.SerializerMethodField()

    # ========================================================
    # CURRENT POSITION
    # ========================================================

    current_title_name = serializers.SerializerMethodField()

    # ========================================================
    # TARGET POSITION
    # ========================================================

    targeted_title_name = serializers.SerializerMethodField()

    # ========================================================
    # POSITION APPLIED FOR
    # ========================================================

    position_applied_for_name = serializers.SerializerMethodField()

    # ========================================================
    # PRESENT POSITION
    # ========================================================

    present_position_name = serializers.SerializerMethodField()

    # ========================================================
    # FIRST APPOINTMENT POSITION
    # ========================================================

    first_position_name = serializers.SerializerMethodField()

    # ========================================================
    # HOD
    # ========================================================

    hod_name = serializers.SerializerMethodField()

    # ========================================================
    # DEAN
    # ========================================================

    dean_name = serializers.SerializerMethodField()

    # ========================================================
    # REVIEWER
    # ========================================================

    reviewer_name = serializers.SerializerMethodField()

    # ========================================================
    # PROMOTION MATERIALS
    # ========================================================

    materials = serializers.SerializerMethodField()

    class Meta:
        model = PromotionApplication

        fields = "__all__"

        read_only_fields = [
            "id",

            # Dates
            "submitted_at",
            "created_at",
            "updated_at",

            # Calculated points
            "total_points",
            "points_difference",

            # Display fields
            "employee_name",
            "employee_email",
            "department_name",
            "current_title_name",
            "targeted_title_name",
            "position_applied_for_name",
            "present_position_name",
            "first_position_name",
            "hod_name",
            "dean_name",
            "reviewer_name",
            "materials",
        ]

    def get_reviewer_stage_completed(self, obj):
        return bool(getattr(obj, "reviewer_stage_completed", False))

    def get_student_evaluation_stage_completed(self, obj):
        return bool(getattr(obj, "student_evaluation_stage_completed", False))

    def get_ready_for_committee(self, obj):
        return bool(getattr(obj, "ready_for_committee", False))

    # ========================================================
    # EMPLOYEE NAME
    # ========================================================

    def get_employee_name(self, obj):

        employee = getattr(obj, "employee", None)

        return employee_full_name(employee)

    # ========================================================
    # EMPLOYEE EMAIL
    # ========================================================

    def get_employee_email(self, obj):

        employee = getattr(obj, "employee", None)

        if not employee:
            return None

        return getattr(employee, "email", None)

    # ========================================================
    # DEPARTMENT
    # ========================================================

    def get_department_name(self, obj):

        employee = getattr(obj, "employee", None)

        if not employee:
            return None

        department = getattr(
            employee,
            "department",
            None
        )

        if not department:
            return None

        return getattr(
            department,
            "department_name",
            str(department)
        )

    # ========================================================
    # CURRENT TITLE
    # ========================================================

    def get_current_title_name(self, obj):

        title = getattr(obj, "current_title", None)

        if not title:
            return None

        return getattr(
            title,
            "title_name",
            str(title)
        )

    # ========================================================
    # TARGET TITLE
    # ========================================================

    def get_targeted_title_name(self, obj):

        title = getattr(obj, "targeted_title", None)

        if not title:
            return None

        return getattr(
            title,
            "title_name",
            str(title)
        )

    # ========================================================
    # POSITION APPLIED FOR
    # ========================================================

    def get_position_applied_for_name(self, obj):

        position = getattr(
            obj,
            "position_applied_for",
            None
        )

        if not position:
            return None

        return getattr(
            position,
            "title_name",
            str(position)
        )

    # ========================================================
    # PRESENT POSITION
    # ========================================================

    def get_present_position_name(self, obj):

        position = getattr(
            obj,
            "present_position",
            None
        )

        if not position:
            return None

        return getattr(
            position,
            "title_name",
            str(position)
        )

    # ========================================================
    # FIRST POSITION
    # ========================================================

    def get_first_position_name(self, obj):

        position = getattr(
            obj,
            "position_at_first_appointment",
            None
        )

        if not position:
            return None

        return getattr(
            position,
            "title_name",
            str(position)
        )

    # ========================================================
    # HOD
    # ========================================================

    def get_hod_name(self, obj):

        hod = getattr(obj, "hod", None)

        return employee_full_name(hod)

    # ========================================================
    # DEAN
    # ========================================================

    def get_dean_name(self, obj):

        dean = getattr(obj, "dean", None)

        return employee_full_name(dean)

    # ========================================================
    # REVIEWER
    # ========================================================

    def get_reviewer_name(self, obj):

        reviewer = getattr(
            obj,
            "assigned_reviewer",
            None
        )

        return employee_full_name(reviewer)

    # ========================================================
    # MATERIALS
    # ========================================================

    def get_materials(self, obj):

        try:
            materials = obj.promotion_materials.all()
        except Exception:
            return []

        return PromotionMaterialSerializer(
            materials,
            many=True,
            context=self.context
        ).data


# ============================================================
# 8. PROMOTION MATERIAL
# APPENDIX 3 - PROMOTION CHECKLIST
# ============================================================

class PromotionMaterialSerializer(
    serializers.ModelSerializer
):

    # ========================================================
    # MATERIAL TYPE DISPLAY
    # ========================================================

    material_type_display = serializers.SerializerMethodField()

    # ========================================================
    # EMPLOYEE
    # ========================================================

    employee_name = serializers.SerializerMethodField()

    # ========================================================
    # APPLICANT
    # ========================================================

    applicant_name = serializers.SerializerMethodField()

    # ========================================================
    # APPLICATION STATUS
    # ========================================================

    application_status = serializers.SerializerMethodField()

    # ========================================================
    # TARGETED POSITION
    # ========================================================

    targeted_title = serializers.SerializerMethodField()

    # ========================================================
    # CURRENT POSITION
    # ========================================================

    current_title = serializers.SerializerMethodField()

    class Meta:
        model = PromotionMaterial

        fields = [
            "id",

            # Application
            "application",
            "application_status",

            # Applicant
            "employee_name",
            "applicant_name",

            # Position
            "current_title",
            "targeted_title",

            # Material
            "material_type",
            "material_type_display",

            # Points
            "points",

            # Document
            "document",

            # Date
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
    # MATERIAL TYPE
    # ========================================================

    def get_material_type_display(self, obj):

        try:
            return obj.get_material_type_display()
        except Exception:
            return getattr(
                obj,
                "material_type",
                None
            )

    # ========================================================
    # EMPLOYEE NAME
    # ========================================================

    def get_employee_name(self, obj):

        application = getattr(
            obj,
            "application",
            None
        )

        if not application:
            return None

        employee = getattr(
            application,
            "employee",
            None
        )

        return employee_full_name(employee)

    # ========================================================
    # APPLICANT NAME
    # ========================================================

    def get_applicant_name(self, obj):

        application = getattr(
            obj,
            "application",
            None
        )

        if not application:
            return None

        employee = getattr(
            application,
            "employee",
            None
        )

        return employee_full_name(employee)

    # ========================================================
    # APPLICATION STATUS
    # ========================================================

    def get_application_status(self, obj):

        application = getattr(
            obj,
            "application",
            None
        )

        if not application:
            return None

        return getattr(
            application,
            "status",
            None
        )

    # ========================================================
    # TARGETED TITLE
    # ========================================================

    def get_targeted_title(self, obj):

        application = getattr(
            obj,
            "application",
            None
        )

        if not application:
            return None

        title = getattr(
            application,
            "targeted_title",
            None
        )

        if not title:
            return None

        return getattr(
            title,
            "title_name",
            str(title)
        )

    # ========================================================
    # CURRENT TITLE
    # ========================================================

    def get_current_title(self, obj):

        application = getattr(
            obj,
            "application",
            None
        )

        if not application:
            return None

        title = getattr(
            application,
            "current_title",
            None
        )

        if not title:
            return None

        return getattr(
            title,
            "title_name",
            str(title)
        )


# ============================================================
# 9. ACADEMIC MATERIAL REVIEW
# APPENDIX 4 - FORM C
# ============================================================

class AcademicMaterialReviewSerializer(
    serializers.ModelSerializer
):

    reviewer_full_name = serializers.SerializerMethodField()

    material_title = serializers.SerializerMethodField()

    employee_name = serializers.SerializerMethodField()

    class Meta:
        model = AcademicMaterialReview

        fields = "__all__"

        read_only_fields = [
            "points",
            "submitted_at",
        ]

    # ========================================================
    # REVIEWER
    # ========================================================

    def get_reviewer_full_name(self, obj):

        reviewer = getattr(
            obj,
            "reviewer",
            None
        )

        return employee_full_name(reviewer)

    # ========================================================
    # MATERIAL TITLE
    # ========================================================

    def get_material_title(self, obj):

        material = getattr(
            obj,
            "material",
            None
        )

        if not material:
            return None

        return getattr(
            material,
            "title",
            str(material)
        )

    # ========================================================
    # EMPLOYEE NAME
    # ========================================================

    def get_employee_name(self, obj):

        material = getattr(
            obj,
            "material",
            None
        )

        if not material:
            return None

        application = getattr(
            material,
            "application",
            None
        )

        if not application:
            return None

        employee = getattr(
            application,
            "employee",
            None
        )

        return employee_full_name(employee)


# ============================================================
# 10. PROMOTION APPEAL
# APPENDIX 5 - FORM D
# ============================================================

class PromotionAppealSerializer(
    serializers.ModelSerializer
):

    applicant_name = serializers.SerializerMethodField()

    department_name = serializers.SerializerMethodField()

    position_name = serializers.SerializerMethodField()

    application_status = serializers.SerializerMethodField()

    class Meta:
        model = PromotionAppeal

        fields = "__all__"

        read_only_fields = [
            "received_at",
            "decided_at",
        ]

    # ========================================================
    # APPLICANT
    # ========================================================

    def get_applicant_name(self, obj):

        applicant = getattr(
            obj,
            "applicant",
            None
        )

        return employee_full_name(applicant)

    # ========================================================
    # DEPARTMENT
    # ========================================================

    def get_department_name(self, obj):

        department = getattr(
            obj,
            "department",
            None
        )

        if not department:
            return None

        return getattr(
            department,
            "department_name",
            str(department)
        )

    # ========================================================
    # POSITION
    # ========================================================

    def get_position_name(self, obj):

        position = getattr(
            obj,
            "position",
            None
        )

        if not position:
            return None

        return getattr(
            position,
            "title_name",
            str(position)
        )

    # ========================================================
    # APPLICATION STATUS
    # ========================================================

    def get_application_status(self, obj):

        application = getattr(
            obj,
            "application",
            None
        )

        if not application:
            return None

        return getattr(
            application,
            "status",
            None
        )


# ============================================================
# 11. PROMOTION HISTORY
# ============================================================

class PromotionHistorySerializer(
    serializers.ModelSerializer
):

    employee_name = serializers.SerializerMethodField()

    old_title_name = serializers.SerializerMethodField()

    new_title_name = serializers.SerializerMethodField()

    class Meta:
        model = PromotionHistory

        fields = "__all__"

        read_only_fields = [
            "created_at",
        ]

    # ========================================================
    # EMPLOYEE
    # ========================================================

    def get_employee_name(self, obj):

        employee = getattr(
            obj,
            "employee",
            None
        )

        return employee_full_name(employee)

    # ========================================================
    # OLD TITLE
    # ========================================================

    def get_old_title_name(self, obj):

        title = getattr(
            obj,
            "old_title",
            None
        )

        if not title:
            return None

        return getattr(
            title,
            "title_name",
            str(title)
        )

    # ========================================================
    # NEW TITLE
    # ========================================================

    def get_new_title_name(self, obj):

        title = getattr(
            obj,
            "new_title",
            None
        )

        if not title:
            return None

        return getattr(
            title,
            "title_name",
            str(title)
        )


# ============================================================
# 12. REVIEWER ASSIGNMENT
# ============================================================

class ReviewerAssignmentSerializer(
    serializers.ModelSerializer
):

    completed = serializers.SerializerMethodField()

    # ========================================================
    # APPLICATION ID
    # ========================================================

    application_id = serializers.SerializerMethodField()

    # ========================================================
    # REVIEWER NAME
    # ========================================================

    reviewer_name = serializers.SerializerMethodField()

    # ========================================================
    # ASSIGNED BY NAME
    # ========================================================

    assigned_by_name = serializers.SerializerMethodField()

    # ========================================================
    # EMPLOYEE NAME
    # ========================================================

    employee_name = serializers.SerializerMethodField()

    # ========================================================
    # APPLICATION STATUS
    # ========================================================

    application_status = serializers.SerializerMethodField()

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

            # Assignment
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

    def get_completed(self, obj):
        application = getattr(obj, "application", None)

        if not application:
            return False

        return bool(application.reviewer_stage_completed)

    # ========================================================
    # APPLICATION ID
    # ========================================================

    def get_application_id(self, obj):

        application = getattr(
            obj,
            "application",
            None
        )

        if not application:
            return None

        return application.id

    # ========================================================
    # REVIEWER
    # ========================================================

    def get_reviewer_name(self, obj):

        reviewer = getattr(
            obj,
            "reviewer",
            None
        )

        return employee_full_name(reviewer)

    # ========================================================
    # ASSIGNED BY
    # ========================================================

    def get_assigned_by_name(self, obj):

        assigned_by = getattr(
            obj,
            "assigned_by",
            None
        )

        return employee_full_name(assigned_by)

    # ========================================================
    # EMPLOYEE
    # ========================================================

    def get_employee_name(self, obj):

        application = getattr(
            obj,
            "application",
            None
        )

        if not application:
            return None

        employee = getattr(
            application,
            "employee",
            None
        )

        return employee_full_name(employee)

    # ========================================================
    # APPLICATION STATUS
    # ========================================================

    def get_application_status(self, obj):

        application = getattr(
            obj,
            "application",
            None
        )

        if not application:
            return None

        return getattr(
            application,
            "status",
            None
        )


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
            "created_at",
        ]

    # ========================================================
    # USER NAME
    # ========================================================

    def get_user_name(self, obj):

        user = getattr(
            obj,
            "user",
            None
        )

        return employee_full_name(user)


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

        department = getattr(
            user,
            "department",
            None
        )

        job_title = getattr(
            user,
            "job_title",
            None
        )

        data["user"] = {

            # =================================================
            # BASIC ACCOUNT
            # =================================================

            "id": user.id,

            "username": getattr(
                user,
                "username",
                None
            ),

            "email": getattr(
                user,
                "email",
                None
            ),

            # =================================================
            # NAME
            # =================================================

            "first_name": getattr(
                user,
                "first_name",
                ""
            ),

            "last_name": getattr(
                user,
                "last_name",
                ""
            ),

            "name": employee_full_name(user),

            # =================================================
            # ROLE / STATUS
            # =================================================

            "role": getattr(
                user,
                "role",
                None
            ),

            "status": getattr(
                user,
                "status",
                None
            ),

            # =================================================
            # DEPARTMENT
            # =================================================

            "department": (
                department.id
                if department
                else None
            ),

            "department_name": (
                getattr(
                    department,
                    "department_name",
                    None
                )
                if department
                else None
            ),

            # =================================================
            # JOB TITLE
            # =================================================

            "job_title": (
                job_title.id
                if job_title
                else None
            ),

            "job_title_name": (
                getattr(
                    job_title,
                    "title_name",
                    None
                )
                if job_title
                else None
            ),
        }

        return data