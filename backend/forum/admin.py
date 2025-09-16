from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import (
    ForumCategory, ForumThread, ForumPost,
    ForumPostLike, ForumThreadLike, ForumThreadSubscription
)


@admin.register(ForumCategory)
class ForumCategoryAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'slug', 'icon', 'color', 'thread_count_display', 
        'post_count_display', 'order', 'is_active', 'created_at'
    ]
    list_filter = ['is_active', 'color', 'icon', 'created_at']
    search_fields = ['title', 'description']
    prepopulated_fields = {'slug': ('title',)}
    ordering = ['order', 'title']
    list_editable = ['order', 'is_active']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'description')
        }),
        ('Appearance', {
            'fields': ('icon', 'color')
        }),
        ('Settings', {
            'fields': ('is_active', 'order')
        })
    )
    
    def thread_count_display(self, obj):
        count = obj.thread_count
        if count:
            url = reverse('admin:forum_forumthread_changelist') + f'?category__id__exact={obj.id}'
            return format_html('<a href="{}">{} threads</a>', url, count)
        return '0 threads'
    thread_count_display.short_description = 'Threads'
    
    def post_count_display(self, obj):
        count = obj.post_count
        return f'{count} posts'
    post_count_display.short_description = 'Posts'


class ForumPostInline(admin.TabularInline):
    model = ForumPost
    extra = 0
    readonly_fields = ['author', 'created_at', 'like_count']
    fields = ['author', 'content', 'is_active', 'like_count', 'created_at']
    
    def has_add_permission(self, request, obj=None):
        return False


@admin.register(ForumThread)
class ForumThreadAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'author', 'category', 'reply_count_display', 'view_count',
        'like_count', 'is_pinned', 'is_locked', 'is_active', 'last_activity'
    ]
    list_filter = [
        'category', 'is_pinned', 'is_locked', 'is_active', 
        'created_at', 'last_activity'
    ]
    search_fields = ['title', 'content', 'author__username', 'author__email']
    readonly_fields = [
        'slug', 'view_count', 'like_count', 'reply_count_display',
        'created_at', 'updated_at', 'last_activity'
    ]
    prepopulated_fields = {'slug': ('title',)}
    list_editable = ['is_pinned', 'is_locked', 'is_active']
    date_hierarchy = 'created_at'
    inlines = [ForumPostInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'content', 'category', 'author')
        }),
        ('Settings', {
            'fields': ('is_pinned', 'is_locked', 'is_active', 'tags')
        }),
        ('Statistics', {
            'fields': ('view_count', 'like_count', 'reply_count_display'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'last_activity'),
            'classes': ('collapse',)
        })
    )
    
    def reply_count_display(self, obj):
        count = obj.reply_count
        if count:
            url = reverse('admin:forum_forumpost_changelist') + f'?thread__id__exact={obj.id}'
            return format_html('<a href="{}">{} replies</a>', url, count)
        return '0 replies'
    reply_count_display.short_description = 'Replies'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('author', 'category')
    
    actions = ['mark_as_pinned', 'mark_as_unpinned', 'mark_as_locked', 'mark_as_unlocked']
    
    def mark_as_pinned(self, request, queryset):
        updated = queryset.update(is_pinned=True)
        self.message_user(request, f'{updated} threads marked as pinned.')
    mark_as_pinned.short_description = 'Mark selected threads as pinned'
    
    def mark_as_unpinned(self, request, queryset):
        updated = queryset.update(is_pinned=False)
        self.message_user(request, f'{updated} threads unmarked as pinned.')
    mark_as_unpinned.short_description = 'Mark selected threads as unpinned'
    
    def mark_as_locked(self, request, queryset):
        updated = queryset.update(is_locked=True)
        self.message_user(request, f'{updated} threads marked as locked.')
    mark_as_locked.short_description = 'Mark selected threads as locked'
    
    def mark_as_unlocked(self, request, queryset):
        updated = queryset.update(is_locked=False)
        self.message_user(request, f'{updated} threads marked as unlocked.')
    mark_as_unlocked.short_description = 'Mark selected threads as unlocked'


