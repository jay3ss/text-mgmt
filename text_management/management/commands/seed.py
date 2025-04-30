import random

from django.core.management.base import BaseCommand
from faker import Faker

from text_management.models import (
    Author,
    Language,
    Publisher,
    TextChunk,
    TextChunkMetadata,
    Title,
)

fake = Faker()


class Command(BaseCommand):
    help = "Seed the database with fake data"

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Seeding data..."))

        authors = [
            Author.objects.create(
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                alternate_name=fake.name() if random.choice([True, False]) else None,
            )
            for _ in range(100)
        ]

        publishers = [Publisher.objects.create(name=fake.company()) for _ in range(50)]

        titles_set = []
        while len(titles_set) < 100:
            title = fake.sentence(nb_words=4).rstrip(".")
            if title not in titles_set:
                titles_set.append(title)

        titles = [Title.objects.create(title=title) for title in titles_set]

        language = Language.objects.filter(code="en").first()

        for _ in range(200):
            text_content = fake.text(max_nb_chars=500)
            text_chunk = TextChunk.objects.create(text=text_content)

            metadata = TextChunkMetadata.objects.create(
                edition=f"Edition {random.randint(1, 5)}",
                publish_date=fake.date_between(start_date="-5y", end_date="today"),
                publication_status=random.choice(
                    ["draft", "published", "archived", "unknown"]
                ),
                identifier=fake.isbn13(),
                text_chunk=text_chunk,
                title=random.choices(titles)[0],
                language=language,
            )

            metadata.authors.add(
                *random.sample(authors, k=random.randint(15, len(authors)))
            )
            metadata.publishers.add(
                *random.sample(publishers, k=random.randint(7, len(publishers)))
            )

        self.stdout.write(self.style.SUCCESS("✅ Done seeding!"))
