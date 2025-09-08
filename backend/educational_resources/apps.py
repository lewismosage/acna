from django.apps import AppConfig

class EducationalResourcesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'educational_resources'
    verbose_name = 'Educational Resources Management'
    
    def ready(self):
        try:
            import educational_resources.signals
        except ImportError:
            pass