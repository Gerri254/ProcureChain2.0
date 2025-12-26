"""User Profile data models for learners and employers"""
from datetime import datetime
from typing import Dict, List
from bson import ObjectId


class UserProfileModel:
    """Model for user profile records (learners)"""

    VALID_USER_TYPES = ['learner', 'employer', 'educator', 'admin']
    VALID_EXPERIENCE_LEVELS = ['student', 'junior', 'mid', 'senior', 'expert']

    @staticmethod
    def create_learner_schema(data: Dict) -> Dict:
        """
        Create learner profile schema

        Args:
            data: User profile data

        Returns:
            Validated learner profile record
        """
        now = datetime.utcnow()

        return {
            'user_id': data.get('user_id'),  # Reference to user auth record
            'user_type': 'learner',

            # Basic Info
            'full_name': data.get('full_name', ''),
            'bio': data.get('bio', ''),
            'location': data.get('location', ''),
            'timezone': data.get('timezone', 'UTC'),

            # Contact
            'contact': {
                'email': data.get('email', ''),
                'phone': data.get('phone', ''),
                'github': data.get('github', ''),
                'linkedin': data.get('linkedin', ''),
                'portfolio': data.get('portfolio', ''),
                'twitter': data.get('twitter', '')
            },

            # Professional Info
            'professional_info': {
                'experience_level': data.get('experience_level', 'student'),
                'current_role': data.get('current_role', ''),
                'current_company': data.get('current_company', ''),
                'years_of_experience': data.get('years_of_experience', 0),
                'looking_for_job': data.get('looking_for_job', False),
                'available_from': data.get('available_from'),
                'preferred_roles': data.get('preferred_roles', []),
                'salary_expectation': {
                    'min': data.get('salary_min', 0),
                    'max': data.get('salary_max', 0),
                    'currency': data.get('salary_currency', 'USD')
                }
            },

            # Skills & Credentials
            'verified_skills': [],  # List of verified skill assessment IDs
            'skill_summary': {},  # {skill_name: {score, verified_date, expires_at}}
            'total_credentials': 0,
            'average_skill_score': 0,

            # Portfolio
            'portfolio_items': [],  # GitHub repos, projects, etc.
            'github_verified': data.get('github_verified', False),
            'github_stats': {
                'total_repos': 0,
                'total_commits': 0,
                'languages': [],
                'last_verified': None
            },

            # Employment History (verified through platform)
            'employment_history': [],
            'employer_ratings': [],
            'average_employer_rating': 0,

            # Learning Stats
            'learning_stats': {
                'assessments_taken': 0,
                'assessments_passed': 0,
                'total_study_time_hours': 0,
                'skills_learning': [],
                'last_assessment_date': None
            },

            # Visibility & Privacy
            'profile_visibility': data.get('profile_visibility', 'public'),  # public, private, employers_only
            'allow_recruiter_contact': data.get('allow_recruiter_contact', True),
            'show_salary_expectations': data.get('show_salary_expectations', False),

            # Metadata
            'metadata': {
                'profile_complete': False,
                'profile_completeness_score': 0,  # 0-100
                'verified_by_platform': data.get('verified', False),
                'featured': data.get('featured', False),
                'badge_earned': [],  # Special achievements
                'reputation_score': 0  # Community reputation
            },

            # Timestamps
            'created_at': now,
            'updated_at': now,
            'last_login': now
        }

    @staticmethod
    def create_employer_schema(data: Dict) -> Dict:
        """
        Create employer profile schema

        Args:
            data: Employer profile data

        Returns:
            Validated employer profile record
        """
        now = datetime.utcnow()

        return {
            'user_id': data.get('user_id'),
            'user_type': 'employer',

            # Company Info
            'company_name': data.get('company_name', ''),
            'company_description': data.get('company_description', ''),
            'company_size': data.get('company_size', ''),  # 1-10, 11-50, 51-200, etc.
            'industry': data.get('industry', ''),
            'website': data.get('website', ''),
            'logo_url': data.get('logo_url', ''),

            # Contact
            'contact': {
                'email': data.get('email', ''),
                'phone': data.get('phone', ''),
                'address': data.get('address', ''),
                'linkedin': data.get('linkedin', '')
            },

            # Hiring Info
            'hiring_info': {
                'actively_hiring': data.get('actively_hiring', False),
                'open_positions': 0,
                'total_hires_via_platform': 0,
                'preferred_skills': data.get('preferred_skills', []),
                'hiring_locations': data.get('hiring_locations', []),
                'remote_friendly': data.get('remote_friendly', False)
            },

            # Hiring History
            'candidates_hired': [],  # List of user_ids hired
            'job_postings': [],  # List of job posting IDs
            'candidate_reviews': [],  # Reviews of hired candidates

            # Company Ratings
            'company_ratings': {
                'average_rating': 0,
                'total_reviews': 0,
                'work_culture': 0,
                'work_life_balance': 0,
                'compensation': 0,
                'career_growth': 0
            },

            # Metadata
            'metadata': {
                'verified_employer': data.get('verified', False),
                'verification_date': data.get('verification_date'),
                'featured': data.get('featured', False),
                'premium_account': data.get('premium', False)
            },

            # Timestamps
            'created_at': now,
            'updated_at': now,
            'last_login': now
        }

    @staticmethod
    def add_verified_skill(skill_assessment_id: ObjectId, skill_name: str, score: int,
                          verified_date: datetime, expires_at: datetime) -> Dict:
        """
        Create verified skill record for user profile

        Args:
            skill_assessment_id: Reference to assessment
            skill_name: Name of skill
            score: Skill score (0-100)
            verified_date: When verified
            expires_at: When credential expires

        Returns:
            Verified skill record
        """
        return {
            'assessment_id': skill_assessment_id,
            'skill': skill_name,
            'score': score,
            'verified_date': verified_date,
            'expires_at': expires_at,
            'is_expired': datetime.utcnow() > expires_at,
            'badge_earned': score >= 70
        }

    @staticmethod
    def add_employment_record(employer_id: ObjectId, company_name: str, role: str,
                             start_date: datetime, end_date: datetime = None,
                             rating: float = None) -> Dict:
        """
        Create employment history record

        Args:
            employer_id: Reference to employer
            company_name: Company name
            role: Job role
            start_date: Start date
            end_date: End date (None if current)
            rating: Employer rating (0-5)

        Returns:
            Employment record
        """
        return {
            'employer_id': employer_id,
            'company_name': company_name,
            'role': role,
            'start_date': start_date,
            'end_date': end_date,
            'is_current': end_date is None,
            'verified_via_platform': True,
            'rating': rating,
            'skills_used': [],
            'achievements': []
        }

    @staticmethod
    def calculate_profile_completeness(profile: Dict) -> int:
        """
        Calculate profile completeness score (0-100)

        Args:
            profile: User profile

        Returns:
            Completeness score
        """
        score = 0

        # Basic info (20 points)
        if profile.get('full_name'): score += 5
        if profile.get('bio'): score += 5
        if profile.get('location'): score += 5
        if profile.get('contact', {}).get('email'): score += 5

        # Professional info (20 points)
        prof = profile.get('professional_info', {})
        if prof.get('experience_level'): score += 5
        if prof.get('current_role'): score += 5
        if prof.get('preferred_roles'): score += 5
        if prof.get('salary_expectation', {}).get('min'): score += 5

        # Skills (30 points)
        if profile.get('total_credentials', 0) >= 1: score += 10
        if profile.get('total_credentials', 0) >= 3: score += 10
        if profile.get('total_credentials', 0) >= 5: score += 10

        # Contact links (15 points)
        contact = profile.get('contact', {})
        if contact.get('github'): score += 5
        if contact.get('linkedin'): score += 5
        if contact.get('portfolio'): score += 5

        # Portfolio (15 points)
        if profile.get('portfolio_items'): score += 10
        if profile.get('github_verified'): score += 5

        return min(score, 100)

    @staticmethod
    def update_skill_summary(profile: Dict, verified_skills: List[Dict]) -> Dict:
        """
        Update skill summary from verified assessments

        Args:
            profile: User profile
            verified_skills: List of verified skill assessments

        Returns:
            Updated skill summary
        """
        skill_summary = {}

        for skill_data in verified_skills:
            skill_name = skill_data.get('skill')

            # If skill already exists, keep the highest score
            if skill_name in skill_summary:
                if skill_data.get('score', 0) > skill_summary[skill_name]['score']:
                    skill_summary[skill_name] = {
                        'score': skill_data.get('score', 0),
                        'verified_date': skill_data.get('verified_date'),
                        'expires_at': skill_data.get('expires_at'),
                        'is_expired': skill_data.get('is_expired', False)
                    }
            else:
                skill_summary[skill_name] = {
                    'score': skill_data.get('score', 0),
                    'verified_date': skill_data.get('verified_date'),
                    'expires_at': skill_data.get('expires_at'),
                    'is_expired': skill_data.get('is_expired', False)
                }

        return skill_summary

    @staticmethod
    def create_public_view(profile: Dict) -> Dict:
        """
        Create public view of user profile

        Args:
            profile: Full profile record

        Returns:
            Public-safe profile record
        """
        if profile.get('user_type') == 'learner':
            visibility = profile.get('profile_visibility', 'public')

            if visibility == 'private':
                return {'message': 'Profile is private'}

            public_data = {
                'user_type': 'learner',
                'full_name': profile.get('full_name', 'Anonymous'),
                'bio': profile.get('bio', ''),
                'location': profile.get('location', ''),
                'professional_info': {
                    'experience_level': profile.get('professional_info', {}).get('experience_level'),
                    'current_role': profile.get('professional_info', {}).get('current_role')
                },
                'skill_summary': profile.get('skill_summary', {}),
                'total_credentials': profile.get('total_credentials', 0),
                'average_skill_score': profile.get('average_skill_score', 0),
                'github_verified': profile.get('github_verified', False),
                'average_employer_rating': profile.get('average_employer_rating', 0),
                'metadata': {
                    'badge_earned': profile.get('metadata', {}).get('badge_earned', []),
                    'reputation_score': profile.get('metadata', {}).get('reputation_score', 0)
                }
            }

            # Show contact only if allowed
            if profile.get('allow_recruiter_contact', True):
                public_data['contact'] = {
                    'email': profile.get('contact', {}).get('email', ''),
                    'linkedin': profile.get('contact', {}).get('linkedin', ''),
                    'github': profile.get('contact', {}).get('github', ''),
                    'portfolio': profile.get('contact', {}).get('portfolio', '')
                }

            # Show salary only if allowed
            if profile.get('show_salary_expectations', False):
                public_data['salary_expectation'] = profile.get('professional_info', {}).get('salary_expectation', {})

            return public_data

        elif profile.get('user_type') == 'employer':
            return {
                'user_type': 'employer',
                'company_name': profile.get('company_name', ''),
                'company_description': profile.get('company_description', ''),
                'industry': profile.get('industry', ''),
                'website': profile.get('website', ''),
                'logo_url': profile.get('logo_url', ''),
                'hiring_info': profile.get('hiring_info', {}),
                'company_ratings': profile.get('company_ratings', {}),
                'metadata': {
                    'verified_employer': profile.get('metadata', {}).get('verified_employer', False)
                }
            }

        return {}
