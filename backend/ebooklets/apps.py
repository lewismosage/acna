from django.apps import AppConfig

class EbookletsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ebooklets'
    verbose_name = 'E-Booklets Management'
    
    def ready(self):
        try:
            import ebooklets.signals
        except ImportError:
            pass