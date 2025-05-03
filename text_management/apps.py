from django.apps import AppConfig


class TextManagementConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "text_management"

    def ready(self):
        import text_management.signals
