from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.contrib.postgres.indexes import GinIndex
from django.contrib.postgres.search import SearchVectorField
from django.db import models


class SearchIndex(models.Model):
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
    )
    content_object = GenericForeignKey("content_type", "object_id")
    object_id = models.PositiveBigIntegerField()

    # to store the combined text for vectorization
    text_content = models.TextField()

    search_vector = SearchVectorField(null=True)

    class Meta:
        unique_together = "content_type", "object_id"
        verbose_name = "Search index"
        verbose_name_plural = "Search indices"
        indexes = [
            GinIndex(
                fields=["search_vector"],
                name="search_vector_gin_idx",
            ),
        ]

    def __str__(self):
        return f"Index for {self.content_type} ID {self.object_id}"


class TextChunk(models.Model):
    text = models.TextField(unique=True)

    def __str__(self):
        return self.text[:50] + ("..." if len(self.text) > 50 else "")

    def __len__(self) -> int:
        return len(self.text)


class Author(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(
        max_length=50,
        blank=True,
        null=True,
    )
    alternate_name = models.CharField(
        max_length=200,
        blank=True,
        null=True,
    )

    @property
    def name(self) -> str:
        return (
            f"{self.last_name}, {self.first_name}"
            if self.last_name
            else self.first_name
        )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["first_name", "last_name"],
                name="unique_first_last_names",
            )
        ]

    def __str__(self):
        return self.name


class Title(models.Model):
    title = models.CharField(
        max_length=100,
        unique=True,
    )

    def __str__(self):
        return self.title


class Publisher(models.Model):
    name = models.CharField(
        max_length=50,
        unique=True,
    )

    def __str__(self):
        return self.name


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


class PublicationStatusChoices(models.TextChoices):
    DRAFT = "draft", "Draft"
    PUBLISHED = "published", "Published"
    ARCHIVED = "archived", "Archived"
    UNKNOWN = "unknown", "Unknown"


class TextChunkMetadata(models.Model):
    edition = models.CharField(
        max_length=50,
        blank=True,
        null=True,
    )
    publish_date = models.DateField(
        blank=True,
        null=True,
    )
    publication_status = models.CharField(
        max_length=20,
        choices=PublicationStatusChoices.choices,
        default=PublicationStatusChoices.PUBLISHED,
        blank=True,
    )
    identifier = models.CharField(
        help_text="Unique identifier, such as an ISBN, DOI, custom ID, etc.",
        max_length=100,
        blank=True,
        null=True,
    )

    authors = models.ManyToManyField(
        Author,
        blank=True,
    )
    title = models.ForeignKey(
        Title,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )
    text_chunk = models.OneToOneField(
        TextChunk,
        on_delete=models.CASCADE,
        related_name="metadata",
        blank=True,
        null=True,
    )
    publishers = models.ManyToManyField(
        Publisher,
        blank=True,
    )
    language = models.ForeignKey(
        Language,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )

    class Meta:
        verbose_name = "Text chunks metadata"
        verbose_name_plural = "Text chunks metadata"

    def __str__(self):
        if self.title:
            return self.title.title
        elif self.identifier:
            return self.identifier
        return f"Metadata for TextChunk ID {self.id}"
