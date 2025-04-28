from django.db import models


class Language(models.Model):
    name = models.CharField(
        max_length=200,
        help_text="English name of the language, e.g. 'English', 'German', 'French'",
    )
    code = models.CharField(
        max_length=2,
        unique=True,
        help_text="ISO 639-1 two-letter code, e.g. 'en', 'de', 'fr'",
    )

    def __str__(self) -> str:
        return f"{self.name} ({self.code})"
