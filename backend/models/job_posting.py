"""Job Posting Model - For employer job postings"""
from datetime import datetime, timedelta
from typing import Dict, List, Optional


class JobPostingModel:
    """Model for job postings created by employers"""

    @staticmethod
    def create_schema(data: Dict) -> Dict:
        """
        Create a job posting document schema

        Args:
            data: Dictionary containing job posting information

        Returns:
            Dictionary with complete job posting schema
        """
        now = datetime.utcnow()

        # Calculate expiry date (default 30 days from now)
        expiry_days = data.get('expiry_days', 30)
        expires_at = now + timedelta(days=expiry_days)

        return {
            'employer_id': data['employer_id'],  # Required
            'title': data['title'],  # Required
            'description': data['description'],  # Required
            'company_name': data.get('company_name', ''),

            # Job details
            'location': data.get('location', ''),
            'location_type': data.get('location_type', 'onsite'),  # onsite, remote, hybrid
            'employment_type': data.get('employment_type', 'full-time'),  # full-time, part-time, contract, internship
            'experience_level': data.get('experience_level', 'mid-level'),  # junior, mid-level, senior, expert

            # Skills and requirements
            'skills_required': data.get('skills_required', []),  # Array of skill names
            'minimum_score': data.get('minimum_score', 70),  # Minimum skill score required
            'responsibilities': data.get('responsibilities', []),  # Array of responsibility strings
            'qualifications': data.get('qualifications', []),  # Array of qualification strings

            # Compensation
            'salary_min': data.get('salary_min'),  # Optional minimum salary
            'salary_max': data.get('salary_max'),  # Optional maximum salary
            'salary_currency': data.get('salary_currency', 'USD'),
            'salary_period': data.get('salary_period', 'yearly'),  # yearly, monthly, hourly

            # Benefits and perks
            'benefits': data.get('benefits', []),  # Array of benefit strings

            # Application details
            'how_to_apply': data.get('how_to_apply', 'Apply through SkillChain'),
            'application_url': data.get('application_url'),  # Optional external application URL

            # Status and metadata
            'status': data.get('status', 'draft'),  # draft, active, closed, expired
            'posted_at': data.get('posted_at', now),
            'expires_at': expires_at,
            'views_count': 0,
            'applications_count': 0,

            # Timestamps
            'created_at': now,
            'updated_at': now,
        }

    @staticmethod
    def update_schema(data: Dict) -> Dict:
        """
        Create update schema for job posting

        Args:
            data: Dictionary containing fields to update

        Returns:
            Dictionary with updated fields and timestamp
        """
        update_data = {}

        # Allowed update fields
        allowed_fields = [
            'title', 'description', 'company_name', 'location', 'location_type',
            'employment_type', 'experience_level', 'skills_required', 'minimum_score',
            'responsibilities', 'qualifications', 'salary_min', 'salary_max',
            'salary_currency', 'salary_period', 'benefits', 'how_to_apply',
            'application_url', 'status', 'expires_at'
        ]

        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]

        # Always update timestamp
        update_data['updated_at'] = datetime.utcnow()

        return update_data

    @staticmethod
    def serialize(job_posting: Dict) -> Dict:
        """
        Serialize job posting for API response

        Args:
            job_posting: Job posting document from database

        Returns:
            Serialized job posting dictionary
        """
        if not job_posting:
            return None

        # Convert ObjectId to string
        job_posting['_id'] = str(job_posting['_id'])
        job_posting['employer_id'] = str(job_posting['employer_id'])

        # Convert datetime objects to ISO format strings
        for date_field in ['posted_at', 'expires_at', 'created_at', 'updated_at']:
            if date_field in job_posting and job_posting[date_field]:
                job_posting[date_field] = job_posting[date_field].isoformat()

        # Check if job is expired
        if job_posting.get('expires_at'):
            expires_at = datetime.fromisoformat(job_posting['expires_at'].replace('Z', '+00:00'))
            job_posting['is_expired'] = expires_at < datetime.utcnow()
        else:
            job_posting['is_expired'] = False

        # Calculate days until expiry
        if job_posting.get('expires_at') and not job_posting['is_expired']:
            expires_at = datetime.fromisoformat(job_posting['expires_at'].replace('Z', '+00:00'))
            days_until_expiry = (expires_at - datetime.utcnow()).days
            job_posting['days_until_expiry'] = max(0, days_until_expiry)
        else:
            job_posting['days_until_expiry'] = 0

        return job_posting

    @staticmethod
    def validate_status_transition(current_status: str, new_status: str) -> bool:
        """
        Validate if status transition is allowed

        Args:
            current_status: Current job status
            new_status: New job status

        Returns:
            True if transition is allowed, False otherwise
        """
        valid_transitions = {
            'draft': ['active', 'closed'],
            'active': ['closed', 'expired'],
            'closed': ['active'],
            'expired': ['active']
        }

        if current_status not in valid_transitions:
            return False

        return new_status in valid_transitions[current_status]
