from django.contrib import admin

from text_management.models import (
    Author,
    Language,
    Publisher,
    SearchIndex,
    TextChunk,
    TextChunkMetadata,
    Title,
)


@admin.register(SearchIndex)
class SearchIndexAdmin(admin.ModelAdmin):
    model = SearchIndex


class TextChunkMetadataInline(admin.StackedInline):
    model = TextChunkMetadata
    fk_name = "text_chunk"  # link via the ForeignKey field
    can_delete = False
    max_num = 1
    extra = 0
    fields = [
        "edition",
        "publish_date",
        "publication_status",
        "identifier",
        "title",
        "language",
        "authors",
        "publishers",
    ]
    readonly_fields = (
        "publish_date",
        "publication_status",
    )


@admin.register(TextChunk)
class TextChunkAdmin(admin.ModelAdmin):
    # list_select_related = ("metadata",)
    inlines = [
        TextChunkMetadataInline,
    ]
    list_display = (
        "id",
        "text",
        "publish_date",
        # "status",
    )

    @admin.display(description="Publish Date")
    def publish_date(self, obj):
        meta = getattr(obj, "textchunkmetadata", None)
        return meta.publish_date if meta else "-"

    @admin.display(description="Publication Status")
    def status(self, obj):
        meta = getattr(obj, "textchunkmetadata", None)
        return meta.publication_status if meta else "-"


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
