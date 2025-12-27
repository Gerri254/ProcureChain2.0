"""Job Posting Service - Business logic for job postings"""
from datetime import datetime
from typing import Dict, List, Optional
from bson import ObjectId

from config.database import db
from models.job_posting import JobPostingModel
from utils.db_helpers import serialize_document, get_object_id, is_valid_object_id


class JobPostingService:
    """Service for managing job postings"""

    def create_job_posting(self, employer_id: str, data: Dict) -> Optional[str]:
        """
        Create a new job posting

        Args:
            employer_id: ID of the employer creating the job
            data: Job posting data

        Returns:
            Job posting ID if successful, None otherwise
        """
        try:
            # Add employer_id to data
            data['employer_id'] = employer_id

            # Create job posting document
            job_posting = JobPostingModel.create_schema(data)

            # Insert into database
            result = db.job_postings.insert_one(job_posting)

            return str(result.inserted_id)

        except Exception as e:
            print(f"Error creating job posting: {e}")
            return None

    def get_job_posting_by_id(self, job_id: str, include_private: bool = False) -> Optional[Dict]:
        """
        Get job posting by ID

        Args:
            job_id: Job posting ID
            include_private: Whether to include draft/closed jobs (for employers)

        Returns:
            Job posting document or None
        """
        try:
            if not is_valid_object_id(job_id):
                return None

            query = {'_id': get_object_id(job_id)}

            # If not including private, only show active jobs
            if not include_private:
                query['status'] = 'active'

            job_posting = db.job_postings.find_one(query)

            if not job_posting:
                return None

            # Increment views count (only for active jobs viewed by non-owners)
            if not include_private and job_posting.get('status') == 'active':
                db.job_postings.update_one(
                    {'_id': get_object_id(job_id)},
                    {'$inc': {'views_count': 1}}
                )
                job_posting['views_count'] += 1

            return JobPostingModel.serialize(job_posting)

        except Exception as e:
            print(f"Error getting job posting: {e}")
            return None

    def get_job_postings(
        self,
        skills: Optional[List[str]] = None,
        location: Optional[str] = None,
        employment_type: Optional[str] = None,
        experience_level: Optional[str] = None,
        location_type: Optional[str] = None,
        min_salary: Optional[int] = None,
        search: Optional[str] = None,
        page: int = 1,
        per_page: int = 20
    ) -> Dict:
        """
        Get job postings with filters

        Returns:
            Dictionary with job_postings array and pagination info
        """
        try:
            query = {'status': 'active'}  # Only show active jobs

            # Filter by skills
            if skills and len(skills) > 0:
                query['skills_required'] = {'$in': skills}

            # Filter by location (case-insensitive partial match)
            if location:
                query['location'] = {'$regex': location, '$options': 'i'}

            # Filter by employment type
            if employment_type:
                query['employment_type'] = employment_type

            # Filter by experience level
            if experience_level:
                query['experience_level'] = experience_level

            # Filter by location type
            if location_type:
                query['location_type'] = location_type

            # Filter by minimum salary
            if min_salary:
                query['salary_min'] = {'$gte': min_salary}

            # Search in title and description
            if search:
                query['$or'] = [
                    {'title': {'$regex': search, '$options': 'i'}},
                    {'description': {'$regex': search, '$options': 'i'}},
                    {'company_name': {'$regex': search, '$options': 'i'}}
                ]

            # Calculate pagination
            skip = (page - 1) * per_page

            # Get total count
            total = db.job_postings.count_documents(query)

            # Get job postings
            job_postings = list(
                db.job_postings.find(query)
                .sort('posted_at', -1)  # Most recent first
                .skip(skip)
                .limit(per_page)
            )

            # Serialize job postings
            serialized_jobs = [JobPostingModel.serialize(job) for job in job_postings]

            return {
                'job_postings': serialized_jobs,
                'total': total,
                'page': page,
                'per_page': per_page,
                'total_pages': (total + per_page - 1) // per_page
            }

        except Exception as e:
            print(f"Error getting job postings: {e}")
            return {
                'job_postings': [],
                'total': 0,
                'page': page,
                'per_page': per_page,
                'total_pages': 0
            }

    def get_employer_job_postings(
        self,
        employer_id: str,
        status: Optional[str] = None,
        page: int = 1,
        per_page: int = 20
    ) -> Dict:
        """
        Get job postings for a specific employer

        Returns:
            Dictionary with job_postings array and pagination info
        """
        try:
            query = {'employer_id': employer_id}

            # Filter by status
            if status:
                query['status'] = status

            # Calculate pagination
            skip = (page - 1) * per_page

            # Get total count
            total = db.job_postings.count_documents(query)

            # Get job postings
            job_postings = list(
                db.job_postings.find(query)
                .sort('created_at', -1)  # Most recent first
                .skip(skip)
                .limit(per_page)
            )

            # Serialize job postings
            serialized_jobs = [JobPostingModel.serialize(job) for job in job_postings]

            return {
                'job_postings': serialized_jobs,
                'total': total,
                'page': page,
                'per_page': per_page,
                'total_pages': (total + per_page - 1) // per_page
            }

        except Exception as e:
            print(f"Error getting employer job postings: {e}")
            return {
                'job_postings': [],
                'total': 0,
                'page': page,
                'per_page': per_page,
                'total_pages': 0
            }

    def update_job_posting(self, job_id: str, employer_id: str, data: Dict) -> bool:
        """
        Update job posting

        Args:
            job_id: Job posting ID
            employer_id: Employer ID (for authorization)
            data: Update data

        Returns:
            True if successful, False otherwise
        """
        try:
            if not is_valid_object_id(job_id):
                return False

            # Check if job posting exists and belongs to employer
            job_posting = db.job_postings.find_one({
                '_id': get_object_id(job_id),
                'employer_id': employer_id
            })

            if not job_posting:
                return False

            # Validate status transition if status is being updated
            if 'status' in data:
                current_status = job_posting.get('status', 'draft')
                new_status = data['status']

                if not JobPostingModel.validate_status_transition(current_status, new_status):
                    print(f"Invalid status transition: {current_status} -> {new_status}")
                    return False

            # Create update data
            update_data = JobPostingModel.update_schema(data)

            # Update job posting
            result = db.job_postings.update_one(
                {'_id': get_object_id(job_id)},
                {'$set': update_data}
            )

            return result.modified_count > 0

        except Exception as e:
            print(f"Error updating job posting: {e}")
            return False

    def delete_job_posting(self, job_id: str, employer_id: str) -> bool:
        """
        Delete job posting (soft delete by setting status to closed)

        Args:
            job_id: Job posting ID
            employer_id: Employer ID (for authorization)

        Returns:
            True if successful, False otherwise
        """
        try:
            if not is_valid_object_id(job_id):
                return False

            # Update status to closed instead of deleting
            result = db.job_postings.update_one(
                {
                    '_id': get_object_id(job_id),
                    'employer_id': employer_id
                },
                {
                    '$set': {
                        'status': 'closed',
                        'updated_at': datetime.utcnow()
                    }
                }
            )

            return result.modified_count > 0

        except Exception as e:
            print(f"Error deleting job posting: {e}")
            return False

    def get_job_posting_stats(self, employer_id: str) -> Dict:
        """
        Get job posting statistics for an employer

        Returns:
            Dictionary with statistics
        """
        try:
            # Count jobs by status
            total_jobs = db.job_postings.count_documents({'employer_id': employer_id})
            active_jobs = db.job_postings.count_documents({
                'employer_id': employer_id,
                'status': 'active'
            })
            draft_jobs = db.job_postings.count_documents({
                'employer_id': employer_id,
                'status': 'draft'
            })
            closed_jobs = db.job_postings.count_documents({
                'employer_id': employer_id,
                'status': 'closed'
            })

            # Get total views and applications
            pipeline = [
                {'$match': {'employer_id': employer_id}},
                {
                    '$group': {
                        '_id': None,
                        'total_views': {'$sum': '$views_count'},
                        'total_applications': {'$sum': '$applications_count'}
                    }
                }
            ]

            result = list(db.job_postings.aggregate(pipeline))
            total_views = result[0]['total_views'] if result else 0
            total_applications = result[0]['total_applications'] if result else 0

            return {
                'total_jobs': total_jobs,
                'active_jobs': active_jobs,
                'draft_jobs': draft_jobs,
                'closed_jobs': closed_jobs,
                'total_views': total_views,
                'total_applications': total_applications
            }

        except Exception as e:
            print(f"Error getting job posting stats: {e}")
            return {
                'total_jobs': 0,
                'active_jobs': 0,
                'draft_jobs': 0,
                'closed_jobs': 0,
                'total_views': 0,
                'total_applications': 0
            }


# Create singleton instance
job_posting_service = JobPostingService()