@admin.register(ForumPost)
class ForumPostAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'thread_link', 'author', 'content_preview', 
        'like_count', 'reply_count_display', 'is_active', 'created_at'
    ]
    list_filter = ['is_active', 'created_at', 'thread__category']
    search_fields = ['content', 'author__username', 'thread__title']
    readonly_fields = ['like_count', 'reply_count_display', 'created_at', 'updated_at']
    raw_id_fields = ['thread', 'author', 'parent_post']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('thread', 'author', 'content', 'parent_post')
        }),
        ('Settings', {
            'fields': ('is_active', 'is_edited')
        }),
        ('Statistics', {
            'fields': ('like_count', 'reply_count_display'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def thread_link(self, obj):
        url = reverse('admin:forum_forumthread_change', args=[obj.thread.id])
        return format_html('<a href="{}">{}</a>', url, obj.thread.title[:50])
    thread_link.short_description = 'Thread'
    
    def content_preview(self, obj):
        return obj.content[:100] + '...' if len(obj.content) > 100 else obj.content
    content_preview.short_description = 'Content'
    
    def reply_count_display(self, obj):
        count = obj.reply_count
        if count:
            url = reverse('admin:forum_forumpost_changelist') + f'?parent_post__id__exact={obj.id}'
            return format_html('<a href="{}">{} replies</a>', url, count)
        return '0 replies'
    reply_count_display.short_description = 'Replies'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('author', 'thread', 'parent_post')


@admin.register(ForumPostLike)
class ForumPostLikeAdmin(admin.ModelAdmin):
    list_display = ['id', 'post_link', 'user', 'created_at']
    list_filter = ['created_at']
    search_fields = ['post__content', 'user__username']
    raw_id_fields = ['post', 'user']
    date_hierarchy = 'created_at'
    
    def post_link(self, obj):
        url = reverse('admin:forum_forumpost_change', args=[obj.post.id])
        content_preview = obj.post.content[:50] + '...' if len(obj.post.content) > 50 else obj.post.content
        return format_html('<a href="{}">{}</a>', url, content_preview)
    post_link.short_description = 'Post'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('post', 'user')


@admin.register(ForumThreadLike)
class ForumThreadLikeAdmin(admin.ModelAdmin):
    list_display = ['id', 'thread_link', 'user', 'created_at']
    list_filter = ['created_at']
    search_fields = ['thread__title', 'user__username']
    raw_id_fields = ['thread', 'user']
    date_hierarchy = 'created_at'
    
    def thread_link(self, obj):
        url = reverse('admin:forum_forumthread_change', args=[obj.thread.id])
        return format_html('<a href="{}">{}</a>', url, obj.thread.title[:50])
    thread_link.short_description = 'Thread'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('thread', 'user')


@admin.register(ForumThreadSubscription)
class ForumThreadSubscriptionAdmin(admin.ModelAdmin):
    list_display = ['id', 'thread_link', 'user', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['thread__title', 'user__username']
    raw_id_fields = ['thread', 'user']
    list_editable = ['is_active']
    date_hierarchy = 'created_at'
    
    def thread_link(self, obj):
        url = reverse('admin:forum_forumthread_change', args=[obj.thread.id])
        return format_html('<a href="{}">{}</a>', url, obj.thread.title[:50])
    thread_link.short_description = 'Thread'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('thread', 'user')
    
    actions = ['activate_subscriptions', 'deactivate_subscriptions']
    
    def activate_subscriptions(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} subscriptions activated.')
    activate_subscriptions.short_description = 'Activate selected subscriptions'
    
    def deactivate_subscriptions(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} subscriptions deactivated.')
    deactivate_subscriptions.short_description = 'Deactivate selected subscriptions'