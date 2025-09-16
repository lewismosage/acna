from django.apps import AppConfig


class ForumConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'forum'
    verbose_name = 'Forum Management'
    
    def ready(self):
        """Import signals when the app is ready"""
        try:
            import forum.signals
        except ImportError:
            pass