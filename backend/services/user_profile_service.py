"""User Profile Service - handles user profile operations"""
from typing import Dict, List, Optional
from bson import ObjectId
from datetime import datetime
from config.database import db
from models.user_profile import UserProfileModel
from utils.db_helpers import serialize_document, get_object_id, paginate_query


class UserProfileService:
    """Service for user profile operations"""

    def __init__(self):
        self.collection = db.user_profiles

    def create_learner_profile(self, user_id: str, data: Dict) -> str:
        """
        Create new learner profile

        Args:
            user_id: User auth ID
            data: Profile data

        Returns:
            Profile ID
        """
        # Add user_id to data
        data['user_id'] = get_object_id(user_id)

        # Create profile record
        profile = UserProfileModel.create_learner_schema(data)

        # Calculate initial completeness
        profile['metadata']['profile_completeness_score'] = UserProfileModel.calculate_profile_completeness(profile)
        profile['metadata']['profile_complete'] = profile['metadata']['profile_completeness_score'] >= 80

        # Insert into database
        result = self.collection.insert_one(profile)

        return str(result.inserted_id)

    def create_employer_profile(self, user_id: str, data: Dict) -> str:
        """
        Create new employer profile

        Args:
            user_id: User auth ID
            data: Profile data

        Returns:
            Profile ID
        """
        data['user_id'] = get_object_id(user_id)

        profile = UserProfileModel.create_employer_schema(data)

        result = self.collection.insert_one(profile)

        return str(result.inserted_id)

    def get_profile_by_user_id(self, user_id: str) -> Optional[Dict]:
        """
        Get profile by user auth ID

        Args:
            user_id: User auth ID

        Returns:
            Profile record or None
        """
        user_obj_id = get_object_id(user_id)

        if not user_obj_id:
            return None

        profile = self.collection.find_one({'user_id': user_obj_id})

        return serialize_document(profile)

    def get_profile_by_id(self, profile_id: str) -> Optional[Dict]:
        """
        Get profile by profile ID

        Args:
            profile_id: Profile ID

        Returns:
            Profile record or None
        """
        obj_id = get_object_id(profile_id)

        if not obj_id:
            return None

        profile = self.collection.find_one({'_id': obj_id})

        return serialize_document(profile)

    def update_profile(self, user_id: str, data: Dict) -> bool:
        """
        Update user profile

        Args:
            user_id: User auth ID
            data: Update data

        Returns:
            True if updated, False otherwise
        """
        user_obj_id = get_object_id(user_id)

        if not user_obj_id:
            return False

        # Don't allow updating certain fields
        protected_fields = ['user_id', 'user_type', 'verified_skills', 'created_at']
        for field in protected_fields:
            data.pop(field, None)

        # Add updated_at
        data['updated_at'] = datetime.utcnow()

        # Update profile
        result = self.collection.update_one(
            {'user_id': user_obj_id},
            {'$set': data}
        )

        # Recalculate completeness if profile was updated
        if result.modified_count > 0:
            self.update_profile_completeness(user_id)

        return result.modified_count > 0

    def update_profile_completeness(self, user_id: str) -> bool:
        """
        Recalculate and update profile completeness score

        Args:
            user_id: User auth ID

        Returns:
            True if updated
        """
        profile = self.get_profile_by_user_id(user_id)

        if not profile:
            return False

        completeness_score = UserProfileModel.calculate_profile_completeness(profile)
        profile_complete = completeness_score >= 80

        user_obj_id = get_object_id(user_id)

        result = self.collection.update_one(
            {'user_id': user_obj_id},
            {
                '$set': {
                    'metadata.profile_completeness_score': completeness_score,
                    'metadata.profile_complete': profile_complete,
                    'updated_at': datetime.utcnow()
                }
            }
        )

        return result.modified_count > 0

    def add_verified_skill(self, user_id: str, skill_assessment: Dict) -> bool:
        """
        Add verified skill to user profile

        Args:
            user_id: User auth ID
            skill_assessment: Verified assessment record

        Returns:
            True if added
        """
        user_obj_id = get_object_id(user_id)

        if not user_obj_id:
            return False

        # Create verified skill record
        ai_analysis = skill_assessment.get('ai_analysis', {})
        verified_skill = UserProfileModel.add_verified_skill(
            skill_assessment_id=skill_assessment.get('_id'),
            skill_name=skill_assessment.get('skill'),
            score=ai_analysis.get('overall_score', 0),
            verified_date=skill_assessment.get('verified_date'),
            expires_at=skill_assessment.get('expires_at')
        )

        # Add to verified_skills array
        result = self.collection.update_one(
            {'user_id': user_obj_id},
            {
                '$push': {'verified_skills': skill_assessment.get('_id')},
                '$set': {'updated_at': datetime.utcnow()}
            }
        )

        # Update skill summary
        if result.modified_count > 0:
            self.update_skill_summary(user_id)

        return result.modified_count > 0

    def update_skill_summary(self, user_id: str) -> bool:
        """
        Update user's skill summary from all verified assessments

        Args:
            user_id: User auth ID

        Returns:
            True if updated
        """
        from services.skill_assessment_service import skill_assessment_service

        # Get all verified skills for this user
        verified_skills = skill_assessment_service.get_verified_skills(user_id)

        if not verified_skills:
            return False

        # Create skill summary
        profile = self.get_profile_by_user_id(user_id)
        skill_summary = UserProfileModel.update_skill_summary(profile, verified_skills)

        # Calculate averages
        total_credentials = len(verified_skills)
        average_score = sum(s.get('score', 0) for s in verified_skills) / total_credentials if total_credentials > 0 else 0

        # Update profile
        user_obj_id = get_object_id(user_id)

        result = self.collection.update_one(
            {'user_id': user_obj_id},
            {
                '$set': {
                    'skill_summary': skill_summary,
                    'total_credentials': total_credentials,
                    'average_skill_score': round(average_score, 2),
                    'updated_at': datetime.utcnow()
                }
            }
        )

        # Update completeness after skill changes
        if result.modified_count > 0:
            self.update_profile_completeness(user_id)

        return result.modified_count > 0

    def add_employment_record(self, user_id: str, employer_id: str, job_data: Dict) -> bool:
        """
        Add employment record to user profile

        Args:
            user_id: User auth ID
            employer_id: Employer user ID
            job_data: Job details

        Returns:
            True if added
        """
        user_obj_id = get_object_id(user_id)
        employer_obj_id = get_object_id(employer_id)

        if not user_obj_id or not employer_obj_id:
            return False

        employment_record = UserProfileModel.add_employment_record(
            employer_id=employer_obj_id,
            company_name=job_data.get('company_name', ''),
            role=job_data.get('role', ''),
            start_date=job_data.get('start_date', datetime.utcnow()),
            end_date=job_data.get('end_date'),
            rating=job_data.get('rating')
        )

        result = self.collection.update_one(
            {'user_id': user_obj_id},
            {
                '$push': {'employment_history': employment_record},
                '$set': {'updated_at': datetime.utcnow()}
            }
        )

        # Recalculate average employer rating
        if result.modified_count > 0:
            self._update_average_employer_rating(user_id)

        return result.modified_count > 0

    def _update_average_employer_rating(self, user_id: str) -> bool:
        """Update average employer rating"""
        profile = self.get_profile_by_user_id(user_id)

        if not profile:
            return False

        employment_history = profile.get('employment_history', [])
        ratings = [emp.get('rating') for emp in employment_history if emp.get('rating') is not None]

        average_rating = sum(ratings) / len(ratings) if ratings else 0

        user_obj_id = get_object_id(user_id)

        result = self.collection.update_one(
            {'user_id': user_obj_id},
            {'$set': {'average_employer_rating': round(average_rating, 2)}}
        )

        return result.modified_count > 0

    def get_public_profile(self, user_id: str) -> Optional[Dict]:
        """
        Get public view of user profile

        Args:
            user_id: User auth ID

        Returns:
            Public profile or None
        """
        profile = self.get_profile_by_user_id(user_id)

        if not profile:
            return None

        return UserProfileModel.create_public_view(profile)

    def search_learners(
        self,
        skills: List[str] = None,
        min_score: int = 0,
        experience_level: str = None,
        location: str = None,
        looking_for_job: bool = None,
        page: int = 1,
        limit: int = 20
    ) -> Dict:
        """
        Search for learners with specific criteria

        Args:
            skills: List of required skills
            min_score: Minimum average skill score
            experience_level: Experience level filter
            location: Location filter
            looking_for_job: Only show job seekers
            page: Page number
            limit: Results per page

        Returns:
            Paginated search results
        """
        query = {'user_type': 'learner'}

        if skills:
            # Match users who have all required skills
            query['skill_summary'] = {'$all': [{'$elemMatch': {'skill': skill}} for skill in skills]}

        if min_score > 0:
            query['average_skill_score'] = {'$gte': min_score}

        if experience_level:
            query['professional_info.experience_level'] = experience_level

        if location:
            query['location'] = {'$regex': location, '$options': 'i'}

        if looking_for_job is not None:
            query['professional_info.looking_for_job'] = looking_for_job

        # Only show public profiles
        query['profile_visibility'] = {'$in': ['public', 'employers_only']}

        return paginate_query(
            self.collection,
            query,
            page=page,
            limit=limit,
            sort_by='average_skill_score',
            sort_order=-1
        )

    def update_learning_stats(self, user_id: str, assessment_data: Dict) -> bool:
        """
        Update learning statistics after assessment

        Args:
            user_id: User auth ID
            assessment_data: Assessment details

        Returns:
            True if updated
        """
        user_obj_id = get_object_id(user_id)

        if not user_obj_id:
            return False

        passed = assessment_data.get('status') == 'verified'

        result = self.collection.update_one(
            {'user_id': user_obj_id},
            {
                '$inc': {
                    'learning_stats.assessments_taken': 1,
                    'learning_stats.assessments_passed': 1 if passed else 0
                },
                '$set': {
                    'learning_stats.last_assessment_date': datetime.utcnow(),
                    'updated_at': datetime.utcnow()
                }
            }
        )

        return result.modified_count > 0

    def delete_profile(self, user_id: str) -> bool:
        """
        Delete user profile (soft delete - mark as inactive)

        Args:
            user_id: User auth ID

        Returns:
            True if deleted
        """
        user_obj_id = get_object_id(user_id)

        if not user_obj_id:
            return False

        result = self.collection.update_one(
            {'user_id': user_obj_id},
            {
                '$set': {
                    'profile_visibility': 'private',
                    'metadata.profile_active': False,
                    'updated_at': datetime.utcnow()
                }
            }
        )

        return result.modified_count > 0


# Singleton instance
user_profile_service = UserProfileService()
