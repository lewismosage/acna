from django.apps import AppConfig

class PatientResourcesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'patient_resources'
    verbose_name = 'Patient Resources Management'
    
    def ready(self):
        try:
            import patient_resources.signals
        except ImportError:
            pass