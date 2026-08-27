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
        "student__email",
        "instructor__first_name",
        "instructor__last_name",
        "instructor__email",
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
        "department",
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
        "reviewer__email",
        "instructor__first_name",
        "instructor__last_name",
        "instructor__email",
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

    # --------------------------------------------------------
    # LIST PAGE
    # --------------------------------------------------------

    list_display = (
        "id",
        "full_name",
        "employee",
        "current_title",
        "targeted_title",
        "status",
        "total_points",
        "points_required",
        "created_at",
    )

    list_filter = (
        "status",
        "current_title",
        "targeted_title",
        "applied_same_rank_before",
        "intends_new_publications",
        "created_at",
    )

    search_fields = (
        "full_name",
        "employee__first_name",
        "employee__last_name",
        "employee__email",
        "current_title__title_name",
        "targeted_title__title_name",
        "nationality",
        "employment_status",
    )

    ordering = (
        "-created_at",
    )

    # --------------------------------------------------------
    # READ ONLY FIELDS
    # --------------------------------------------------------

    readonly_fields = (
        "submitted_at",
        "created_at",
        "updated_at",
    )

    # --------------------------------------------------------
    # FORM SECTIONS
    # --------------------------------------------------------

    fieldsets = (

        # ====================================================
        # APPLICANT
        # ====================================================

        (
            "Applicant",
            {
                "fields": (
                    "employee",
                    "full_name",
                )
            },
        ),

        # ====================================================
        # PROMOTION POSITION
        # ====================================================

        (
            "Promotion Position",
            {
                "fields": (
                    "current_title",
                    "targeted_title",
                    "present_position",
                    "position_applied_for",
                )
            },
        ),

        # ====================================================
        # PERSONAL PARTICULARS
        # ====================================================

        (
            "Personal Particulars",
            {
                "fields": (
                    "date_of_birth",
                    "nationality",
                    "date_of_appointment_at_suza",
                    "position_at_first_appointment",
                    "employment_status",
                    "date_of_current_position",
                )
            },
        ),

        # ====================================================
        # PREVIOUS PROMOTION
        # ====================================================

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

        # ====================================================
        # SUPPORTING DOCUMENTS
        # ====================================================

        (
            "Supporting Documents",
            {
                "fields": (
                    "cv",
                    "additional_documents",
                )
            },
        ),

        # ====================================================
        # APPLICATION WORKFLOW
        # ====================================================

        (
            "Application Workflow",
            {
                "fields": (
                    "status",
                    "hod",
                    "dean",
                    "assigned_reviewer",
                )
            },
        ),

        # ====================================================
        # HOD REVIEW
        # ====================================================

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

        # ====================================================
        # DEAN REVIEW
        # ====================================================

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

        # ====================================================
        # PROMOTION COMMITTEE
        # ====================================================

        (
            "Promotion Committee",
            {
                "fields": (
                    "committee_decision",
                    "committee_comments",
                    "committee_decided_at",
                )
            },
        ),

        # ====================================================
        # PROMOTION POINTS
        # ====================================================

        (
            "Promotion Points",
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

        # ====================================================
        # APPLICANT DECLARATION
        # ====================================================

        (
            "Applicant Declaration",
            {
                "fields": (
                    "applicant_declaration",
                    "applicant_signature_date",
                )
            },
        ),

        # ====================================================
        # SYSTEM INFORMATION
        # ====================================================

        (
            "System Information",
            {
                "fields": (
                    "submitted_at",
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )

    # --------------------------------------------------------
    # SAVE OVERRIDE
    # Automatically record committee decision date
    # --------------------------------------------------------

    def save_model(self, request, obj, form, change):

        from django.utils import timezone

        if change:

            old_obj = PromotionApplication.objects.get(
                pk=obj.pk
            )

            # Committee has entered a decision
            if (
                obj.committee_decision
                and not old_obj.committee_decision
            ):
                obj.committee_decided_at = timezone.now()

            # Committee changes an existing decision
            elif (
                obj.committee_decision
                and obj.committee_decision
                != old_obj.committee_decision
            ):
                obj.committee_decided_at = timezone.now()

        super().save_model(
            request,
            obj,
            form,
            change
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
        "application__employee__first_name",
        "application__employee__last_name",
        "application__employee__email",
        "material_type",
    )

    ordering = (
        "-created_at",
    )

    readonly_fields = (
        "created_at",
    )

    fieldsets = (

        (
            "Promotion Application",
            {
                "fields": (
                    "application",
                )
            },
        ),

        (
            "Material",
            {
                "fields": (
                    "material_type",
                    "points",
                    "document",
                )
            },
        ),

        (
            "System Information",
            {
                "fields": (
                    "created_at",
                )
            },
        ),
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
        "material__material_type",
        "reviewer__first_name",
        "reviewer__last_name",
        "reviewer__email",
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

        # ----------------------------------------------------
        # MATERIAL
        # ----------------------------------------------------

        (
            "Material",
            {
                "fields": (
                    "material",
                )
            },
        ),

        # ----------------------------------------------------
        # REVIEWER
        # ----------------------------------------------------

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

        # ----------------------------------------------------
        # REVIEW CRITERIA
        # ----------------------------------------------------

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

        # ----------------------------------------------------
        # OVERALL ASSESSMENT
        # ----------------------------------------------------

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

        # ----------------------------------------------------
        # SIGNATURE
        # ----------------------------------------------------

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
# 9. REVIEWER ASSIGNMENT
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
        "assigned_by__email",
        "application__full_name",
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

    fieldsets = (

        (
            "Assignment",
            {
                "fields": (
                    "application",
                    "reviewer",
                    "assigned_by",
                )
            },
        ),

        (
            "Assignment Status",
            {
                "fields": (
                    "completed",
                    "completed_at",
                    "comments",
                )
            },
        ),

        (
            "System Information",
            {
                "fields": (
                    "assigned_at",
                )
            },
        ),
    )


# ============================================================
# 10. PROMOTION NOTIFICATION
# ============================================================

@admin.register(PromotionNotification)
class PromotionNotificationAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "employee",
        "application",
        "notification_type",
        "title",
        "status",
        "is_read",
        "created_at",
    )

    list_filter = (
        "notification_type",
        "status",
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
        "read_at",
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
                    "status",
                )
            },
        ),

        (
            "Notification Status",
            {
                "fields": (
                    "is_read",
                    "read_at",
                    "created_at",
                )
            },
        ),
    )


# ============================================================
# 11. PROMOTION HISTORY
# ============================================================

@admin.register(PromotionHistory)
class PromotionHistoryAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "employee",
        "application",
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

    fieldsets = (

        (
            "Promotion",
            {
                "fields": (
                    "employee",
                    "application",
                    "old_title",
                    "new_title",
                    "approval_date",
                )
            },
        ),

        (
            "Promotion Letter",
            {
                "fields": (
                    "promotion_letter",
                    "comments",
                )
            },
        ),

        (
            "System Information",
            {
                "fields": (
                    "created_at",
                )
            },
        ),
    )


# ============================================================
# 12. PROMOTION APPEAL
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
        "received_at",
    )

    search_fields = (
        "applicant__first_name",
        "applicant__last_name",
        "applicant__email",
        "application__full_name",
        "decisions_disagreed_with",
        "reasons_for_disagreement",
        "appeal_decision",
    )

    ordering = (
        "-received_at",
    )

    readonly_fields = (
        "received_at",
        "decided_at",
    )

    fieldsets = (

        # ----------------------------------------------------
        # APPEAL APPLICATION
        # ----------------------------------------------------

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

        # ----------------------------------------------------
        # APPLICANT APPEAL
        # ----------------------------------------------------

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

        # ----------------------------------------------------
        # APPEAL COMMITTEE
        # ----------------------------------------------------

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

        # ----------------------------------------------------
        # SYSTEM INFORMATION
        # ----------------------------------------------------

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

    # --------------------------------------------------------
    # AUTOMATIC APPEAL DECISION DATE
    # --------------------------------------------------------

    def save_model(self, request, obj, form, change):

        from django.utils import timezone

        if change:

            old_obj = PromotionAppeal.objects.get(
                pk=obj.pk
            )

            # Appeal committee has made a decision
            if (
                obj.status in ["UPHELD", "REJECTED"]
                and old_obj.status not in ["UPHELD", "REJECTED"]
            ):
                obj.decided_at = timezone.now()

            # Decision changed
            elif (
                obj.status in ["UPHELD", "REJECTED"]
                and obj.status != old_obj.status
            ):
                obj.decided_at = timezone.now()

        super().save_model(
            request,
            obj,
            form,
            change
        )


# ============================================================
# 13. SYSTEM LOG
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