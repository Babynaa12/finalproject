from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import FileExtensionValidator
from decimal import Decimal


# ============================================================
# 1. DEPARTMENT
# ============================================================

class Department(models.Model):

    department_name = models.CharField(
        max_length=150,
        unique=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.department_name


# ============================================================
# 2. JOB TITLE / ACADEMIC RANK
# ============================================================

class JobTitle(models.Model):

    title_name = models.CharField(
        max_length=150,
        unique=True
    )

    salary_scale = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    min_years_required = models.PositiveIntegerField(
        default=0
    )

    min_appraisal_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0
    )

    description = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.title_name


# ============================================================
# 3. EMPLOYEE / SYSTEM USER
# ============================================================

class Employee(AbstractUser):

    ROLE_CHOICES = (
        ("STAFF", "Academic Staff"),
        ("STUDENT", "Student"),
        ("HOD", "Head of Department"),
        ("DEAN", "Dean"),
        ("REVIEWER", "Reviewer"),
        ("COMMITTEE", "Promotion Committee"),
        ("APPEAL_COMMITTEE", "Appeal Committee"),
        ("ADMIN", "Administrator"),
    )

    STATUS_CHOICES = (
        ("ACTIVE", "Active"),
        ("INACTIVE", "Inactive"),
        ("SUSPENDED", "Suspended"),
        ("TERMINATED", "Terminated"),
    )

    # ========================================================
    # PERSONAL INFORMATION
    # ========================================================

    email = models.EmailField(
        unique=True
    )

    phone_number = models.CharField(
        max_length=30,
        blank=True,
        null=True
    )

    date_of_birth = models.DateField(
        blank=True,
        null=True
    )

    nationality = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    # ========================================================
    # SYSTEM ROLE
    # ========================================================

    role = models.CharField(
        max_length=30,
        choices=ROLE_CHOICES,
        default="STAFF"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="ACTIVE"
    )

    # ========================================================
    # ORGANIZATION
    # ========================================================

    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="employees"
    )

    job_title = models.ForeignKey(
        JobTitle,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="employees"
    )

    manager = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="subordinates"
    )

    # ========================================================
    # EMPLOYMENT INFORMATION
    # ========================================================

    appointment_date = models.DateField(
        blank=True,
        null=True
    )

    first_appointment_position = models.ForeignKey(
        JobTitle,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="first_appointment_employees"
    )

    current_position_appointment_date = models.DateField(
        blank=True,
        null=True
    )

    employment_status = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    # ========================================================
    # PROFILE
    # ========================================================

    profile_photo = models.ImageField(
        upload_to="profiles/",
        blank=True,
        null=True
    )

    address = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    USERNAME_FIELD = "email"

    REQUIRED_FIELDS = [
        "username",
        "first_name",
        "last_name"
    ]

    def __str__(self):
        return f"{self.first_name} {self.last_name}".strip()

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()


# ============================================================
# 4. STUDENT TEACHING EVALUATION
# ============================================================

