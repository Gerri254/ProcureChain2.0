"""Seed sample users into the database for testing"""
import sys
import os
from datetime import datetime, timedelta
from bson import ObjectId

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.database import db
from models.user import UserModel
from services.user_profile_service import user_profile_service


# Sample users data
SAMPLE_USERS = [
    # ========== LEARNERS ==========
    {
        'email': 'sarah.chen@example.com',
        'password': 'password123',
        'full_name': 'Sarah Chen',
        'user_type': 'learner',
        'profile': {
            'bio': 'Full-stack developer passionate about building scalable web applications. Experienced in React, Python, and cloud technologies.',
            'location': 'San Francisco, CA',
            'experience_level': 'mid-level',
            'looking_for_job': True,
            'portfolio_url': 'https://sarachen.dev',
            'github_url': 'https://github.com/sarachen',
            'linkedin_url': 'https://linkedin.com/in/sarachen',
        }
    },
    {
        'email': 'michael.rodriguez@example.com',
        'password': 'password123',
        'full_name': 'Michael Rodriguez',
        'user_type': 'learner',
        'profile': {
            'bio': 'Frontend specialist with expertise in React and modern JavaScript. Love creating beautiful, performant user interfaces.',
            'location': 'Austin, TX',
            'experience_level': 'senior',
            'looking_for_job': False,
            'portfolio_url': 'https://mrodriguez.io',
            'github_url': 'https://github.com/mrodriguez',
            'linkedin_url': 'https://linkedin.com/in/michaelrodriguez',
        }
    },
    {
        'email': 'emily.johnson@example.com',
        'password': 'password123',
        'full_name': 'Emily Johnson',
        'user_type': 'learner',
        'profile': {
            'bio': 'Backend engineer specializing in Python and cloud infrastructure. AWS certified solutions architect.',
            'location': 'Seattle, WA',
            'experience_level': 'mid-level',
            'looking_for_job': True,
            'portfolio_url': 'https://emilyjohnson.dev',
            'github_url': 'https://github.com/emilyjohnson',
            'linkedin_url': 'https://linkedin.com/in/emilyjohnson',
        }
    },
    {
        'email': 'david.kim@example.com',
        'password': 'password123',
        'full_name': 'David Kim',
        'user_type': 'learner',
        'profile': {
            'bio': 'Recent bootcamp graduate eager to break into tech. Strong foundation in JavaScript, TypeScript, and React.',
            'location': 'New York, NY',
            'experience_level': 'junior',
            'looking_for_job': True,
            'portfolio_url': 'https://davidkim.codes',
            'github_url': 'https://github.com/davidkim',
            'linkedin_url': 'https://linkedin.com/in/davidkim',
        }
    },
    {
        'email': 'jessica.martinez@example.com',
        'password': 'password123',
        'full_name': 'Jessica Martinez',
        'user_type': 'learner',
        'profile': {
            'bio': 'Data engineer with expertise in Python, SQL, and big data technologies. Love solving complex data problems.',
            'location': 'Boston, MA',
            'experience_level': 'senior',
            'looking_for_job': False,
            'portfolio_url': 'https://jessicamartinez.dev',
            'github_url': 'https://github.com/jmartinez',
            'linkedin_url': 'https://linkedin.com/in/jessicamartinez',
        }
    },

    # ========== EMPLOYERS ==========
    {
        'email': 'hr@techcorp.com',
        'password': 'password123',
        'full_name': 'TechCorp HR Team',
        'user_type': 'employer',
        'profile': {
            'bio': 'Leading technology company building innovative SaaS products. Always looking for talented developers to join our team.',
            'location': 'San Francisco, CA',
            'company_name': 'TechCorp Inc.',
            'company_size': '100-500',
            'industry': 'Technology',
            'website': 'https://techcorp.com',
        }
    },
    {
        'email': 'talent@innovateai.com',
        'password': 'password123',
        'full_name': 'InnovateAI Recruiting',
        'user_type': 'employer',
        'profile': {
            'bio': 'AI-first startup revolutionizing machine learning infrastructure. Seeking experienced Python and ML engineers.',
            'location': 'New York, NY',
            'company_name': 'InnovateAI',
            'company_size': '10-50',
            'industry': 'Artificial Intelligence',
            'website': 'https://innovateai.com',
        }
    },

    # ========== EDUCATORS ==========
    {
        'email': 'instructor@codeacademy.com',
        'password': 'password123',
        'full_name': 'Jane Instructor',
        'user_type': 'educator',
        'profile': {
            'bio': 'Lead instructor at CodeAcademy with 10+ years of teaching experience. Passionate about helping students achieve their coding goals.',
            'location': 'Remote',
            'organization': 'CodeAcademy Online',
            'specialization': 'Web Development',
            'years_teaching': 10,
        }
    },
]


