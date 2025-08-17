# news/tests.py
from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.utils import timezone
from .models import NewsItem, NewsSection, Author, NewsAuthor, Source, Contact
from .serializers import NewsItemSerializer, CreateNewsSerializer


class NewsModelTests(TestCase):
    """Test cases for News models"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.news_item = NewsItem.objects.create(
            title='Test News Item',
            type='News Article',
            status='Published',
            category='Technology',
            date=timezone.now().date(),
            introduction='This is a test introduction',
            tags='test, news, technology',
            created_by=self.user
        )
    
    def test_news_item_creation(self):
        """Test that a news item can be created properly"""
        self.assertEqual(self.news_item.title, 'Test News Item')
        self.assertEqual(self.news_item.status, 'Published')
        self.assertEqual(self.news_item.views, 0)
        self.assertFalse(self.news_item.is_featured)
    
    def test_news_item_str(self):
        """Test the string representation of news item"""
        self.assertEqual(str(self.news_item), 'Test News Item')
    
    def test_tags_list_property(self):
        """Test that tags are properly converted to list"""
        tags = self.news_item.tags_list
        self.assertEqual(tags, ['test', 'news', 'technology'])
    
    def test_set_tags_from_list(self):
        """Test setting tags from a list"""
        new_tags = ['python', 'django', 'web']
        self.news_item.set_tags_from_list(new_tags)
        self.assertEqual(self.news_item.tags, 'python, django, web')
    
    def test_increment_views(self):
        """Test view increment functionality"""
        initial_views = self.news_item.views
        self.news_item.increment_views()
        self.assertEqual(self.news_item.views, initial_views + 1)
    
    def test_image_url_display(self):
        """Test image URL display property"""
        # Test with no image
        self.assertEqual(self.news_item.image_url_display, '')
        
        # Test with image URL
        self.news_item.image_url = 'https://example.com/image.jpg'
        self.news_item.save()
        self.assertEqual(self.news_item.image_url_display, 'https://example.com/image.jpg')


class NewsAPITests(APITestCase):
    """Test cases for News API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        
        # Create regular user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        # Create admin user
        self.admin_user = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='adminpass123',
            is_staff=True,
            is_superuser=True
        )
        
        # Create test news items
        self.published_news = NewsItem.objects.create(
            title='Published News',
            type='News Article',
            status='Published',
            category='Technology',
            date=timezone.now().date(),
            introduction='This is published news',
            is_featured=True
        )
        
        self.draft_news = NewsItem.objects.create(
            title='Draft News',
            type='News Article',
            status='Draft',
            category='Technology',
            date=timezone.now().date(),
            introduction='This is draft news'
        )
        
        # Create news sections
        NewsSection.objects.create(
            news_item=self.published_news,
            heading='Section 1',
            content='Content of section 1',
            order=0
        )
    
    def test_get_news_list_public(self):
        """Test getting news list as public user"""
        url = reverse('news-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Public users should only see published news
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Published News')
    
    def test_get_news_list_admin(self):
        """Test getting news list as admin user"""
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('news-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Admin users should see all news
        self.assertEqual(len(response.data), 2)
    
    def test_get_news_detail_public(self):
        """Test getting news detail as public user"""
        url = reverse('news-detail', kwargs={'pk': self.published_news.pk})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Published News')
        self.assertIn('content', response.data)
        self.assertIn('sections', response.data['content'])
    
    def test_get_draft_news_detail_public_forbidden(self):
        """Test that public users can't access draft news"""
        url = reverse('news-detail', kwargs={'pk': self.draft_news.pk})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_create_news_admin(self):
        """Test creating news as admin user"""
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('news-list')
        
        data = {
            'title': 'New Test News',
            'type': 'News Article',
            'status': 'Draft',
            'category': 'Technology',
            'date': timezone.now().date().isoformat(),
            'content': {
                'introduction': 'Test introduction',
                'sections': [
                    {'heading': 'Test Section', 'content': 'Test content'}
                ],
                'conclusion': 'Test conclusion'
            },
            'tags': ['test', 'api'],
            'isFeatured': False
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'New Test News')
        
        # Verify news item was created in database
        news_item = NewsItem.objects.get(title='New Test News')
        self.assertEqual(news_item.introduction, 'Test introduction')
        self.assertEqual(news_item.sections.count(), 1)
    
    def test_create_news_public_forbidden(self):
        """Test that public users can't create news"""
        url = reverse('news-list')
        data = {'title': 'Test News'}
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_update_news_admin(self):
        """Test updating news as admin user"""
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('news-detail', kwargs={'pk': self.published_news.pk})
        
        data = {
            'title': 'Updated News Title',
            'status': 'Published'
        }
        
        response = self.client.patch(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Updated News Title')
    
    def test_delete_news_admin(self):
        """Test deleting news as admin user"""
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('news-detail', kwargs={'pk': self.draft_news.pk})
        
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(NewsItem.objects.filter(pk=self.draft_news.pk).exists())
    
    def test_get_featured_news(self):
        """Test getting featured news"""
        url = reverse('news-featured')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Published News')
        self.assertTrue(response.data[0]['isFeatured'])
    
    def test_get_published_news(self):
        """Test getting published news with pagination"""
        url = reverse('news-published')
        response = self.client.get(url, {'page': 1, 'page_size': 10})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertIn('count', response.data)
        self.assertEqual(response.data['count'], 1)
    
    def test_toggle_featured_admin(self):
        """Test toggling featured status as admin"""
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('news-toggle-featured', kwargs={'pk': self.draft_news.pk})
        
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['isFeatured'])
        
        # Verify in database
        self.draft_news.refresh_from_db()
        self.assertTrue(self.draft_news.is_featured)
    
    def test_update_status_admin(self):
        """Test updating news status as admin"""
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('news-update-status', kwargs={'pk': self.draft_news.pk})
        
        response = self.client.patch(url, {'status': 'Published'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'Published')
    
    def test_get_analytics_admin(self):
        """Test getting analytics as admin"""
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('news-analytics')
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total', response.data)
        self.assertIn('published', response.data)
        self.assertIn('drafts', response.data)
        self.assertEqual(response.data['total'], 2)
        self.assertEqual(response.data['published'], 1)
        self.assertEqual(response.data['drafts'], 1)
    
    def test_get_analytics_public_forbidden(self):
        """Test that public users can't access analytics"""
        url = reverse('news-analytics')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class NewsSerializerTests(TestCase):
    """Test cases for News serializers"""
    
    def setUp(self):
        self.news_item = NewsItem.objects.create(
            title='Test News',
            type='News Article',
            status='Published',
            category='Technology',
            date=timezone.now().date(),
            introduction='Test introduction',
            tags='test, serializer'
        )
        
        # Create a section
        NewsSection.objects.create(
            news_item=self.news_item,
            heading='Test Section',
            content='Test section content',
            order=0
        )
    
    def test_news_item_serializer(self):
        """Test NewsItemSerializer output"""
        serializer = NewsItemSerializer(self.news_item)
        data = serializer.data
        
        self.assertEqual(data['title'], 'Test News')
        self.assertEqual(data['status'], 'Published')
        self.assertIn('content', data)
        self.assertIn('sections', data['content'])
        self.assertEqual(len(data['content']['sections']), 1)
        self.assertEqual(data['tags'], ['test', 'serializer'])
    
    def test_create_news_serializer_valid(self):
        """Test CreateNewsSerializer with valid data"""
        data = {
            'title': 'New News Item',
            'type': 'News Article',
            'status': 'Draft',
            'category': 'Technology',
            'date': timezone.now().date(),
            'content': {
                'introduction': 'Test introduction',
                'sections': [
                    {'heading': 'Section 1', 'content': 'Content 1'}
                ]
            },
            'tags': ['test', 'create']
        }
        
        serializer = CreateNewsSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        
        news_item = serializer.save()
        self.assertEqual(news_item.title, 'New News Item')
        self.assertEqual(news_item.sections.count(), 1)
    
    def test_create_news_serializer_invalid(self):
        """Test CreateNewsSerializer with invalid data"""
        data = {
            'title': '',  # Empty title should be invalid
            'content': 'invalid content'  # Should be a dict
        }
        
        serializer = CreateNewsSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('title', serializer.errors)
        self.assertIn('content', serializer.errors)