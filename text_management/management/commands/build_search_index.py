from django.core.management.base import BaseCommand
from django.db import transaction

from text_management.models import (
    Author,
    Language,
    Publisher,
    SearchIndex,
    TextChunk,
    TextChunkMetadata,
    Title,
)
from text_management.signals import update_search_index


class Command(BaseCommand):
    help = "(Re)Builds the search index from existing data."

    def handle(self, *args, **options):
        self.stdout.write("Clearing existing search index...")
        SearchIndex.objects.all().delete()

        indexed_models = [
            Author,
            Language,
            Publisher,
            TextChunk,
            TextChunkMetadata,
            Title,
        ]

        self.stdout.write("Populating search index...")

        with transaction.atomic():
            for model in indexed_models:
                model_name = model.__name__
                self.stdout.write(f"Indexing {model_name}...")
                count = 0
                for instance in model.objects.all():
                    update_search_index(instance)
                    count += 1
                self.stdout.write(f"Indexed {count} {model_name} objects.")

        self.stdout.write(self.style.SUCCESS("Search index (re)built successfully."))
