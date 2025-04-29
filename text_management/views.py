from django.http import JsonResponse
from text_management.models import TextChunk


def textchunks_index(request):
    text_chunks = TextChunk.objects.all()
    filtered_data = [dict(text=chunk.text) for chunk in text_chunks]
    return JsonResponse(data=filtered_data, safe=False)
