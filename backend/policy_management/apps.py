from django.apps import AppConfig


class PolicyManagementConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'policy_management'
    verbose_name = 'Policy & Position Management'
    
    def ready(self):
        """
        Perform initialization when Django starts
        """
        try:
            # Import any signal handlers if needed
            import policy_management.signals
        except ImportError:
            pass