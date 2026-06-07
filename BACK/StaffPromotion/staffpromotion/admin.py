from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Department, JobTitle, Employee, Appraisal, PromotionApplication, PromotionHistory, SystemLog

# ========================================================
# CUSTOM USER INTERFACE MANAGEMENT
# ========================================================
class EmployeeAdmin(BaseUserAdmin):
    # What columns show up on the main list table
    list_display = ('email', 'first_name', 'last_name', 'role', 'status', 'is_superuser')
    list_filter = ('role', 'status', 'is_superuser', 'department')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)

    # Overriding the default User fieldsets to clean out old configurations
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'username')}),
        ('System Management Roles', {'fields': ('role', 'department', 'job_title', 'manager', 'status', 'hire_date')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )


# ========================================================
# REGISTER ALL 7 APP TABLES TO THE CONTROL PANEL
# ========================================================
admin.site.register(Employee, EmployeeAdmin)
admin.site.register(Department)
admin.site.register(JobTitle)
admin.site.register(Appraisal)
admin.site.register(PromotionApplication)
admin.site.register(PromotionHistory)
admin.site.register(SystemLog)