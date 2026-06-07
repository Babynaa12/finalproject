from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # ========================================================
    # 1. CORE AUTHENTICATION ROUTES (JWT Sessions)
    # ========================================================
    path('auth/register/', views.register_user, name='auth_register'),
    path('auth/login/', views.login_user, name='auth_login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # ========================================================
    # 2. MAIN UNIVERSAL FUNCTIONAL DASHBOARD
    # ========================================================
    path('dashboard/', views.dashboard_stats, name='dashboard_stats'),

    # ========================================================
    # 3. AUTOMATED PROMOTION ENGINE ROUTING
    # ========================================================
    path('promotion/check-eligibility/', views.check_eligibility, name='check_eligibility'),
    path('promotion/decision/<int:pk>/', views.process_promotion_decision, name='process_decision'),

    # ========================================================
    # 4. INSTANTIATED GENERIC CRUD ENDPOINTS
    # ========================================================
    
    # Employee Management Roster
    path('employees/', views.manage_employees_list, name='employees_list'),
    path('employees/<int:pk>/', views.manage_employees_detail, name='employees_detail'),

    # Corporate Departments
    path('departments/', views.manage_departments_list, name='departments_list'),
    path('departments/<int:pk>/', views.manage_departments_detail, name='departments_detail'),

    # Job Positions & Titles
    path('jobtitles/', views.manage_jobtitles_list, name='jobtitles_list'),
    path('jobtitles/<int:pk>/', views.manage_jobtitles_detail, name='jobtitles_detail'),

    # Performance Appraisals
    path('appraisals/', views.manage_appraisals_list, name='appraisals_list'),
    path('appraisals/<int:pk>/', views.manage_appraisals_detail, name='appraisals_detail'),

    # Active Promotion Applications
    path('applications/', views.manage_applications_list, name='applications_list'),
    path('applications/<int:pk>/', views.manage_applications_detail, name='applications_detail'),

    # Promotion History Archives
    path('history/', views.manage_histories_list, name='histories_list'),
    path('history/<int:pk>/', views.manage_histories_detail, name='histories_detail'),
]