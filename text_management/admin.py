from django.contrib import admin
from text_management.models import TextChunk, TextChunkMetadata

from .models import Author, Language, Publisher, TextChunk, TextChunkMetadata, Title


@admin.register(TextChunk)
class TextChunkAdmin(admin.ModelAdmin):
    list_display = ("id", "text")
    search_fields = ("text",)


@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    list_display = ("first_name", "last_name", "alternate_name")
    search_fields = ("first_name", "last_name", "alternate_name")


@admin.register(Title)
class TitleAdmin(admin.ModelAdmin):
    list_display = ("title",)
    search_fields = ("title",)


@admin.register(Publisher)
class PublisherAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(Language)
class LanguageAdmin(admin.ModelAdmin):
    list_display = ("name", "code")
    search_fields = ("name", "code")


@admin.register(TextChunkMetadata)
class TextChunkMetadataAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "get_title",
        "edition",
        "publish_date",
        "publication_status",
        "identifier",
    )
    search_fields = ("identifier",)
    list_filter = ("publication_status", "publish_date")

    def get_title(self, obj):
        return obj.title.title if obj.title else None

    get_title.short_description = "Title"
