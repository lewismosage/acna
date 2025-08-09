# payments/tests.py
from django.test import TestCase
from django.urls import reverse
from unittest.mock import patch, MagicMock
from django.contrib.auth import get_user_model
from payments.models import Payment

User = get_user_model()


class PaymentViewTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='maendalewis20@gmail.com',
            email='maendalewis20@gmail.com',
            password='@Lewis9590'
        )
        self.client.login(username='testuser', password='testpass123')
        self.url = reverse('create-payment')  

    @patch('payments.views.stripe.PaymentIntent.create')
    @patch('payments.views.EmailMultiAlternatives.send')
    @patch('payments.views.generate_membership_id', return_value='MEMB12345')
    def test_successful_payment(self, mock_generate_id, mock_send_email, mock_stripe_create):
        # Mock Stripe PaymentIntent.create response
        mock_stripe_create.return_value = {
            'id': 'pi_test123',
            'client_secret': 'test_client_secret'
        }
        mock_send_email.return_value = True

        payload = {
            "amount": 5000,  # in cents
            "currency": "usd"
        }

        response = self.client.post(self.url, payload, content_type="application/json")
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('client_secret', response.json())
        mock_stripe_create.assert_called_once()
        mock_send_email.assert_called_once()

        # Verify Payment record is saved
        self.assertTrue(Payment.objects.filter(user=self.user, amount=5000).exists())

    @patch('payments.views.stripe.PaymentIntent.create', side_effect=Exception("Stripe error"))
    def test_payment_failure(self, mock_stripe_create):
        payload = {
            "amount": 5000,
            "currency": "usd"
        }

        response = self.client.post(self.url, payload, content_type="application/json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json())
        mock_stripe_create.assert_called_once()
