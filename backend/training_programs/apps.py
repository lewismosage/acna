from django.apps import AppConfig


class TrainingProgramsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'training_programs'
    verbose_name = 'Training Programs'
    
    def ready(self):
        """Import signals when the app is ready"""
        try:
            import training_programs.signals
        except ImportError:
            pass