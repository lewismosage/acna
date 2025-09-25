# careers/apps.py
from django.apps import AppConfig


class CareersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'careers'
    verbose_name = 'Careers Management'
    
    def ready(self):
        # Import signal handlers if any
        # import careers.signals
        pass