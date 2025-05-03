from django.contrib.contenttypes.models import ContentType
from django.contrib.postgres.search import SearchHeadline, SearchQuery, SearchRank
from django.db.models import Case, F, When

from text_management.models import SearchIndex, TextChunk


def perform_search(query_string: str, language: str = "english"):
    """
    Performs a full-text search against the SearchIndex model,
    annotates with rank and highlighted text for TextChunk results.
    Returns a list of original objects and the annotated SearchIndex result objects.
    """
    # Use websearch_to_tsquery for more flexible user input (handles quotes, AND, OR, NOT)
    # You might want to add language config here if needed
    search_query = SearchQuery(query_string, search_type="websearch", config=language)

    try:
        textchunk_content_type = ContentType.objects.get_for_model(TextChunk)
    except ContentType.DoesNotExist as e:
        print(e.with_traceback())
        return [], []

    # Prefetch the content_object using prefetch_related.
    # This is crucial for avoiding N+1 queries when accessing .content_object later.
    # We can specify the queryset for the prefetch to also select_related/prefetch_related
    # the necessary fields on the TextChunk itself if needed for the original_objects list.
    # However, since the home view re-fetches and optimizes TextChunk,
    # prefetching just the content_object here is sufficient to avoid N+1 on the SearchIndex results.

    queryset = (
        SearchIndex.objects.filter(content_type=textchunk_content_type)
        .select_related("content_type")
        .prefetch_related("content_object")
        .annotate(
            rank=SearchRank(F("search_vector"), query=search_query),
            highlighted_text=Case(
                When(
                    content_type=textchunk_content_type,
                    then=SearchHeadline(
                        "text_content",
                        search_query,
                        config=language,
                    ),
                ),
                default=F("text_content"),
            ),
        )
    )

    results = queryset.filter(search_vector=search_query).order_by("-rank")

    original_objects = [item.content_object for item in results if item.content_object]

    return original_objects, results
