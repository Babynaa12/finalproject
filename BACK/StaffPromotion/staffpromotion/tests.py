from django.test import RequestFactory, TestCase, override_settings
from rest_framework.test import APIClient

from .models import Department, Employee, JobTitle, PromotionApplication, PromotionNotification
from .views import _filter_queryset_for_user, create_application_notification


@override_settings(
    DATABASES={
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": ":memory:",
        }
    }
)
class PromotionApplicationWorkflowCompletionTests(TestCase):
    def test_completion_flags_follow_workflow_status_not_record_existence(self):
        department = Department.objects.create(department_name="Computer Science")
        title = JobTitle.objects.create(title_name="Senior Lecturer")

        employee = Employee.objects.create_user(
            username="staff_user",
            email="staff@example.com",
            first_name="Staff",
            last_name="Member",
            password="Passw0rd!",
            role="STAFF",
            department=department,
        )
        reviewer = Employee.objects.create_user(
            username="reviewer_user",
            email="reviewer@example.com",
            first_name="Reviewer",
            last_name="User",
            password="Passw0rd!",
            role="REVIEWER",
            department=department,
        )

        application = PromotionApplication.objects.create(
            employee=employee,
            full_name="Staff Member",
            current_title=title,
            targeted_title=title,
        )

        self.assertFalse(application.reviewer_stage_completed)
        self.assertFalse(application.student_evaluation_stage_completed)
        self.assertFalse(application.ready_for_committee)

        application.assigned_reviewer = reviewer
        application.status = "COMMITTEE_REVIEW"
        application.save()

        self.assertTrue(application.reviewer_stage_completed)
        self.assertTrue(application.student_evaluation_stage_completed)
        self.assertTrue(application.ready_for_committee)

    def test_pending_application_is_visible_to_role_owners(self):
        department = Department.objects.create(department_name="Engineering")
        title = JobTitle.objects.create(title_name="Associate Professor")

        staff = Employee.objects.create_user(
            username="staff_member",
            email="staff.member@example.com",
            first_name="Staff",
            last_name="Member",
            password="Passw0rd!",
            role="STAFF",
            department=department,
        )
        hod = Employee.objects.create_user(
            username="hod_user",
            email="hod@example.com",
            first_name="Head",
            last_name="OfDepartment",
            password="Passw0rd!",
            role="HOD",
            department=department,
        )
        dean = Employee.objects.create_user(
            username="dean_user",
            email="dean@example.com",
            first_name="Dean",
            last_name="User",
            password="Passw0rd!",
            role="DEAN",
            department=department,
        )
        reviewer = Employee.objects.create_user(
            username="reviewer_user_2",
            email="reviewer2@example.com",
            first_name="Reviewer",
            last_name="Two",
            password="Passw0rd!",
            role="REVIEWER",
            department=department,
        )
        student = Employee.objects.create_user(
            username="student_user",
            email="student@example.com",
            first_name="Student",
            last_name="User",
            password="Passw0rd!",
            role="STUDENT",
            department=department,
        )

        application = PromotionApplication.objects.create(
            employee=staff,
            full_name="Staff Member",
            current_title=title,
            targeted_title=title,
            hod=hod,
            dean=dean,
            assigned_reviewer=reviewer,
            status="SUBMITTED",
        )
        student_application = PromotionApplication.objects.create(
            employee=student,
            full_name="Student User",
            current_title=title,
            targeted_title=title,
            hod=hod,
            dean=dean,
            assigned_reviewer=reviewer,
            status="SUBMITTED",
        )

        factory = RequestFactory()
        for role_user in [staff, hod, dean, reviewer]:
            request = factory.get("/applications/")
            request.user = role_user
            visible = _filter_queryset_for_user(
                PromotionApplication,
                PromotionApplication.objects.all(),
                request,
            )
            self.assertIn(application, visible)

        request = factory.get("/applications/")
        request.user = student
        visible = _filter_queryset_for_user(
            PromotionApplication,
            PromotionApplication.objects.all(),
            request,
        )
        self.assertIn(student_application, visible)
        self.assertNotIn(application, visible)

    def test_stage_updates_create_notification_for_staff(self):
        department = Department.objects.create(department_name="Health Sciences")
        title = JobTitle.objects.create(title_name="Professor")
        staff = Employee.objects.create_user(
            username="staff_notify",
            email="notify.staff@example.com",
            first_name="Staff",
            last_name="User",
            password="Passw0rd!",
            role="STAFF",
            department=department,
        )
        application = PromotionApplication.objects.create(
            employee=staff,
            full_name="Staff User",
            current_title=title,
            targeted_title=title,
            status="SUBMITTED",
        )

        create_application_notification(
            application,
            notification_type="HOD_REVIEW",
            title="HOD review started",
            message="Your promotion application is now under HOD review.",
            status="HOD_REVIEW",
        )

        self.assertTrue(
            PromotionNotification.objects.filter(
                employee=staff,
                application=application,
                notification_type="HOD_REVIEW",
            ).exists()
        )

    def test_notification_read_endpoint_marks_notification_as_read(self):
        department = Department.objects.create(department_name="Humanities")
        title = JobTitle.objects.create(title_name="Associate Professor")
        staff = Employee.objects.create_user(
            username="staff_read",
            email="read.staff@example.com",
            first_name="Staff",
            last_name="Reader",
            password="Passw0rd!",
            role="STAFF",
            department=department,
        )
        application = PromotionApplication.objects.create(
            employee=staff,
            full_name="Staff Reader",
            current_title=title,
            targeted_title=title,
            status="SUBMITTED",
        )
        notification = create_application_notification(
            application,
            notification_type="GENERAL",
            title="New update",
            message="Your promotion application has been updated.",
            status="SUBMITTED",
        )

        client = APIClient()
        client.force_authenticate(user=staff)

        response = client.patch(f"/api/notifications/{notification.id}/")

        self.assertEqual(response.status_code, 200)
        notification.refresh_from_db()
        self.assertTrue(notification.is_read)
        self.assertIsNotNone(notification.read_at)

    def test_notification_read_alias_endpoint_marks_notification_as_read(self):
        department = Department.objects.create(department_name="Languages")
        title = JobTitle.objects.create(title_name="Senior Lecturer")
        staff = Employee.objects.create_user(
            username="staff_read_alias",
            email="alias.read.staff@example.com",
            first_name="Staff",
            last_name="Alias",
            password="Passw0rd!",
            role="STAFF",
            department=department,
        )
        application = PromotionApplication.objects.create(
            employee=staff,
            full_name="Staff Alias",
            current_title=title,
            targeted_title=title,
            status="SUBMITTED",
        )
        notification = create_application_notification(
            application,
            notification_type="GENERAL",
            title="Alias update",
            message="This notification is marked read via the alias route.",
            status="SUBMITTED",
        )

        client = APIClient()
        client.force_authenticate(user=staff)

        response = client.post(f"/api/notifications/{notification.id}/read/")

        self.assertEqual(response.status_code, 200)
        notification.refresh_from_db()
        self.assertTrue(notification.is_read)
