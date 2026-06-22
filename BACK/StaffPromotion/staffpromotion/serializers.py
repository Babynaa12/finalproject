from rest_framework import serializers
from .models import (
    Department, JobTitle, Employee,
    Appraisal, PromotionApplication, PromotionHistory
)
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

# ==========================
# 1. DEPARTMENT
# ==========================
class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'


# ==========================
# 2. JOB TITLE
# ==========================
class JobTitleSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobTitle
        fields = '__all__'


# ==========================
# 3. EMPLOYEE
# ==========================
class EmployeeSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.department_name', read_only=True)
    job_title_name = serializers.CharField(source='job_title.title_name', read_only=True)
    manager_name = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = [
            'id', 'username', 'first_name', 'last_name', 'email',
            'role', 'department', 'department_name',
            'job_title', 'job_title_name',
            'manager', 'manager_name',
            'status', 'hire_date'
        ]

    def get_manager_name(self, obj):
        if obj.manager:
            return f"{obj.manager.first_name} {obj.manager.last_name}"
        return "No Manager"


# ==========================
# 4. REGISTER EMPLOYEE
# ==========================
class EmployeeRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = [
            'username', 'first_name', 'last_name', 'email',
            'password', 'role', 'department',
            'job_title', 'manager', 'hire_date'
        ]
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = Employee(**validated_data)
        user.set_password(password)
        user.save()
        return user


# ==========================
# 5. APPRAISAL
# ==========================
class AppraisalSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    evaluator_name = serializers.SerializerMethodField()

    class Meta:
        model = Appraisal
        fields = '__all__'

    def get_employee_name(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"

    def get_evaluator_name(self, obj):
        return f"{obj.evaluator.first_name} {obj.evaluator.last_name}"


# ==========================
# 6. PROMOTION APPLICATION
# ==========================
class PromotionApplicationSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    current_title_name = serializers.CharField(source='current_title.title_name', read_only=True)
    targeted_title_name = serializers.CharField(source='targeted_title.title_name', read_only=True)

    class Meta:
        model = PromotionApplication
        fields = '__all__'

    def get_employee_name(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"


# ==========================
# 7. PROMOTION HISTORY
# ==========================
class PromotionHistorySerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    old_title_name = serializers.CharField(source='old_title.title_name', read_only=True)
    new_title_name = serializers.CharField(source='new_title.title_name', read_only=True)

    class Meta:
        model = PromotionHistory
        fields = '__all__'

    def get_employee_name(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"
    
    from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = "email"

    def validate(self, attrs):
        data = super().validate(attrs)

        user = self.user

        data["user"] = {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "name": f"{user.first_name} {user.last_name}"
        }

        return data