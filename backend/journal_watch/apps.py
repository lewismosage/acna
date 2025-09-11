from django.apps import AppConfig


class JournalWatchConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'journal_watch'
    verbose_name = 'Journal Watch Management'
    
    def ready(self):
        try:
            import journal_watch.signals
        except ImportError:
            pass