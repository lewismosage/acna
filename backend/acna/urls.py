from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/newsletter/', include('subscriptions.urls')),
    path('api/', include('news.urls')),
    path('gallery/', include('gallery.urls')),
    path('api/', include('conferences.urls')),
    path('api/', include('webinars.urls')),
    path('api/awards/', include('awards.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)