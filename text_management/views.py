from django.shortcuts import render
from django.template.response import TemplateResponse
from django.views.generic.detail import DetailView
from django.views.generic.list import ListView

from text_management.models import TextChunk
from text_management.utils import perform_search


class TextChunkListView(ListView):
    model = TextChunk
    context_object_name = "text_chunks"
    paginate_by = 25

    def get_queryset(self):
        """
        Optimize the queryset to fetch related metadata, title, language,
        authors, and publishers in a minimal number of queries.
        """
        queryset = super().get_queryset()

        # use `select_related` for `ForeignKey` and `OneToOneField` relationships
        # via SQL JOINs to fetch related objects in the same query
        queryset = queryset.select_related(
            "metadata", "metadata__title", "metadata__language"
        )

        # use `prefetch_related` for `ManyToManyField` relationships
        # which performs separate queries for related objects and
        # joins them in Python
        queryset = queryset.prefetch_related(
            "metadata__authors",
            "metadata__publishers",
        )

        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context


def home(request):
    context = {}
    original_objects = []
    search_results = []
    if query_string := request.GET.get("q", None):
        originals, search_results = perform_search(query_string=query_string)
        textchunk_ids = [obj.pk for obj in originals if isinstance(obj, TextChunk)]

        original_objects = (
            TextChunk.objects.filter(pk__in=textchunk_ids)
            .select_related(
                "metadata",
                "metadata__title",
                "metadata__language",
            )
            .prefetch_related(
                "metadata_authors",
                "metadata__publishers",
            )
        )

    context["original_objects"] = original_objects
    context["search_results"] = search_results
    context["query"] = query_string

    return render(
        request,
        "text_management/home.html",
        context=context,
    )


class TextChunkDetailView(DetailView):
    model = TextChunk
    context_object_name = "text_chunk"
    template_name = "text_management/textchunk_detail.html"
