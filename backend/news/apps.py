# news/apps.py
from django.apps import AppConfig


class NewsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'news'
    verbose_name = 'News Management'
    
    def ready(self):
        # Import signals if you plan to add them later
        try:
            import news.signals
        except ImportError:
            pass