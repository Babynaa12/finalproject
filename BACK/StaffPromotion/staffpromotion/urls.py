from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views


urlpatterns = [

    # ========================================================
    # AUTHENTICATION / JWT
    # ========================================================

    path(
        "auth/register/",
        views.register_user,
        name="auth_register"
    ),

    path(
        "auth/login/",
        views.login_user,
        name="auth_login"
    ),

    path(
        "auth/token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh"
    ),

    path(
        "profile/",
        views.my_profile,
        name="my_profile"
    ),


    # ========================================================
    # DASHBOARD
    # ========================================================

    path(
        "dashboard/",
        views.dashboard_stats,
        name="dashboard_stats"
    ),

    path(
        "notifications/",
        views.list_notifications,
        name="notifications_list"
    ),

    path(
        "notifications/read-all/",
        views.mark_all_notifications_read,
        name="notifications_mark_all_read"
    ),

    path(
        "notifications/<int:pk>/",
        views.mark_notification_read,
        name="notifications_mark_read_detail"
    ),

    path(
        "notifications/<int:pk>/read/",
        views.mark_notification_read,
        name="notifications_mark_read"
    ),

    # ========================================================
    # PROMOTION ELIGIBILITY
    # ========================================================

    path(
        "promotion/check-eligibility/",
        views.check_eligibility,
        name="check_eligibility"
    ),


    # ========================================================
    # PROMOTION DECISION
    # ========================================================

    path(
        "promotion/decision/<int:pk>/",
        views.process_promotion_decision,
        name="process_promotion_decision"
    ),


    # ========================================================
    # EMPLOYEES / USERS
    # ========================================================

    path(
        "employees/",
        views.manage_employees_list,
        name="employees_list"
    ),

    path(
        "employees/<int:pk>/",
        views.manage_employees_detail,
        name="employees_detail"
    ),


    # ========================================================
    # DEPARTMENTS
    # ========================================================

    path(
        "departments/",
        views.manage_departments_list,
        name="departments_list"
    ),

    path(
        "departments/<int:pk>/",
        views.manage_departments_detail,
        name="departments_detail"
    ),


    # ========================================================
    # JOB TITLES / ACADEMIC RANKS
    # ========================================================

    path(
        "jobtitles/",
        views.manage_jobtitles_list,
        name="jobtitles_list"
    ),

    path(
        "jobtitles/<int:pk>/",
        views.manage_jobtitles_detail,
        name="jobtitles_detail"
    ),


    # ========================================================
    # APPENDIX 1
    # STUDENT CONFIDENTIAL TEACHING EVALUATION
    # ========================================================

    path(
        "student-evaluations/",
        views.manage_teaching_evaluations_list,
        name="student_evaluations_list"
    ),

    path(
        "student-evaluations/<int:pk>/",
        views.manage_teaching_evaluations_detail,
        name="student_evaluations_detail"
    ),


    # ========================================================
    # APPENDIX 2
    # PEER REVIEW
    # ========================================================

    path(
        "peer-reviews/",
        views.manage_peer_reviews_list,
        name="peer_reviews_list"
    ),

    path(
        "peer-reviews/<int:pk>/",
        views.manage_peer_reviews_detail,
        name="peer_reviews_detail"
    ),


    # ========================================================
    # APPENDIX 3
    # PROMOTION APPLICATION - FORM A
    # ========================================================

    path(
        "applications/",
        views.manage_applications_list,
        name="applications_list"
    ),

    path(
        "applications/<int:pk>/",
        views.manage_applications_detail,
        name="applications_detail"
    ),

    path(
        "applications/<int:pk>/hod-review/",
        views.hod_review_application,
        name="hod_review_application"
    ),

    path(
        "applications/<int:pk>/notify/",
        views.notify_application_staff,
        name="notify_application_staff"
    ),

    # ========================================================
    # APPENDIX 3
    # PROMOTION MATERIALS / CHECKLIST
    # ========================================================

    path(
        "promotion-materials/",
        views.manage_promotion_materials_list,
        name="promotion_materials_list"
    ),

    path(
        "promotion-materials/<int:pk>/",
        views.manage_promotion_materials_detail,
        name="promotion_materials_detail"
    ),


    # ========================================================
    # APPENDIX 4
    # ACADEMIC MATERIAL REVIEW
    # ========================================================

    path(
        "academic-material-reviews/",
        views.manage_academic_material_reviews_list,
        name="academic_material_reviews_list"
    ),

    path(
        "academic-material-reviews/<int:pk>/",
        views.manage_academic_material_reviews_detail,
        name="academic_material_reviews_detail"
    ),


    # ========================================================
    # REVIEWER ASSIGNMENT
    # ========================================================

    path(
        "reviewer-assignments/",
        views.manage_reviewer_assignments_list,
        name="reviewer_assignments_list"
    ),

    path(
        "reviewer-assignments/<int:pk>/",
        views.manage_reviewer_assignments_detail,
        name="reviewer_assignments_detail"
    ),


    # ========================================================
    # APPENDIX 5
    # PROMOTION APPEAL - FORM D
    # ========================================================

    path(
        "appeals/",
        views.manage_appeals_list,
        name="appeals_list"
    ),

    path(
        "appeals/<int:pk>/",
        views.manage_appeals_detail,
        name="appeals_detail"
    ),


    # ========================================================
    # PROMOTION HISTORY
    # ========================================================

    path(
        "history/",
        views.manage_histories_list,
        name="histories_list"
    ),

    path(
        "history/<int:pk>/",
        views.manage_histories_detail,
        name="histories_detail"
    ),
    
    # ========================================================
    # DEAN REVIEW
    # ========================================================

    path(
        "applications/<int:pk>/dean-review/",
        views.dean_review_application,
        name="dean_review_application"
    ),

    # ========================================================
    # SYSTEM LOGS
    # ========================================================

    path(
        "system-logs/",
        views.manage_system_logs_list,
        name="system_logs_list"
    ),

    path(
        "system-logs/<int:pk>/",
        views.manage_system_logs_detail,
        name="system_logs_detail"
    ),

]