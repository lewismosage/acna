# payments/utils.py
from django.db import transaction
from users.models import User
from datetime import datetime

def generate_membership_id():
    current_year = datetime.now().year
    with transaction.atomic():
        # Use database sequence for atomic increment
        last_member = User.objects.filter(
            membership_id__startswith=f'ACNA-{current_year}-'
        ).order_by('-membership_id').first()
        
        if last_member and last_member.membership_id:
            try:
                # Extract the numeric part and increment
                last_number = int(last_member.membership_id.split('-')[-1])
                new_number = last_number + 1
            except (IndexError, ValueError):
                new_number = 1
        else:
            new_number = 1
            
        # Ensure 4-digit format with leading zeros
        return f'ACNA-{current_year}-{new_number:04d}'