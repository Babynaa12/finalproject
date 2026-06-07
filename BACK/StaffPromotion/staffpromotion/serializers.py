from rest_framework import serializers
from .models import Department, JobTitle, Employee, Appraisal, PromotionApplication, PromotionHistory

# ==========================================
# 1. DEPARTMENT SERIALIZER
# ==========================================
class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'


# ==========================================
# 2. JOB TITLE SERIALIZER
# ==========================================
class JobTitleSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobTitle
        fields = '__all__'


# ==========================================
# 3. EMPLOYEE SERIALIZER (Kwa ajili ya Profiles na List)
# ==========================================
class EmployeeSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    job_title_name = serializers.CharField(source='job_title.title', read_only=True)
    manager_name = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = [
            'id', 'username', 'first_name', 'last_name', 'email', 
            'role', 'department', 'department_name', 'job_title', 
            'job_title_name', 'manager', 'manager_name', 'status', 'hire_date'
        ]
        extra_kwargs = {
            'password': {'write_only': True} # Password isionekane React ikivuta data
        }

    def get_manager_name(self, obj):
        if obj.manager:
            return f"{obj.manager.first_name} {obj.manager.last_name}"
        return "No Manager"


# ==========================================
# 4. REGISTRATION SERIALIZER (Inatumiwa na HR kusajili Staff mpya)
# ==========================================
class EmployeeRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ['username', 'first_name', 'last_name', 'email', 'password', 'role', 'department', 'job_title', 'manager', 'hire_date']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # Hapa tunahakikisha password inakuwa encrypted (hashed) vizuri kwenye database
        password = validated_data.pop('password')
        employee = Employee(**validated_data)
        employee.set_password(password)
        employee.save()
        return employee


# ==========================================
# 5. APPRAISAL SERIALIZER
# ==========================================
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


# ==========================================
# 6. PROMOTION APPLICATION SERIALIZER
# ==========================================
class PromotionApplicationSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    current_title_name = serializers.CharField(source='current_job_title.title', read_only=True)
    proposed_title_name = serializers.CharField(source='proposed_job_title.title', read_only=True)

    class Meta:
        model = PromotionApplication
        fields = '__all__'

    def get_employee_name(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"


# ==========================================
# 7. PROMOTION HISTORY SERIALIZER
# ==========================================
class PromotionHistorySerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    old_title_name = serializers.CharField(source='old_job_title.title', read_only=True)
    new_title_name = serializers.CharField(source='new_job_title.title', read_only=True)

    class Meta:
        model = PromotionHistory
        fields = '__all__'

    def get_employee_name(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"