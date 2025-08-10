# payments/tests.py
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from users.models import User
from datetime import date, timedelta
from django.utils import timezone
import json

class MembershipRenewalTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Create test users with different membership statuses
        self.active_user = User.objects.create_user(
            username='active@test.com',
            email='active@test.com',
            password='testpass123',
            first_name='Active',
            last_name='User',
            mobile_number='1234567890',
            membership_class='full_professional',
            membership_id='MEM123',
            membership_valid_until=date.today() + timedelta(days=60)  # Active for 60 more days
        )
        
        self.expiring_user = User.objects.create_user(
            username='expiring@test.com',
            email='expiring@test.com',
            password='testpass123',
            first_name='Expiring',
            last_name='User',
            mobile_number='1234567890',
            membership_class='full_professional',
            membership_id='MEM456',
            membership_valid_until=date.today() + timedelta(days=15)  # Expiring in 15 days
        )
        
        self.expired_user = User.objects.create_user(
            username='expired@test.com',
            email='expired@test.com',
            password='testpass123',
            first_name='Expired',
            last_name='User',
            mobile_number='1234567890',
            membership_class='full_professional',
            membership_id='MEM789',
            membership_valid_until=date.today() - timedelta(days=30)  # Expired 30 days ago
        )
        
        self.organization_user = User.objects.create_user(
            username='org@test.com',
            email='org@test.com',
            password='testpass123',
            first_name='Test Organization',
            mobile_number='1234567890',
            is_organization=True,
            organization_name='Test Org',
            organization_phone='1234567890',
            membership_class='corporate',
            membership_id='ORG123',
            membership_valid_until=date.today() - timedelta(days=10)  # Expired organization
        )
        
        # Authenticate the client with one of the users
        self.client.force_authenticate(user=self.active_user)

    def test_search_active_membership(self):
        """Test searching for an active membership record"""
        url = reverse('membership-search')
        data = {
            'firstName': 'Active',
            'lastName': 'User',
            'email': 'active@test.com',
            'isOrganization': False
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['membershipStatus'], 'Active')
        self.assertEqual(response.data['firstName'], 'Active')
        self.assertEqual(response.data['lastName'], 'User')

    def test_search_expiring_membership(self):
        """Test searching for an expiring membership record"""
        url = reverse('membership-search')
        data = {
            'firstName': 'Expiring',
            'lastName': 'User',
            'email': 'expiring@test.com',
            'isOrganization': False
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['membershipStatus'], 'Expiring Soon')
        self.assertTrue(response.data['renewalFee'] > 0)

    def test_search_expired_membership(self):
        """Test searching for an expired membership record"""
        url = reverse('membership-search')
        data = {
            'firstName': 'Expired',
            'lastName': 'User',
            'email': 'expired@test.com',
            'isOrganization': False
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['membershipStatus'], 'Expired')
        self.assertTrue(response.data['renewalFee'] > 0)

    def test_search_organization_membership(self):
        """Test searching for an organization membership record"""
        url = reverse('membership-search')
        data = {
            'organizationName': 'Test Org',
            'email': 'org@test.com',
            'isOrganization': True
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['membershipStatus'], 'Expired')
        self.assertEqual(response.data['isOrganization'], True)
        self.assertEqual(response.data['firstName'], 'Test Organization')

    def test_renewal_too_early(self):
        """Test that active members can't renew more than 30 days before expiry"""
        self.client.force_authenticate(user=self.active_user)
        url = reverse('create-checkout-session')
        data = {
            'payment_type': 'renewal'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Your membership is active for', response.data['error'])

    def test_renewal_expiring_soon(self):
        """Test that expiring members can renew"""
        self.client.force_authenticate(user=self.expiring_user)
        url = reverse('create-checkout-session')
        data = {
            'payment_type': 'renewal'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('sessionId', response.data)

    def test_renewal_expired(self):
        """Test that expired members can renew"""
        self.client.force_authenticate(user=self.expired_user)
        url = reverse('create-checkout-session')
        data = {
            'payment_type': 'renewal'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('sessionId', response.data)

    def test_invalid_search(self):
        """Test searching with invalid data"""
        url = reverse('membership-search')
        
        # Missing required fields
        data = {
            'firstName': 'Test',
            'email': 'test@test.com',
            'isOrganization': False
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('First name, last name and email are required', response.data['message'])

        # Non-existent user
        data = {
            'firstName': 'Nonexistent',
            'lastName': 'User',
            'email': 'nonexistent@test.com',
            'isOrganization': False
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('No matching membership record found', response.data['message'])

    def test_membership_renewal_fee_calculation(self):
        """Test that renewal fees are calculated correctly"""
        # Test full professional
        user = self.active_user
        user.membership_class = 'full_professional'
        user.save()
        
        url = reverse('membership-search')
        data = {
            'firstName': 'Active',
            'lastName': 'User',
            'email': 'active@test.com',
            'isOrganization': False
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.data['renewalFee'], 100)
        
        # Test student
        user.membership_class = 'student'
        user.save()
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.data['renewalFee'], 50)
        
        # Test corporate
        user.membership_class = 'corporate'
        user.save()
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.data['renewalFee'], 300)