class StudentTeachingEvaluation(models.Model):

    RATING_CHOICES = (
        (5, "Excellent"),
        (4, "Very Good"),
        (3, "Good"),
        (2, "Satisfactory"),
        (1, "Poor"),
    )

    YES_NO_CHOICES = (
        ("YES", "Yes"),
        ("NO", "No"),
    )

    student = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name="student_evaluations"
    )

    instructor = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name="teaching_evaluations"
    )

    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    degree_programme = models.CharField(
        max_length=200,
        blank=True,
        null=True
    )

    faculty_institute_centre = models.CharField(
        max_length=200,
        blank=True,
        null=True
    )

    semester = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    course_code = models.CharField(
        max_length=100
    )

    course_name = models.CharField(
        max_length=200
    )

    academic_year = models.CharField(
        max_length=20,
        blank=True,
        null=True
    )

    course_outline_provided = models.CharField(
        max_length=3,
        choices=YES_NO_CHOICES,
        blank=True,
        null=True
    )

    learning_outcomes_provided = models.CharField(
        max_length=3,
        choices=YES_NO_CHOICES,
        blank=True,
        null=True
    )

    learning_outcome_1 = models.PositiveSmallIntegerField(
        choices=RATING_CHOICES,
        blank=True,
        null=True
    )

    learning_outcome_2 = models.PositiveSmallIntegerField(
        choices=RATING_CHOICES,
        blank=True,
        null=True
    )

    learning_outcome_3 = models.PositiveSmallIntegerField(
        choices=RATING_CHOICES,
        blank=True,
        null=True
    )

    learning_outcome_4 = models.PositiveSmallIntegerField(
        choices=RATING_CHOICES,
        blank=True,
        null=True
    )

    learning_outcome_5 = models.PositiveSmallIntegerField(
        choices=RATING_CHOICES,
        blank=True,
        null=True
    )

    learning_outcome_6 = models.PositiveSmallIntegerField(
        choices=RATING_CHOICES,
        blank=True,
        null=True
    )

    three_important_things_learned = models.TextField(
        blank=True,
        null=True
    )

    provided_teaching_notes = models.BooleanField(default=False)
    provided_handouts = models.BooleanField(default=False)
    provided_articles = models.BooleanField(default=False)
    provided_reference_materials = models.BooleanField(default=False)
    provided_library_references = models.BooleanField(default=False)
    gave_assignments = models.BooleanField(default=False)
    provided_practicals = models.BooleanField(default=False)
    assigned_seminars = models.BooleanField(default=False)
    gave_tests = models.BooleanField(default=False)

    other_learning_method = models.TextField(
        blank=True,
        null=True
    )

    best_learning_options = models.TextField(
        blank=True,
        null=True
    )

    instructor_consultation_rating = models.PositiveSmallIntegerField(
        choices=RATING_CHOICES,
        blank=True,
        null=True
    )

    encouraged_teamwork = models.CharField(
        max_length=3,
        choices=YES_NO_CHOICES,
        blank=True,
        null=True
    )

    teamwork_explanation = models.TextField(
        blank=True,
        null=True
    )

    organized_lectures_rating = models.PositiveSmallIntegerField(
        choices=RATING_CHOICES,
        blank=True,
        null=True
    )

    synthesized_material_rating = models.PositiveSmallIntegerField(
        choices=RATING_CHOICES,
        blank=True,
        null=True
    )

    english_expression_rating = models.PositiveSmallIntegerField(
        choices=RATING_CHOICES,
        blank=True,
        null=True
    )

    encouraged_questions_rating = models.PositiveSmallIntegerField(
        choices=RATING_CHOICES,
        blank=True,
        null=True
    )

    consultation_availability_rating = models.PositiveSmallIntegerField(
        choices=RATING_CHOICES,
        blank=True,
        null=True
    )

    feedback_rating = models.PositiveSmallIntegerField(
        choices=RATING_CHOICES,
        blank=True,
        null=True
    )

    teaching_comments = models.TextField(
        blank=True,
        null=True
    )

    continuous_assessment_comments = models.TextField(
        blank=True,
        null=True
    )

    practical_comments = models.TextField(
        blank=True,
        null=True
    )

    seminar_comments = models.TextField(
        blank=True,
        null=True
    )

    other_comments = models.TextField(
        blank=True,
        null=True
    )

    submitted_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.student} - {self.instructor} - {self.course_name}"


# ============================================================
# 5. PEER REVIEW
# ============================================================

class PeerReview(models.Model):

    GRADE_CHOICES = (
        ("A", "Excellent"),
        ("B_PLUS", "Very Good"),
        ("B", "Good"),
        ("C", "Satisfactory"),
        ("D", "Poor"),
    )

    reviewer = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name="peer_reviews_given"
    )

    instructor = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name="peer_reviews_received"
    )

    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    academic_rank = models.ForeignKey(
        JobTitle,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    course_code = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    course_name = models.CharField(
        max_length=200,
        blank=True,
        null=True
    )

    degree_programmes = models.TextField(
        blank=True,
        null=True
    )

    semester = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    preparation_of_content = models.BooleanField(default=False)
    delivery_of_subject_matter = models.BooleanField(default=False)
    expression_in_english = models.BooleanField(default=False)
    use_of_teaching_aids = models.BooleanField(default=False)
    engaging_students = models.BooleanField(default=False)
    encouraging_student_participation = models.BooleanField(default=False)

    other_strengths = models.TextField(
        blank=True,
        null=True
    )

    improvement_areas = models.TextField(
        blank=True,
        null=True
    )

    overall_grade = models.CharField(
        max_length=20,
        choices=GRADE_CHOICES,
        blank=True,
        null=True
    )

    overall_points = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        blank=True,
        null=True
    )

    comments = models.TextField(
        blank=True,
        null=True
    )

    submitted_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"Peer Review - {self.instructor}"


# ============================================================
# 6. PROMOTION APPLICATION
# ============================================================

