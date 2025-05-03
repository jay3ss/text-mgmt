from django.contrib.contenttypes.models import ContentType
from django.contrib.postgres.search import SearchVector
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from text_management.models import (
    Author,
    Language,
    Publisher,
    SearchIndex,
    TextChunk,
    TextChunkMetadata,
    Title,
)


def update_search_index(instance):
    content_type = ContentType.objects.get_for_model(instance)
    index_entry, _ = SearchIndex.objects.get_or_create(
        content_type=content_type,
        object_id=instance.pk,
        defaults={"text_content": ""},
    )

    combined_text = ""
    language_config = "english"

    # combine the text from the instance based on type
    if isinstance(instance, TextChunk):
        combined_text = instance.text
    elif isinstance(instance, Author):
        combined_text = f"{instance.first_name} {instance.last_name or ''} {instance.alternate_name or ''}"
    elif isinstance(instance, Title):
        combined_text = instance.title
    elif isinstance(instance, Publisher):
        combined_text = instance.name
    elif isinstance(instance, Language):
        combined_text = f"{instance.name} {instance.code}".strip()
    elif isinstance(instance, TextChunkMetadata):
        text_parts = []
        if instance.title:
            text_parts.append(instance.title.title)
        if instance.identifier:
            text_parts.append(instance.identifier)
        if instance.edition:
            text_parts.append(instance.edition)
        if instance.language and instance.language.name:
            language_config = instance.language.name.lower()

        for author in instance.authors.all():
            text_parts.append(
                f"{author.first_name} {author.last_name or ''} {author.alternate_name or ''}"
            )

        for publisher in instance.publishers.all():
            text_parts.append(publisher.name)

        if instance.text_chunk:
            text_parts.append(instance.text_chunk.text)

        combined_text = " ".join(filter(None, text_parts))

    index_entry.text_content = combined_text
    index_entry.save()

    SearchIndex.objects.filter(pk=index_entry.pk).update(
        search_vector=SearchVector("text_content", config=language_config)
    )


# signal handlers
@receiver(post_save, sender=TextChunk)
def textchunk_post_save(sender, instance, **kwargs):
    update_search_index(instance=instance)
    if hasattr(instance, "metadata"):
        update_search_index(instance=instance.metadata)


@receiver(post_delete, sender=TextChunk)
def textchunk_post_delete(sender, instance, **kwargs):
    ContentType.objects.get_for_model(instance).searchindex_set.filter(
        object_id=instance.pk
    ).delete()


@receiver(post_save, sender=Author)
def author_post_save(sender, instance, **kwargs):
    update_search_index(instance=instance)

    for metadata in instance.textchunkmetadata_set.all():
        update_search_index(metadata)


@receiver(post_delete, sender=Author)
def author_post_delete(sender, instance, **kwargs):
    ContentType.objects.get_for_model(instance).searchindex_set.filter(
        object_id=instance.pk
    ).delete()


@receiver(post_save, sender=Title)
def title_post_save(sender, instance, **kwargs):
    update_search_index(instance=instance)
    for metadata in instance.textchunkmetadata_set.all():
        update_search_index(instance=metadata)


@receiver(post_delete, sender=Title)
def title_post_delete(sender, instance, **kwargs):
    ContentType.objects.get_for_model(instance).searchindex_set.filter(
        object_id=instance.pk
    ).delete()
    metadata_to_update = list(instance.textchunkmetadata_set.all())
    for metadata in metadata_to_update:
        update_search_index(metadata)


@receiver(post_save, sender=Publisher)
def publisher_post_save(sender, instance, **kwargs):
    update_search_index(instance=instance)
    for metadata in instance.textchunkmetadata_set.all():
        update_search_index(metadata)


@receiver(post_delete, sender=Publisher)
def publisher_post_delete(sender, instance, **kwargs):
    ContentType.objects.get_for_model(instance).searchindex_set.filter(
        object_id=instance.pk
    ).delete()

    metadata_to_update = list(instance.textchunkmetadata_set.all())
    for metadata in metadata_to_update:
        update_search_index(metadata)


@receiver(post_save, sender=Language)
def language_post_save(sender, instance, **kwargs):
    update_search_index(instance=instance)
    for metadata in instance.textchunkmetadata_set.all():
        update_search_index(metadata)


@receiver(post_delete, sender=Language)
def language_post_delete(sender, instance, **kwargs):
    ContentType.objects.get_for_model(instance).searchindex_set.filter(
        object_id=instance.pk
    ).delete()

    metadata_to_update = list(instance.textchunkmetadata_set.all())
    for metadata in metadata_to_update:
        update_search_index(metadata)


@receiver(post_save, sender=TextChunkMetadata)
def textchunkmetadata_post_save(sender, instance, **kwargs):
    update_search_index(instance=instance)


@receiver(post_delete, sender=TextChunkMetadata)
def textchunkmetadata_post_delete(sender, instance, **kwargs):
    ContentType.objects.get_for_model(instance).searchindex_set.filter(
        object_id=instance.pk
    ).delete()
