from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

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


# ============================================================
# 1. DEPARTMENT
# ============================================================

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "department_name",
        "created_at",
    )

    search_fields = (
        "department_name",
    )

    ordering = (
        "department_name",
    )

    readonly_fields = (
        "created_at",
    )


# ============================================================
# 2. JOB TITLE / ACADEMIC RANK
# ============================================================

@admin.register(JobTitle)
class JobTitleAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "title_name",
        "salary_scale",
        "min_years_required",
        "min_appraisal_score",
        "created_at",
    )

    list_filter = (
        "salary_scale",
    )

    search_fields = (
        "title_name",
        "salary_scale",
    )

    ordering = (
        "title_name",
    )

    readonly_fields = (
        "created_at",
    )


# ============================================================
# 3. EMPLOYEE / SYSTEM USER
# ============================================================

@admin.register(Employee)
class EmployeeAdmin(BaseUserAdmin):

    list_display = (
        "id",
        "email",
        "username",
        "first_name",
        "last_name",
        "role",
        "department",
        "job_title",
        "status",
        "is_staff",
        "is_superuser",
    )

    list_filter = (
        "role",
        "status",
        "department",
        "job_title",
        "is_staff",
        "is_superuser",
        "is_active",
    )

    search_fields = (
        "email",
        "username",
        "first_name",
        "last_name",
        "phone_number",
    )

    ordering = (
        "email",
    )

    # --------------------------------------------------------
    # IMPORTANT:
    # created_at and updated_at are non-editable fields.
    # They MUST be readonly.
    # --------------------------------------------------------

    readonly_fields = (
        "last_login",
        "date_joined",
        "created_at",
        "updated_at",
    )

    fieldsets = (
        # ----------------------------------------------------
        # LOGIN
        # ----------------------------------------------------
        (
            "Login Information",
            {
                "fields": (
                    "username",
                    "email",
                    "password",
                )
            },
        ),

        # ----------------------------------------------------
        # PERSONAL INFORMATION
        # ----------------------------------------------------
        (
            "Personal Information",
            {
                "fields": (
                    "first_name",
                    "last_name",
                    "phone_number",
                    "date_of_birth",
                    "nationality",
                    "profile_photo",
                    "address",
                )
            },
        ),

        # ----------------------------------------------------
        # SYSTEM ROLE
        # ----------------------------------------------------
        (
            "System Role",
            {
                "fields": (
                    "role",
                    "status",
                )
            },
        ),

        # ----------------------------------------------------
        # ORGANIZATION
        # ----------------------------------------------------
        (
            "Organization Information",
            {
                "fields": (
                    "department",
                    "job_title",
                    "manager",
                )
            },
        ),

        # ----------------------------------------------------
        # EMPLOYMENT
        # ----------------------------------------------------
        (
            "Employment Information",
            {
                "fields": (
                    "appointment_date",
                    "first_appointment_position",
                    "current_position_appointment_date",
                    "employment_status",
                )
            },
        ),

        # ----------------------------------------------------
        # PERMISSIONS
        # ----------------------------------------------------
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),

        # ----------------------------------------------------
        # SYSTEM DATES
        # ----------------------------------------------------
        (
            "System Dates",
            {
                "fields": (
                    "last_login",
                    "date_joined",
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )

    add_fieldsets = (
        (
            "Create Employee",
            {
                "classes": ("wide",),
                "fields": (
                    "username",
                    "email",
                    "first_name",
                    "last_name",
                    "password1",
                    "password2",
                    "role",
                    "status",
                    "department",
                    "job_title",
                ),
            },
        ),
    )


# ============================================================
# 4. STUDENT TEACHING EVALUATION
# ============================================================

@admin.register(StudentTeachingEvaluation)
class StudentTeachingEvaluationAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "student",
        "instructor",
        "course_code",
        "course_name",
        "semester",
        "academic_year",
        "submitted_at",
    )

    list_filter = (
        "department",
        "semester",
        "academic_year",
    )

    search_fields = (
        "student__first_name",
        "student__last_name",
        "instructor__first_name",
        "instructor__last_name",
        "course_code",
        "course_name",
    )

    ordering = (
        "-submitted_at",
    )

    readonly_fields = (
        "submitted_at",
    )


# ============================================================
# 5. PEER REVIEW
# ============================================================

@admin.register(PeerReview)
class PeerReviewAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "reviewer",
        "instructor",
        "academic_rank",
        "course_code",
        "course_name",
        "overall_grade",
        "overall_points",
        "submitted_at",
    )

    list_filter = (
        "overall_grade",
        "department",
        "academic_rank",
        "semester",
    )

    search_fields = (
        "reviewer__first_name",
        "reviewer__last_name",
        "instructor__first_name",
        "instructor__last_name",
        "course_code",
        "course_name",
    )

    ordering = (
        "-submitted_at",
    )

    readonly_fields = (
        "submitted_at",
    )


# ============================================================
# 6. PROMOTION APPLICATION
# ============================================================

