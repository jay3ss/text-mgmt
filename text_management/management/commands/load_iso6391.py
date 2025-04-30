import pycountry
from django.core.management.base import BaseCommand
from text_management.models import Language


class Command(BaseCommand):
    help = "Load all ISO 639-1 languages into the Language model"

    def handle(self, *args, **options):
        Language.objects.all().delete()
        for lang in pycountry.languages:
            code = getattr(lang, "alpha_2", None)
            if code:
                Language.objects.create(code=code, name=lang.name)
                self.stdout.write(self.style.SUCCESS("Loaded ISO 639-1 languages."))
