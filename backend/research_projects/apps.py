from django.apps import AppConfig


class ResearchProjectsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'research_projects'
    verbose_name = 'Research Projects Management'
    
    def ready(self):
        try:
            import research_projects.signals
        except ImportError:
            pass