@admin.register(PromotionApplication)
class PromotionApplicationAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "employee",
        "current_title",
        "targeted_title",
        "status",
        "total_points",
        "points_required",
        "points_difference",
        "submitted_at",
        "created_at",
    )

    list_filter = (
        "status",
        "current_title",
        "targeted_title",
        "applied_same_rank_before",
        "intends_new_publications",
        "applicant_declaration",
    )

    search_fields = (
        "employee__first_name",
        "employee__last_name",
        "employee__email",
        "current_title__title_name",
        "targeted_title__title_name",
    )

    ordering = (
        "-created_at",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
        "submitted_at",
    )

    fieldsets = (
        (
            "Applicant",
            {
                "fields": (
                    "employee",
                    "current_title",
                    "targeted_title",
                )
            },
        ),

        (
            "Personal Particulars",
            {
                "fields": (
                    "date_of_birth",
                    "nationality",
                    "date_of_appointment_at_suza",
                    "position_at_first_appointment",
                    "employment_status",
                    "present_position",
                    "date_of_current_position",
                    "position_applied_for",
                )
            },
        ),

        (
            "Previous Application",
            {
                "fields": (
                    "applied_same_rank_before",
                    "previous_application_date",
                    "intends_new_publications",
                )
            },
        ),

        (
            "Required Documents",
            {
                "fields": (
                    "cv",
                    "promotion_application_form",
                    "checklist_form",
                    "additional_documents",
                )
            },
        ),

        (
            "Workflow",
            {
                "fields": (
                    "status",
                    "hod",
                    "dean",
                    "assigned_reviewer",
                )
            },
        ),

        (
            "HOD Review",
            {
                "fields": (
                    "hod_recommendation",
                    "hod_comments",
                    "hod_reviewed_at",
                )
            },
        ),

        (
            "Dean Review",
            {
                "fields": (
                    "dean_recommendation",
                    "dean_comments",
                    "dean_reviewed_at",
                )
            },
        ),

        (
            "Committee Decision",
            {
                "fields": (
                    "committee_decision",
                    "committee_comments",
                    "committee_decided_at",
                )
            },
        ),

        (
            "Points Summary",
            {
                "fields": (
                    "journal_book_points",
                    "other_publication_points",
                    "teaching_points",
                    "total_points",
                    "points_required",
                    "points_difference",
                )
            },
        ),

        (
            "Declaration",
            {
                "fields": (
                    "applicant_declaration",
                    "applicant_signature_date",
                )
            },
        ),

        (
            "System Dates",
            {
                "fields": (
                    "submitted_at",
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )


# ============================================================
# 7. PROMOTION MATERIAL / CHECKLIST
# ============================================================

@admin.register(PromotionMaterial)
class PromotionMaterialAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "application",
        "material_type",
        "title",
        "journal_title",
        "publication_year",
        "indexing",
        "points",
        "created_at",
    )

    list_filter = (
        "material_type",
        "publication_year",
        "indexing",
    )

    search_fields = (
        "title",
        "journal_title",
        "authors",
        "reference_in_cv",
        "application__employee__first_name",
        "application__employee__last_name",
    )

    ordering = (
        "-created_at",
    )

    readonly_fields = (
        "created_at",
    )


# ============================================================
# 8. ACADEMIC MATERIAL REVIEW
# ============================================================

@admin.register(AcademicMaterialReview)
class AcademicMaterialReviewAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "material",
        "reviewer",
        "grade",
        "points",
        "reviewer_academic_rank",
        "reviewer_affiliation",
        "submitted_at",
    )

    list_filter = (
        "grade",
        "reviewer_academic_rank",
    )

    search_fields = (
        "material__title",
        "reviewer__first_name",
        "reviewer__last_name",
        "reviewer_name",
        "reviewer_affiliation",
    )

    ordering = (
        "-submitted_at",
    )

    readonly_fields = (
        "submitted_at",
    )


# ============================================================
# 9. PROMOTION APPEAL
# ============================================================

@admin.register(PromotionAppeal)
class PromotionAppealAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "application",
        "applicant",
        "department",
        "position",
        "status",
        "received_at",
        "decided_at",
    )

    list_filter = (
        "status",
        "department",
        "position",
    )

    search_fields = (
        "applicant__first_name",
        "applicant__last_name",
        "applicant__email",
        "decisions_disagreed_with",
        "reasons_for_disagreement",
    )

    ordering = (
        "-received_at",
    )

    readonly_fields = (
        "received_at",
        "decided_at",
    )


# ============================================================
# 10. PROMOTION HISTORY
# ============================================================

@admin.register(PromotionHistory)
class PromotionHistoryAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "employee",
        "old_title",
        "new_title",
        "approval_date",
        "promotion_letter",
        "created_at",
    )

    list_filter = (
        "old_title",
        "new_title",
        "approval_date",
    )

    search_fields = (
        "employee__first_name",
        "employee__last_name",
        "employee__email",
        "old_title__title_name",
        "new_title__title_name",
    )

    ordering = (
        "-approval_date",
    )

    readonly_fields = (
        "created_at",
    )


# ============================================================
# 11. SYSTEM LOG
# ============================================================

@admin.register(SystemLog)
class SystemLogAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "user",
        "action",
        "ip_address",
        "created_at",
    )

    list_filter = (
        "action",
        "created_at",
    )

    search_fields = (
        "user__first_name",
        "user__last_name",
        "user__email",
        "action",
        "description",
        "ip_address",
    )

    ordering = (
        "-created_at",
    )

    readonly_fields = (
        "user",
        "action",
        "description",
        "ip_address",
        "created_at",
    )


# ============================================================
# 12. REVIEWER ASSIGNMENT
# ============================================================

@admin.register(ReviewerAssignment)
class ReviewerAssignmentAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "application",
        "reviewer",
        "assigned_by",
        "assigned_at",
        "completed",
        "completed_at",
    )

    list_filter = (
        "completed",
        "assigned_at",
        "completed_at",
    )

    search_fields = (
        "reviewer__first_name",
        "reviewer__last_name",
        "reviewer__email",
        "assigned_by__first_name",
        "assigned_by__last_name",
        "application__employee__first_name",
        "application__employee__last_name",
    )

    ordering = (
        "-assigned_at",
    )

    readonly_fields = (
        "assigned_at",
        "completed_at",
    )