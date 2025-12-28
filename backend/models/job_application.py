"""Job Application Model"""
from datetime import datetime
from typing import Dict, Any


class JobApplicationModel:
    """Model for job applications submitted by learners"""

    VALID_STATUSES = ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted']

    @staticmethod
    def create_schema(data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a job application document

        Required fields:
            - job_id: str
            - user_id: str
            - applicant_name: str
            - applicant_email: str

        Optional fields:
            - cover_letter: str
            - resume_url: str
            - portfolio_url: str
            - status: str (default: 'pending')
        """
        now = datetime.utcnow()

        return {
            'job_id': data['job_id'],
            'user_id': data['user_id'],
            'applicant_name': data['applicant_name'],
            'applicant_email': data['applicant_email'],
            'cover_letter': data.get('cover_letter', ''),
            'resume_url': data.get('resume_url'),
            'portfolio_url': data.get('portfolio_url'),
            'status': data.get('status', 'pending'),
            'applied_at': now,
            'updated_at': now,
            'reviewed_at': None,
            'notes': '',  # Employer notes
            'metadata': data.get('metadata', {})
        }

    @staticmethod
    def update_status(application_id: str, new_status: str, notes: str = None) -> Dict[str, Any]:
        """Update application status"""
        update_data = {
            'status': new_status,
            'updated_at': datetime.utcnow()
        }

        if new_status in ['reviewed', 'shortlisted', 'rejected', 'accepted']:
            update_data['reviewed_at'] = datetime.utcnow()

        if notes:
            update_data['notes'] = notes

        return {'$set': update_data}

    @staticmethod
    def create_safe_view(application: Dict[str, Any]) -> Dict[str, Any]:
        """Create safe view of application for API responses"""
        safe_fields = [
            '_id',
            'job_id',
            'user_id',
            'applicant_name',
            'applicant_email',
            'cover_letter',
            'resume_url',
            'portfolio_url',
            'status',
            'applied_at',
            'updated_at',
            'reviewed_at',
            'notes',
            'match_data',  # Added by matching service
            'applicant_profile'  # Added by matching service
        ]

        return {
            key: str(value) if key == '_id' and value else value
            for key, value in application.items()
            if key in safe_fields
        }
