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
    path('api/', include('abstracts.urls')),
    path('api/', include('workshops.urls')),
    path('api/', include('patient_resources.urls')),
    path('api/', include('ebooklets.urls')),
    path('api/', include('publications.urls')),
    path('api/', include('research_projects.urls')),
    path('api/', include('educational_resources.urls')),
    path('api/', include('journal_watch.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)