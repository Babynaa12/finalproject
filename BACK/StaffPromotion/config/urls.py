from django.contrib import admin
from django.urls import path, include
from staffpromotion.views import MyTokenObtainPairView

urlpatterns = [
    path('admin/', admin.site.urls),

    # JWT LOGIN
    path('api/auth/login/', MyTokenObtainPairView.as_view(), name='login'),

    # APP ROUTES
    path('api/', include('staffpromotion.urls')),
]