def seed_users():
    """Seed sample users into the database"""
    print("🌱 Seeding users into database...\n")

    created_count = 0
    failed_count = 0
    skipped_count = 0

    for user_data in SAMPLE_USERS:
        try:
            # Check if user already exists
            existing_user = db.users.find_one({'email': user_data['email'].lower()})
            if existing_user:
                print(f"⊗ Skipped: {user_data['full_name']} ({user_data['email']}) - already exists")
                skipped_count += 1
                continue

            # Extract profile data
            profile_data = user_data.pop('profile', {})

            # Prepare user data
            user_data['email'] = user_data['email'].lower()
            user_data['role'] = 'public'  # Default role for all users

            # Create user record using UserModel
            user_record = UserModel.create_schema(user_data)

            # Insert user into database
            result = db.users.insert_one(user_record)
            user_id = str(result.inserted_id)

            print(f"✓ Created: {user_data['full_name']} ({user_data['user_type']}) - {user_data['email']}")
            created_count += 1

            # Auto-create user profile based on user_type
            profile_id = None
            try:
                if user_data['user_type'] == 'learner':
                    profile_id = user_profile_service.create_learner_profile(user_id, {
                        'full_name': user_data.get('full_name'),
                        'email': user_data.get('email')
                    })
                elif user_data['user_type'] == 'employer':
                    profile_id = user_profile_service.create_employer_profile(user_id, {
                        'company_name': profile_data.get('company_name', user_data.get('full_name')),
                        'email': user_data.get('email')
                    })
                elif user_data['user_type'] == 'educator':
                    # Educators get learner profile
                    profile_id = user_profile_service.create_learner_profile(user_id, {
                        'full_name': user_data.get('full_name'),
                        'email': user_data.get('email')
                    })

                # Update user record with profile_id
                if profile_id:
                    db.users.update_one(
                        {'_id': ObjectId(user_id)},
                        {'$set': {'profile_id': profile_id}}
                    )

                # Update profile with additional data
                if profile_data:
                    # Add user_type to profile if not present
                    if 'user_type' not in profile_data:
                        profile_data['user_type'] = user_data['user_type']

                    user_profile_service.update_profile(user_id, profile_data)
                    print(f"  → Profile updated with {len(profile_data)} fields")

            except Exception as e:
                print(f"  ⚠ Warning: Profile creation issue - {e}")
                # Don't fail user creation if profile fails

        except Exception as e:
            print(f"✗ Error creating {user_data['full_name']}: {e}")
            import traceback
            traceback.print_exc()
            failed_count += 1

    print(f"\n{'='*60}")
    print(f"✓ Successfully created: {created_count} users")
    print(f"⊗ Skipped (already exist): {skipped_count} users")
    print(f"✗ Failed: {failed_count} users")
    print(f"{'='*60}\n")

    # Print login credentials
    if created_count > 0:
        print("📋 Test Account Credentials:")
        print("All accounts use password: password123\n")

        print("LEARNERS:")
        for user in SAMPLE_USERS:
            if user['user_type'] == 'learner':
                print(f"  • {user['email']}")

        print("\nEMPLOYERS:")
        for user in SAMPLE_USERS:
            if user['user_type'] == 'employer':
                print(f"  • {user['email']}")

        print("\nEDUCATORS:")
        for user in SAMPLE_USERS:
            if user['user_type'] == 'educator':
                print(f"  • {user['email']}")

        print(f"\n{'='*60}\n")


if __name__ == '__main__':
    seed_users()