class PromotionApplication(models.Model):

    STATUS_CHOICES = (
        ("DRAFT", "Draft"),
        ("SUBMITTED", "Submitted"),
        ("HOD_REVIEW", "HOD Review"),
        ("DEAN_REVIEW", "Dean Review"),
        ("UNDER_REVIEW", "Under Academic Review"),
        ("COMMITTEE_REVIEW", "Promotion Committee Review"),
        ("APPROVED", "Approved"),
        ("REJECTED", "Rejected"),
        ("APPEALED", "Appealed"),
    )

    YES_NO_CHOICES = (
        ("YES", "Yes"),
        ("NO", "No"),
    )

    # ========================================================
    # APPLICANT
    # ========================================================

    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name="promotion_applications"
    )

    # ========================================================
    # PERSONAL PARTICULARS
    # ========================================================

    # Snapshot of applicant's name at application time
    full_name = models.CharField(
        max_length=300
    )

    date_of_birth = models.DateField(
        blank=True,
        null=True
    )

    nationality = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    # ========================================================
    # PRESENT AND TARGET POSITION
    # ========================================================

    current_title = models.ForeignKey(
        JobTitle,
        on_delete=models.PROTECT,
        related_name="current_promotion_applications"
    )

    targeted_title = models.ForeignKey(
        JobTitle,
        on_delete=models.PROTECT,
        related_name="targeted_promotion_applications"
    )

    date_of_appointment_at_suza = models.DateField(
        blank=True,
        null=True
    )

    position_at_first_appointment = models.ForeignKey(
        JobTitle,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="first_position_applications"
    )

    employment_status = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    present_position = models.ForeignKey(
        JobTitle,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="present_position_applications"
    )

    date_of_current_position = models.DateField(
        blank=True,
        null=True
    )

    position_applied_for = models.ForeignKey(
        JobTitle,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="promotion_target_applications"
    )

    applied_same_rank_before = models.CharField(
        max_length=3,
        choices=YES_NO_CHOICES,
        blank=True,
        null=True
    )

    previous_application_date = models.DateField(
        blank=True,
        null=True
    )

    intends_new_publications = models.CharField(
        max_length=3,
        choices=YES_NO_CHOICES,
        blank=True,
        null=True
    )

    # ========================================================
    # DOCUMENTS
    # ========================================================

    cv = models.FileField(
        upload_to="promotion_documents/cv/",
        validators=[
            FileExtensionValidator(["pdf"])
        ],
        blank=True,
        null=True
    )

    additional_documents = models.FileField(
        upload_to="promotion_documents/additional/",
        validators=[
            FileExtensionValidator(["pdf"])
        ],
        blank=True,
        null=True
    )

    # ========================================================
    # APPLICATION WORKFLOW
    # ========================================================

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="DRAFT"
    )

    hod = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="hod_applications"
    )

    dean = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="dean_applications"
    )

    assigned_reviewer = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_promotion_reviews"
    )

    # ========================================================
    # HOD
    # ========================================================

    hod_recommendation = models.TextField(
        blank=True,
        null=True
    )

    hod_comments = models.TextField(
        blank=True,
        null=True
    )

    hod_reviewed_at = models.DateTimeField(
        blank=True,
        null=True
    )

    # ========================================================
    # DEAN
    # ========================================================

    dean_recommendation = models.TextField(
        blank=True,
        null=True
    )

    dean_comments = models.TextField(
        blank=True,
        null=True
    )

    dean_reviewed_at = models.DateTimeField(
        blank=True,
        null=True
    )

    # ========================================================
    # COMMITTEE
    # ========================================================

    COMMITTEE_DECISION_CHOICES = (
    ("APPROVED", "Approved"),
    ("REJECTED", "Rejected"),
    )

    committee_decision = models.CharField(
        max_length=20,
        choices=COMMITTEE_DECISION_CHOICES,
        blank=True,
        null=True
    )
    committee_comments = models.TextField(
        blank=True,
        null=True
    )

    committee_decided_at = models.DateTimeField(
        blank=True,
        null=True
    )

    # ========================================================
    # POINTS
    # ========================================================

    journal_book_points = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0
    )

    other_publication_points = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0
    )

    teaching_points = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0
    )

    total_points = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0
    )

    points_required = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0
    )

    points_difference = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0
    )

    # ========================================================
    # DECLARATION
    # ========================================================

    applicant_declaration = models.BooleanField(
        default=False
    )

    applicant_signature_date = models.DateField(
        blank=True,
        null=True
    )

    # ========================================================
    # TIMESTAMPS
    # ========================================================

    submitted_at = models.DateTimeField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return (
            f"{self.full_name} -> "
            f"{self.targeted_title.title_name}"
        )

    @property
    def reviewer_stage_completed(self):
        return (
            self.status in [
                "COMMITTEE_REVIEW",
                "APPROVED",
                "REJECTED",
                "APPEALED",
            ]
            and self.assigned_reviewer_id is not None
        )

    @property
    def student_evaluation_stage_completed(self):
        return self.status in [
            "COMMITTEE_REVIEW",
            "APPROVED",
            "REJECTED",
            "APPEALED",
        ]

    @property
    def ready_for_committee(self):
        return (
            self.reviewer_stage_completed
            and self.student_evaluation_stage_completed
        )


