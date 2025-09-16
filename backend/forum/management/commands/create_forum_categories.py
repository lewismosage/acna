from django.core.management.base import BaseCommand
from forum.models import ForumCategory


class Command(BaseCommand):
    help = 'Create initial forum categories'

    def handle(self, *args, **options):
        categories = [
            {
                'title': "General Discussion",
                'slug': "general",
                'description': "Use this forum to discuss things related to pediatric neurology that don't belong in any of the other forums.",
                'icon': 'MessageSquare',
                'color': 'blue',
                'order': 1,
                'is_active': True
            },
            {
                'title': "Meet and Greet",
                'slug': "meet-and-greet",
                'description': "Introduce yourself and say hello to your fellow colleagues!",
                'icon': 'Users',
                'color': 'green',
                'order': 2,
                'is_active': True
            },
            {
                'title': "Case Studies & Clinical Discussion",
                'slug': "case-studies",
                'description': "Share interesting cases, discuss diagnostic challenges, and seek clinical advice from peers.",
                'icon': 'Star',
                'color': 'purple',
                'order': 3,
                'is_active': True
            },
            {
                'title': "Research & Publications",
                'slug': "research",
                'description': "Discuss ongoing research, share publications, and collaborate on research projects.",
                'icon': 'TrendingUp',
                'color': 'orange',
                'order': 4,
                'is_active': True
            },
            {
                'title': "Training & Education",
                'slug': "training",
                'description': "Questions about courses, workshops, and continuing medical education opportunities.",
                'icon': 'Calendar',
                'color': 'teal',
                'order': 5,
                'is_active': True
            },
            {
                'title': "Technical Support",
                'slug': "technical-support",
                'description': "Get help with platform issues, course access problems, and technical questions.",
                'icon': 'MessageCircle',
                'color': 'red',
                'order': 6,
                'is_active': True
            }
        ]

        created_count = 0
        for cat_data in categories:
            category, created = ForumCategory.objects.get_or_create(
                slug=cat_data['slug'],
                defaults=cat_data
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created category: {category.title}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Category already exists: {category.title}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully processed {len(categories)} categories. Created {created_count} new categories.')
        )