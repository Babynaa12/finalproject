from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import FileExtensionValidator
from django.core.exceptions import ValidationError


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

    # --------------------------------------------------------
    # PERSONAL INFORMATION
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # SYSTEM ROLE
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # ORGANIZATION INFORMATION
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # EMPLOYMENT INFORMATION
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # PROFILE
    # --------------------------------------------------------

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
        return (
            f"{self.first_name} "
            f"{self.last_name}"
        )


# ============================================================
# 4. STUDENT TEACHING EVALUATION
# Appendix 1
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

    # --------------------------------------------------------
    # PART 1: STUDENT LEARNING
    # --------------------------------------------------------

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

    provided_teaching_notes = models.BooleanField(
        default=False
    )

    provided_handouts = models.BooleanField(
        default=False
    )

    provided_articles = models.BooleanField(
        default=False
    )

    provided_reference_materials = models.BooleanField(
        default=False
    )

    provided_library_references = models.BooleanField(
        default=False
    )

    gave_assignments = models.BooleanField(
        default=False
    )

    provided_practicals = models.BooleanField(
        default=False
    )

    assigned_seminars = models.BooleanField(
        default=False
    )

    gave_tests = models.BooleanField(
        default=False
    )

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

    # --------------------------------------------------------
    # PART 2: TEACHING AND CONTINUOUS ASSESSMENT
    # --------------------------------------------------------

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
        return (
            f"{self.student} - "
            f"{self.instructor} - "
            f"{self.course_name}"
        )


# ============================================================
# 5. PEER REVIEW
# Appendix 2
# ============================================================