# ============================================================
# 7. PROMOTION MATERIAL / CHECKLIST
# ============================================================

class PromotionMaterial(models.Model):

    MATERIAL_TYPES = (
        ("JOURNAL_ARTICLE", "Journal Articles"),
        ("BOOK_CHAPTER", "Chapters in a Book"),
        ("SCHOLARLY_BOOK", "Scholarly Books"),
        (
            "INTERNATIONAL_PROCEEDINGS",
            "Scholarly Papers in Proceedings of Professional International Symposia or Conferences"
        ),
        ("CASE_REPORT", "Case Reports or Short Communications"),
        ("PATENT", "Patents"),
        ("CONSULTANCY_REPORT", "Consultancy Reports"),
        ("CONFERENCE_PAPER", "Conference Papers"),
        ("EXTENSION_MATERIAL", "Extension Materials"),
        ("LOWER_LEVEL_BOOK", "Lower-level Books"),
        ("DICTIONARY", "Subject and General Dictionaries"),
        ("DICTIONARY_LETTER", "Letters in Dictionaries"),
        ("BOOK_REVIEW", "Book Reviews"),
        ("JOURNAL_REVIEW", "Journal Articles Review"),
    )

    application = models.ForeignKey(
        PromotionApplication,
        on_delete=models.CASCADE,
        related_name="promotion_materials"
    )

    material_type = models.CharField(
        max_length=50,
        choices=MATERIAL_TYPES
    )

    # Score entered by applicant
    points = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0
    )

    # Supporting evidence for THIS material
    document = models.FileField(
        upload_to="promotion_documents/materials/",
        validators=[
            FileExtensionValidator(["pdf"])
        ],
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return (
            f"{self.get_material_type_display()} - "
            f"{self.points} points"
        )


# ============================================================
# 8. ACADEMIC MATERIAL REVIEW
# ============================================================

class AcademicMaterialReview(models.Model):

    GRADE_CHOICES = (
        ("A", "Excellent"),
        ("B", "Very Good"),
        ("C", "Good"),
        ("D", "Poor"),
    )

    material = models.ForeignKey(
        PromotionMaterial,
        on_delete=models.CASCADE,
        related_name="academic_reviews"
    )

    reviewer = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name="academic_material_reviews"
    )

    authenticity = models.TextField(blank=True, null=True)
    originality = models.TextField(blank=True, null=True)
    coverage_of_subject = models.TextField(blank=True, null=True)
    contribution_to_knowledge = models.TextField(blank=True, null=True)
    relevance_to_discipline = models.TextField(blank=True, null=True)
    presentation_quality = models.TextField(blank=True, null=True)
    technical_recommendation = models.TextField(blank=True, null=True)

    grade = models.CharField(
        max_length=1,
        choices=GRADE_CHOICES,
        blank=True,
        null=True
    )

    points = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0
    )

    overall_quality = models.TextField(blank=True, null=True)
    strengths = models.TextField(blank=True, null=True)
    shortcomings = models.TextField(blank=True, null=True)

    reviewer_name = models.CharField(
        max_length=200,
        blank=True,
        null=True
    )

    reviewer_academic_rank = models.CharField(
        max_length=200,
        blank=True,
        null=True
    )

    reviewer_affiliation = models.CharField(
        max_length=300,
        blank=True,
        null=True
    )

    reviewer_signature_date = models.DateField(
        blank=True,
        null=True
    )

    submitted_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"Review - {self.material}"


# ============================================================
# 9. REVIEWER ASSIGNMENT
# ============================================================

class ReviewerAssignment(models.Model):

    application = models.ForeignKey(
        PromotionApplication,
        on_delete=models.CASCADE,
        related_name="reviewer_assignments"
    )

    reviewer = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name="reviewer_assignments"
    )

    assigned_by = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewer_assignments_created"
    )

    assigned_at = models.DateTimeField(
        auto_now_add=True
    )

    completed = models.BooleanField(
        default=False
    )

    completed_at = models.DateTimeField(
        blank=True,
        null=True
    )

    comments = models.TextField(
        blank=True,
        null=True
    )

    def __str__(self):
        return f"{self.reviewer} - {self.application}"


