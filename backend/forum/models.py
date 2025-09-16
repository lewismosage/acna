from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.validators import MinLengthValidator


class ForumCategory(models.Model):
    """Model for forum categories like General Discussion, Case Studies, etc."""
    
    CATEGORY_COLORS = [
        ('blue', 'Blue'),
        ('green', 'Green'),
        ('purple', 'Purple'),
        ('orange', 'Orange'),
        ('teal', 'Teal'),
        ('red', 'Red'),
    ]
    
    CATEGORY_ICONS = [
        ('MessageSquare', 'Message Square'),
        ('Users', 'Users'),
        ('Star', 'Star'),
        ('TrendingUp', 'Trending Up'),
        ('Calendar', 'Calendar'),
        ('MessageCircle', 'Message Circle'),
    ]
    
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, max_length=200)
    description = models.TextField()
    icon = models.CharField(max_length=50, choices=CATEGORY_ICONS, default='MessageSquare')
    color = models.CharField(max_length=20, choices=CATEGORY_COLORS, default='blue')
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Forum Categories"
        ordering = ['order', 'title']
    
    def __str__(self):
        return self.title
    
    @property
    def thread_count(self):
        return self.forum_threads.filter(is_active=True).count()
    
    @property
    def post_count(self):
        return ForumPost.objects.filter(
            thread__category=self,
            thread__is_active=True,
            is_active=True
        ).count()
    
    @property
    def last_post(self):
        return ForumPost.objects.filter(
            thread__category=self,
            thread__is_active=True,
            is_active=True
        ).order_by('-created_at').first()


class ForumThread(models.Model):
    """Model for forum threads/topics"""
    
    category = models.ForeignKey(
        ForumCategory, 
        on_delete=models.CASCADE, 
        related_name='forum_threads'
    )
    title = models.CharField(max_length=300, validators=[MinLengthValidator(5)])
    slug = models.SlugField(max_length=300, unique=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='forum_threads')
    content = models.TextField(validators=[MinLengthValidator(10)])
    
    # Thread settings
    is_pinned = models.BooleanField(default=False)
    is_locked = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    # Engagement metrics
    view_count = models.PositiveIntegerField(default=0)
    like_count = models.PositiveIntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_activity = models.DateTimeField(auto_now_add=True)
    
    # Tags for better categorization
    tags = models.JSONField(default=list, blank=True)
    
    class Meta:
        ordering = ['-is_pinned', '-last_activity']
        indexes = [
            models.Index(fields=['-last_activity']),
            models.Index(fields=['category', '-created_at']),
            models.Index(fields=['author']),
        ]
    
    def __str__(self):
        return self.title
    
    @property
    def reply_count(self):
        return self.forum_posts.filter(is_active=True).count()
    
    @property
    def last_post(self):
        return self.forum_posts.filter(is_active=True).order_by('-created_at').first()
    
    @property
    def has_new_replies(self):
        """Check if there are new replies in the last 24 hours"""
        yesterday = timezone.now() - timezone.timedelta(days=1)
        return self.forum_posts.filter(
            created_at__gte=yesterday,
            is_active=True
        ).exists()
    
    def increment_view_count(self):
        """Increment view count atomically"""
        ForumThread.objects.filter(id=self.id).update(view_count=models.F('view_count') + 1)
        self.refresh_from_db(fields=['view_count'])
    
    def update_last_activity(self):
        """Update last activity timestamp"""
        self.last_activity = timezone.now()
        self.save(update_fields=['last_activity'])


class ForumPost(models.Model):
    """Model for forum posts/replies"""
    
    thread = models.ForeignKey(
        ForumThread, 
        on_delete=models.CASCADE, 
        related_name='forum_posts'
    )
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='forum_posts')
    content = models.TextField(validators=[MinLengthValidator(5)])
    
    # Reply functionality
    parent_post = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='replies'
    )
    
    # Engagement
    like_count = models.PositiveIntegerField(default=0)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_edited = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['thread', 'created_at']),
            models.Index(fields=['author']),
        ]
    
    def __str__(self):
        return f"Post by {self.author.get_full_name() or self.author.username} in {self.thread.title}"
    
    @property
    def reply_count(self):
        return self.replies.filter(is_active=True).count()
    
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        # Update thread's last activity when a new post is created
        if is_new:
            self.thread.update_last_activity()


class ForumPostLike(models.Model):
    """Model to track post likes"""
    
    post = models.ForeignKey(
        ForumPost, 
        on_delete=models.CASCADE, 
        related_name='likes'
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['post', 'user']
        indexes = [
            models.Index(fields=['post']),
            models.Index(fields=['user']),
        ]
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update the like count on the post
        self.post.like_count = self.post.likes.count()
        self.post.save(update_fields=['like_count'])
    
    def delete(self, *args, **kwargs):
        post = self.post
        super().delete(*args, **kwargs)
        # Update the like count on the post
        post.like_count = post.likes.count()
        post.save(update_fields=['like_count'])


class ForumThreadLike(models.Model):
    """Model to track thread likes"""
    
    thread = models.ForeignKey(
        ForumThread, 
        on_delete=models.CASCADE, 
        related_name='likes'
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['thread', 'user']
        indexes = [
            models.Index(fields=['thread']),
            models.Index(fields=['user']),
        ]
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update the like count on the thread
        self.thread.like_count = self.thread.likes.count()
        self.thread.save(update_fields=['like_count'])
    
    def delete(self, *args, **kwargs):
        thread = self.thread
        super().delete(*args, **kwargs)
        # Update the like count on the thread
        thread.like_count = thread.likes.count()
        thread.save(update_fields=['like_count'])


class ForumThreadSubscription(models.Model):
    """Model to track thread subscriptions for notifications"""
    
    thread = models.ForeignKey(
        ForumThread, 
        on_delete=models.CASCADE, 
        related_name='subscriptions'
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['thread', 'user']
        indexes = [
            models.Index(fields=['user', 'is_active']),
        ]