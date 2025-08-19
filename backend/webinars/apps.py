from django.apps import AppConfig

class WebinarsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'webinars'
    verbose_name = 'Webinar Management'
    
    def ready(self):
        # Import signals if you plan to add them later
        try:
            import webinars.signals
        except ImportError:
            pass