# ============================================================
# 10. PROMOTION NOTIFICATION
# ============================================================

class PromotionNotification(models.Model):

    NOTIFICATION_TYPES = (
        ("APPLICATION_SUBMITTED", "Application Submitted"),
        ("HOD_REVIEW", "HOD Review"),
        ("HOD_APPROVED", "HOD Approved"),
        ("HOD_REJECTED", "HOD Rejected"),

        ("DEAN_REVIEW", "Dean Review"),
        ("DEAN_APPROVED", "Dean Approved"),
        ("DEAN_REJECTED", "Dean Rejected"),

        ("REVIEWER_ASSIGNED", "Reviewer Assigned"),
        ("UNDER_REVIEW", "Under Academic Review"),
        ("REVIEW_COMPLETED", "Academic Review Completed"),

        ("COMMITTEE_REVIEW", "Promotion Committee Review"),
        ("APPROVED", "Promotion Approved"),
        ("REJECTED", "Promotion Rejected"),

        ("APPEAL", "Promotion Appeal"),
        ("GENERAL", "General Notification"),
    )

    # ========================================================
    # STAFF WHO RECEIVES NOTIFICATION
    # ========================================================

    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name="promotion_notifications"
    )

    # ========================================================
    # RELATED APPLICATION
    # ========================================================

    application = models.ForeignKey(
        PromotionApplication,
        on_delete=models.CASCADE,
        related_name="notifications",
        null=True,
        blank=True
    )

    # ========================================================
    # NOTIFICATION INFORMATION
    # ========================================================

    notification_type = models.CharField(
        max_length=50,
        choices=NOTIFICATION_TYPES,
        default="GENERAL"
    )

    title = models.CharField(
        max_length=255
    )

    message = models.TextField()

    # Current stage/status shown to staff
    status = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    is_read = models.BooleanField(
        default=False
    )

    # ========================================================
    # TIMESTAMPS
    # ========================================================

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    read_at = models.DateTimeField(
        blank=True,
        null=True
    )

    def __str__(self):
        return (
            f"{self.employee} - "
            f"{self.title}"
        )

    class Meta:
        ordering = ["-created_at"]


# ============================================================
# 11. PROMOTION HISTORY
# ============================================================

class PromotionHistory(models.Model):

    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name="promotion_histories"
    )

    application = models.ForeignKey(
        PromotionApplication,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="promotion_history"
    )

    old_title = models.ForeignKey(
        JobTitle,
        on_delete=models.PROTECT,
        related_name="old_promotion_histories"
    )

    new_title = models.ForeignKey(
        JobTitle,
        on_delete=models.PROTECT,
        related_name="new_promotion_histories"
    )

    approval_date = models.DateField()

    promotion_letter = models.FileField(
        upload_to="promotion_letters/",
        validators=[
            FileExtensionValidator(["pdf"])
        ],
        blank=True,
        null=True
    )

    comments = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.employee} -> {self.new_title.title_name}"


# ============================================================
# 12. PROMOTION APPEAL
# ============================================================

class PromotionAppeal(models.Model):

    STATUS_CHOICES = (
        ("SUBMITTED", "Submitted"),
        ("UNDER_REVIEW", "Under Review"),
        ("UPHELD", "Appeal Upheld"),
        ("REJECTED", "Appeal Rejected"),
    )

    application = models.ForeignKey(
        PromotionApplication,
        on_delete=models.CASCADE,
        related_name="appeals"
    )

    applicant = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name="promotion_appeals"
    )

    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    position = models.ForeignKey(
        JobTitle,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    date_of_appointment_at_position = models.DateField(
        blank=True,
        null=True
    )

    decisions_disagreed_with = models.TextField()

    reasons_for_disagreement = models.TextField()

    self_rating = models.TextField(
        blank=True,
        null=True
    )

    applicant_signature_date = models.DateField(
        blank=True,
        null=True
    )

    appeal_committee_comments = models.TextField(
        blank=True,
        null=True
    )

    appeal_decision = models.TextField(
        blank=True,
        null=True
    )

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="SUBMITTED"
    )

    received_at = models.DateTimeField(
        auto_now_add=True
    )

    decided_at = models.DateTimeField(
        blank=True,
        null=True
    )

    def __str__(self):
        return f"Appeal - {self.applicant}"


# ============================================================
# 13. SYSTEM LOG
# ============================================================

class SystemLog(models.Model):

    user = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="system_logs"
    )

    action = models.CharField(
        max_length=255
    )

    description = models.TextField(
        blank=True,
        null=True
    )

    ip_address = models.GenericIPAddressField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.created_at} - {self.action}"