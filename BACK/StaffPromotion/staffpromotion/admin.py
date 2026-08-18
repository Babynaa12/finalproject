from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import (
    Department,
    JobTitle,
    Employee,
    StudentTeachingEvaluation,
    PromotionNotification,
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
# 13. PROMOTION NOTIFICATION
# ============================================================

@admin.register(PromotionNotification)
class PromotionNotificationAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "employee",
        "application",
        "notification_type",
        "title",
        "is_read",
        "created_at",
    )

    list_filter = (
        "notification_type",
        "is_read",
        "created_at",
    )

    search_fields = (
        "employee__first_name",
        "employee__last_name",
        "employee__email",
        "title",
        "message",
    )

    ordering = (
        "-created_at",
    )

    readonly_fields = (
        "created_at",
    )

    fieldsets = (

        (
            "Notification Recipient",
            {
                "fields": (
                    "employee",
                    "application",
                )
            },
        ),

        (
            "Notification Details",
            {
                "fields": (
                    "notification_type",
                    "title",
                    "message",
                )
            },
        ),

        (
            "Notification Status",
            {
                "fields": (
                    "is_read",
                    "created_at",
                )
            },
        ),
    )
    
# ============================================================
# 1. DEPARTMENT
# ============================================================

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "department_name",
    )

    search_fields = (
        "department_name",
    )

    ordering = (
        "department_name",
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


# ============================================================
# 3. EMPLOYEE
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

    readonly_fields = (
        "last_login",
        "date_joined",
        "created_at",
        "updated_at",
    )

    fieldsets = (

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

        (
            "System Role",
            {
                "fields": (
                    "role",
                    "status",
                )
            },
        ),

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
#
# IMPORTANT:
# This admin intentionally DOES NOT reference:
#
# created_at
# updated_at
# submitted_at
# status
# total_points
# points_required
# points_difference
# applicant_declaration
#
# because Django reported that these fields are not currently
# present in your actual PromotionApplication model.
#
# ============================================================

@admin.register(PromotionApplication)
class PromotionApplicationAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "employee",
        "current_title",
        "targeted_title",
    )

    list_filter = (
        "current_title",
        "targeted_title",
        "applied_same_rank_before",
        "intends_new_publications",
    )

    search_fields = (
        "employee__first_name",
        "employee__last_name",
        "employee__email",
        "current_title__title_name",
        "targeted_title__title_name",
        "nationality",
        "employment_status",
    )

    ordering = (
        "-id",
    )

    fieldsets = (

        # ----------------------------------------------------
        # APPLICANT
        # ----------------------------------------------------

        (
            "Applicant",
            {
                "fields": (
                    "employee",
                )
            },
        ),

        # ----------------------------------------------------
        # PRESENT AND TARGET POSITION
        # ----------------------------------------------------

        (
            "Promotion Position",
            {
                "fields": (
                    "current_title",
                    "targeted_title",
                )
            },
        ),

        # ----------------------------------------------------
        # PERSONAL PARTICULARS
        # ----------------------------------------------------

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

        # ----------------------------------------------------
        # PREVIOUS APPLICATION
        # ----------------------------------------------------

        (
            "Previous Promotion Application",
            {
                "fields": (
                    "applied_same_rank_before",
                    "previous_application_date",
                    "intends_new_publications",
                )
            },
        ),

        # ----------------------------------------------------
        # DOCUMENTS
        # ----------------------------------------------------

        (
            "Supporting Documents",
            {
                "fields": (
                    "cv",
                    "additional_documents",
                )
            },
        ),
    )


# ============================================================
# 7. PROMOTION MATERIAL / CHECKLIST
# ============================================================
#
# This is now your checklist.
#
# Staff/reviewer enters POINTS for each material.
# No checklist PDF is required.
#
# ============================================================

@admin.register(PromotionMaterial)
class PromotionMaterialAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "application",
        "material_type",
        "points",
        "document",
        "created_at",
    )

    list_filter = (
        "material_type",
        "created_at",
    )

    search_fields = (
        "application__full_name",
        "application__employee__email",
        "material_type",
    )

    readonly_fields = (
        "created_at",
    )

    ordering = (
        "-created_at",
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

    fieldsets = (

        (
            "Material",
            {
                "fields": (
                    "material",
                )
            },
        ),

        (
            "Reviewer",
            {
                "fields": (
                    "reviewer",
                    "reviewer_name",
                    "reviewer_academic_rank",
                    "reviewer_affiliation",
                )
            },
        ),

        (
            "Review Criteria",
            {
                "fields": (
                    "authenticity",
                    "originality",
                    "coverage_of_subject",
                    "contribution_to_knowledge",
                    "relevance_to_discipline",
                    "presentation_quality",
                    "technical_recommendation",
                )
            },
        ),

        (
            "Overall Assessment",
            {
                "fields": (
                    "grade",
                    "points",
                    "overall_quality",
                    "strengths",
                    "shortcomings",
                )
            },
        ),

        (
            "Signature",
            {
                "fields": (
                    "reviewer_signature_date",
                    "submitted_at",
                )
            },
        ),
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

    fieldsets = (

        (
            "Appeal Application",
            {
                "fields": (
                    "application",
                    "applicant",
                    "department",
                    "position",
                    "date_of_appointment_at_position",
                )
            },
        ),

        (
            "Appeal Details",
            {
                "fields": (
                    "decisions_disagreed_with",
                    "reasons_for_disagreement",
                    "self_rating",
                    "applicant_signature_date",
                )
            },
        ),

        (
            "Appeal Committee",
            {
                "fields": (
                    "appeal_committee_comments",
                    "appeal_decision",
                    "status",
                )
            },
        ),

        (
            "System Information",
            {
                "fields": (
                    "received_at",
                    "decided_at",
                )
            },
        ),
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