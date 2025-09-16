from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import ForumPost, ForumThread, ForumThreadSubscription

User = get_user_model()


@receiver(post_save, sender=ForumPost)
def update_thread_activity_on_post_save(sender, instance, created, **kwargs):
    """Update thread's last activity when a post is created or updated"""
    if created:  # Only for new posts
        instance.thread.update_last_activity()
        
        # Auto-subscribe thread author to their own thread
        if instance.author == instance.thread.author:
            ForumThreadSubscription.objects.get_or_create(
                thread=instance.thread,
                user=instance.author,
                defaults={'is_active': True}
            )


@receiver(post_save, sender=ForumThread)
def auto_subscribe_thread_creator(sender, instance, created, **kwargs):
    """Auto-subscribe thread creator to their own thread"""
    if created:
        ForumThreadSubscription.objects.get_or_create(
            thread=instance,
            user=instance.author,
            defaults={'is_active': True}
        )


@receiver(post_delete, sender=ForumPost)
def update_thread_activity_on_post_delete(sender, instance, **kwargs):
    """Update thread's last activity when a post is deleted"""
    if instance.thread_id:  # Check if thread still exists
        try:
            thread = ForumThread.objects.get(id=instance.thread_id)
            thread.update_last_activity()
        except ForumThread.DoesNotExist:
            pass