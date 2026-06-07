from django.db import models
from django.contrib.auth.models import AbstractUser

# ==========================
# 1. DEPARTMENT
# ==========================
class Department(models.Model):
    department_name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.department_name


# ==========================
# 2. JOB TITLE
# ==========================
class JobTitle(models.Model):
    title_name = models.CharField(max_length=100, unique=True)
    salary_scale = models.CharField(max_length=50)
    min_years_required = models.PositiveIntegerField()
    min_appraisal_score = models.DecimalField(
        max_digits=5,
        decimal_places=2
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title_name


# ==========================
# 3. EMPLOYEE (CUSTOM USER)
# ==========================
class Employee(AbstractUser):
    ROLE_CHOICES = (
        ('Admin', 'Admin'),
        ('HR', 'HR'),
        ('Manager', 'Manager'),
        ('Staff', 'Staff'),
    )

    STATUS_CHOICES = (
        ('Active', 'Active'),
        ('Promoted', 'Promoted'),
        ('Terminated', 'Terminated'),
    )

    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='Staff'
    )
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    job_title = models.ForeignKey(
        JobTitle,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    manager = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subordinates'
    )
    hire_date = models.DateField(
        null=True,
        blank=True
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='Active'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    def save(self, *args, **kwargs):
        if self.is_superuser:
            self.role = "Admin"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


# ==========================
# 4. PERFORMANCE APPRAISAL
# ==========================
class Appraisal(models.Model):
    employee = models.ForeignKey(
        Employee, 
        on_delete=models.CASCADE, 
        related_name='appraisals'
    )
    evaluator = models.ForeignKey(
        Employee, 
        on_delete=models.CASCADE, 
        related_name='evaluated_appraisals'
    )  # Usually a Manager
    appraisal_year = models.PositiveIntegerField()
    score = models.DecimalField(
        max_digits=5, 
        decimal_places=2
    )
    comments = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Appraisal {self.appraisal_year}: {self.employee.last_name} - Score: {self.score}"


# ==========================
# 5. PROMOTION APPLICATION
# ==========================
class PromotionApplication(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Recommended', 'Recommended'),
        ('Verified', 'Verified'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    )

    employee = models.ForeignKey(
        Employee, 
        on_delete=models.CASCADE, 
        related_name='applications'
    )
    current_title = models.ForeignKey(
        JobTitle, 
        on_delete=models.CASCADE, 
        related_name='current_applications'
    )
    targeted_title = models.ForeignKey(
        JobTitle, 
        on_delete=models.CASCADE, 
        related_name='target_applications'
    )
    attachments = models.FileField(
        upload_to='promotion_documents/', 
        blank=True, 
        null=True
    )
    
    # Workflow Status Tracks
    manager_status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='Pending'
    )
    manager_comments = models.TextField(blank=True, null=True)
    
    hr_status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='Pending'
    )
    hr_comments = models.TextField(blank=True, null=True)
    
    final_status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='Pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Application: {self.employee.last_name} to {self.targeted_title.title_name}"


# ==========================
# 6. PROMOTION HISTORY
# ==========================
class PromotionHistory(models.Model):
    employee = models.ForeignKey(
        Employee, 
        on_delete=models.CASCADE, 
        related_name='promotion_histories'
    )
    old_title = models.ForeignKey(
        JobTitle, 
        on_delete=models.CASCADE, 
        related_name='old_promotions'
    )
    new_title = models.ForeignKey(
        JobTitle, 
        on_delete=models.CASCADE, 
        related_name='new_promotions'
    )
    approval_date = models.DateField(auto_now_add=True)
    letter = models.FileField(
        upload_to='promotion_letters/', 
        blank=True, 
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"History: {self.employee.last_name} promoted to {self.new_title.title_name}"


# ==========================
# 7. SYSTEM AUDIT LOG
# ==========================
class SystemLog(models.Model):
    user = models.ForeignKey(
        Employee, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    action = models.CharField(max_length=255)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.created_at} - {self.action}"