class PeerReview(models.Model):

    GRADE_CHOICES = (
        ("A", "Excellent"),
        ("B_PLUS", "Very Good"),
        ("B", "Good"),
        ("C", "Satisfactory"),
        ("D", "Poor"),
    )

    POINT_CHOICES = (
        (2.0, "2.0"),
        (1.5, "1.5"),
        (1.0, "1.0"),
        (0.5, "0.5"),
        (0.0, "0.0"),
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

    # --------------------------------------------------------
    # AREAS WHERE STAFF IS DOING WELL
    # --------------------------------------------------------

    preparation_of_content = models.BooleanField(
        default=False
    )

    delivery_of_subject_matter = models.BooleanField(
        default=False
    )

    expression_in_english = models.BooleanField(
        default=False
    )

    use_of_teaching_aids = models.BooleanField(
        default=False
    )

    engaging_students = models.BooleanField(
        default=False
    )

    encouraging_student_participation = models.BooleanField(
        default=False
    )

    other_strengths = models.TextField(
        blank=True,
        null=True
    )

    # --------------------------------------------------------
    # AREAS NEEDING IMPROVEMENT
    # --------------------------------------------------------

    improvement_areas = models.TextField(
        blank=True,
        null=True
    )

    # --------------------------------------------------------
    # OVERALL ASSESSMENT
    # --------------------------------------------------------

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
        return (
            f"Peer Review - "
            f"{self.instructor}"
        )


# ============================================================
# 6. PROMOTION APPLICATION
# Appendix 3 - FORM A
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

    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name="promotion_applications"
    )

    # --------------------------------------------------------
    # PRESENT AND TARGET POSITION
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # APPENDIX 3 PERSONAL PARTICULARS
    # --------------------------------------------------------

    date_of_birth = models.DateField(
        blank=True,
        null=True
    )

    nationality = models.CharField(
        max_length=100,
        blank=True,
        null=True
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

    # --------------------------------------------------------
    # REQUIRED DOCUMENTS
    # --------------------------------------------------------

    cv = models.FileField(
        upload_to="promotion_documents/cv/",
        validators=[
            FileExtensionValidator(["pdf"])
        ],
        blank=True,
        null=True
    )

    promotion_application_form = models.FileField(
        upload_to="promotion_documents/application_forms/",
        validators=[
            FileExtensionValidator(["pdf"])
        ],
        blank=True,
        null=True
    )

    checklist_form = models.FileField(
        upload_to="promotion_documents/checklists/",
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

    # --------------------------------------------------------
    # WORKFLOW
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # RECOMMENDATIONS
    # --------------------------------------------------------

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

    committee_decision = models.TextField(
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

    # --------------------------------------------------------
    # POINT SUMMARY
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # DECLARATION
    # --------------------------------------------------------

    applicant_declaration = models.BooleanField(
        default=False
    )

    applicant_signature_date = models.DateField(
        blank=True,
        null=True
    )

    # --------------------------------------------------------
    # TIMESTAMPS
    # --------------------------------------------------------

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
            f"{self.employee.first_name} "
            f"{self.employee.last_name} -> "
            f"{self.targeted_title.title_name}"
        )


# ============================================================
# 7. PUBLICATION / PROMOTION MATERIAL
# Appendix 3 CHECKLIST
# ============================================================

class PromotionMaterial(models.Model):

    MATERIAL_TYPES = (
        ("JOURNAL_ARTICLE", "Journal Article"),
        ("BOOK_CHAPTER", "Chapter in a Book"),
        ("SCHOLARLY_BOOK", "Scholarly Book"),
        (
            "INTERNATIONAL_PROCEEDINGS",
            "Scholarly Paper in International Symposium/Conference"
        ),
        ("CASE_REPORT", "Case Report / Short Communication"),
        ("PATENT", "Patent"),
        ("CONSULTANCY_REPORT", "Consultancy Report"),
        ("CONFERENCE_PAPER", "Conference Paper"),
        ("EXTENSION_MATERIAL", "Extension Material"),
        ("LOWER_LEVEL_BOOK", "Lower-level Book"),
        ("DICTIONARY", "Subject / General Dictionary"),
        ("DICTIONARY_LETTER", "Letter in Dictionary"),
        ("BOOK_REVIEW", "Book Review"),
        ("JOURNAL_REVIEW", "Journal Article Review"),
    )

    application = models.ForeignKey(
        PromotionApplication,
        on_delete=models.CASCADE,
        related_name="promotion_materials"
    )

    reference_in_cv = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    material_type = models.CharField(
        max_length=50,
        choices=MATERIAL_TYPES
    )

    title = models.CharField(
        max_length=500
    )

    journal_title = models.CharField(
        max_length=300,
        blank=True,
        null=True
    )

    authors = models.TextField(
        blank=True,
        null=True
    )

    publication_year = models.PositiveIntegerField(
        blank=True,
        null=True
    )

    indexing = models.CharField(
        max_length=200,
        blank=True,
        null=True
    )

    reviewer_name = models.CharField(
        max_length=200,
        blank=True,
        null=True
    )

    points = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0
    )

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
        return self.title


# ============================================================
# 8. ACADEMIC MATERIAL REVIEW
# Appendix 4 - FORM C
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

    # --------------------------------------------------------
    # REVIEW CRITERIA
    # --------------------------------------------------------

    authenticity = models.TextField(
        blank=True,
        null=True
    )

    originality = models.TextField(
        blank=True,
        null=True
    )

    coverage_of_subject = models.TextField(
        blank=True,
        null=True
    )

    contribution_to_knowledge = models.TextField(
        blank=True,
        null=True
    )

    relevance_to_discipline = models.TextField(
        blank=True,
        null=True
    )

    presentation_quality = models.TextField(
        blank=True,
        null=True
    )

    technical_recommendation = models.TextField(
        blank=True,
        null=True
    )

    # --------------------------------------------------------
    # OVERALL RANKING
    # --------------------------------------------------------

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

    overall_quality = models.TextField(
        blank=True,
        null=True
    )

    strengths = models.TextField(
        blank=True,
        null=True
    )

    shortcomings = models.TextField(
        blank=True,
        null=True
    )

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
        return (
            f"Review - {self.material.title}"
        )


# ============================================================
# 9. APPEAL
# Appendix 5 - FORM D
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

    # --------------------------------------------------------
    # APPEAL DETAILS
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # APPEAL COMMITTEE
    # --------------------------------------------------------

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
        return (
            f"Appeal - "
            f"{self.applicant.first_name} "
            f"{self.applicant.last_name}"
        )


# ============================================================
# 10. PROMOTION HISTORY
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
        return (
            f"{self.employee} -> "
            f"{self.new_title.title_name}"
        )


# ============================================================
# 11. SYSTEM LOG
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
        return (
            f"{self.created_at} - "
            f"{self.action}"
        )


# ============================================================
# 12. REVIEWER ASSIGNMENT
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
        return (
            f"{self.reviewer} - "
            f"{self.application}"
        )


# ============================================================
# 13. DEFAULT PRIMARY KEY
# ============================================================

# Add this to settings.py instead if preferred:
#
# DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"