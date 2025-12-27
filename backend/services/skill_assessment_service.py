"""Skill Assessment Service - handles assessment operations"""
from typing import Dict, List, Optional
from bson import ObjectId
from datetime import datetime
from config.database import db
from models.skill_assessment import SkillAssessmentModel
from utils.db_helpers import serialize_document, get_object_id, paginate_query
from services.gemini_code_analyzer import gemini_code_analyzer


class SkillAssessmentService:
    """Service for skill assessment operations"""

    def __init__(self):
        self.collection = db.skill_assessments

    def create_assessment(self, data: Dict, user_id: str) -> str:
        """
        Create new skill assessment submission

        Args:
            data: Assessment data
            user_id: User taking the assessment

        Returns:
            Assessment ID
        """
        # Add user_id to data
        data['user_id'] = get_object_id(user_id)

        # Create assessment record
        assessment = SkillAssessmentModel.create_schema(data)

        # Insert into database
        result = self.collection.insert_one(assessment)

        return str(result.inserted_id)

    def get_assessment_by_id(self, assessment_id: str) -> Optional[Dict]:
        """
        Get assessment by ID

        Args:
            assessment_id: Assessment ID

        Returns:
            Assessment record or None
        """
        obj_id = get_object_id(assessment_id)

        if not obj_id:
            return None

        assessment = self.collection.find_one({'_id': obj_id})

        return serialize_document(assessment)

    def update_assessment(self, assessment_id: str, data: Dict) -> bool:
        """
        Update assessment record

        Args:
            assessment_id: Assessment ID
            data: Update data

        Returns:
            True if updated, False otherwise
        """
        obj_id = get_object_id(assessment_id)

        if not obj_id:
            return False

        update_data = SkillAssessmentModel.update_schema(data)

        result = self.collection.update_one(
            {'_id': obj_id},
            {'$set': update_data}
        )

        return result.modified_count > 0

    def analyze_with_ai(self, assessment_id: str, challenge_data: Dict = None) -> bool:
        """
        Analyze submitted code using Gemini AI

        Args:
            assessment_id: Assessment ID
            challenge_data: Optional challenge data (prompt, test_cases)

        Returns:
            True if analysis successful
        """
        # Get assessment
        assessment = self.get_assessment_by_id(assessment_id)

        if not assessment:
            return False

        # Update status to processing
        self.collection.update_one(
            {'_id': get_object_id(assessment_id)},
            {'$set': {'status': 'processing'}}
        )

        try:
            # Get challenge details if not provided
            if not challenge_data:
                challenge_data = {
                    'prompt': 'Evaluate the submitted code',
                    'test_cases': []
                }

            # Run AI analysis
            ai_result = gemini_code_analyzer.analyze_code_submission(
                code=assessment.get('code_submitted', ''),
                skill=assessment.get('skill', ''),
                difficulty_level=assessment.get('difficulty_level', 'beginner'),
                challenge_prompt=challenge_data.get('prompt', ''),
                test_cases=challenge_data.get('test_cases', [])
            )

            # Determine status based on score
            overall_score = ai_result.get('overall_score', 0)
            new_status = 'verified' if overall_score >= 70 else 'failed'

            # Update assessment with AI analysis
            update_data = {
                'ai_analysis': ai_result,
                'status': new_status,
                'updated_at': datetime.utcnow()
            }

            if new_status == 'verified':
                update_data['verified_date'] = datetime.utcnow()

            result = self.collection.update_one(
                {'_id': get_object_id(assessment_id)},
                {'$set': update_data}
            )

            # If verified, sync with user profile
            if result.modified_count > 0 and new_status == 'verified':
                self._sync_with_user_profile(assessment_id, str(assessment.get('user_id')))

            return result.modified_count > 0

        except Exception as e:
            print(f"Error in AI analysis: {e}")
            # Mark as failed on error
            self.collection.update_one(
                {'_id': get_object_id(assessment_id)},
                {'$set': {'status': 'failed', 'updated_at': datetime.utcnow()}}
            )
            return False

    def get_user_assessments(self, user_id: str, status: str = None) -> List[Dict]:
        """
        Get all assessments for a user

        Args:
            user_id: User ID
            status: Optional status filter

        Returns:
            List of assessments
        """
        user_obj_id = get_object_id(user_id)

        if not user_obj_id:
            return []

        query = {'user_id': user_obj_id}

        if status:
            query['status'] = status

        assessments = self.collection.find(query).sort('created_at', -1)

        return serialize_document(list(assessments))

    def get_verified_skills(self, user_id: str) -> List[Dict]:
        """
        Get all verified skills for a user

        Args:
            user_id: User ID

        Returns:
            List of verified skill credentials
        """
        user_obj_id = get_object_id(user_id)

        if not user_obj_id:
            return []

        # Get verified assessments only
        assessments = self.collection.find({
            'user_id': user_obj_id,
            'status': 'verified',
            'is_expired': False
        }).sort('ai_analysis.overall_score', -1)

        verified_skills = []
        for assessment in assessments:
            credential = SkillAssessmentModel.create_credential_summary(assessment)
            verified_skills.append(credential)

        return verified_skills

    def submit_assessment_code(self, assessment_id: str, code: str, time_taken: int) -> bool:
        """
        Submit code for an assessment

        Args:
            assessment_id: Assessment ID
            code: Submitted code
            time_taken: Time taken in seconds

        Returns:
            True if submitted successfully
        """
        obj_id = get_object_id(assessment_id)

        if not obj_id:
            return False

        result = self.collection.update_one(
            {'_id': obj_id},
            {
                '$set': {
                    'code_submitted': code,
                    'submission_time': datetime.utcnow(),
                    'time_taken_seconds': time_taken,
                    'status': 'grading',  # Change status to grading
                    'updated_at': datetime.utcnow()
                }
            }
        )

        return result.modified_count > 0

    def update_ai_analysis(self, assessment_id: str, gemini_result: Dict) -> bool:
        """
        Update assessment with AI analysis results

        Args:
            assessment_id: Assessment ID
            gemini_result: Results from Gemini AI

        Returns:
            True if updated
        """
        obj_id = get_object_id(assessment_id)

        if not obj_id:
            return False

        # Get assessment to get user_id
        assessment = self.get_assessment_by_id(assessment_id)
        if not assessment:
            return False

        # Format AI analysis
        ai_analysis = SkillAssessmentModel.create_ai_analysis_schema(gemini_result)

        # Determine status based on score
        overall_score = ai_analysis.get('overall_score', 0)
        new_status = 'verified' if overall_score >= 70 else 'failed'

        result = self.collection.update_one(
            {'_id': obj_id},
            {
                '$set': {
                    'ai_analysis': ai_analysis,
                    'status': new_status,
                    'verified_date': datetime.utcnow() if new_status == 'verified' else None,
                    'updated_at': datetime.utcnow()
                }
            }
        )

        # If verified, update user profile
        if result.modified_count > 0 and new_status == 'verified':
            self._sync_with_user_profile(assessment_id, str(assessment.get('user_id')))

        return result.modified_count > 0

    def _sync_with_user_profile(self, assessment_id: str, user_id: str) -> None:
        """
        Sync verified assessment with user profile

        Args:
            assessment_id: Assessment ID
            user_id: User ID
        """
        try:
            from services.user_profile_service import user_profile_service

            # Get updated assessment
            assessment = self.get_assessment_by_id(assessment_id)

            if not assessment:
                return

            # Add verified skill to profile
            user_profile_service.add_verified_skill(user_id, assessment)

            # Update learning stats
            user_profile_service.update_learning_stats(user_id, assessment)

        except Exception as e:
            print(f"Warning: Failed to sync assessment with profile: {e}")

    def list_assessments(
        self,
        page: int = 1,
        limit: int = 20,
        skill: str = None,
        status: str = None,
        user_id: str = None
    ) -> Dict:
        """
        List assessments with pagination and filters

        Args:
            page: Page number
            limit: Results per page
            skill: Filter by skill
            status: Filter by status
            user_id: Filter by user

        Returns:
            Paginated results
        """
        query = {}

        if skill:
            query['skill'] = skill

        if status:
            query['status'] = status

        if user_id:
            user_obj_id = get_object_id(user_id)
            if user_obj_id:
                query['user_id'] = user_obj_id

        return paginate_query(
            self.collection,
            query,
            page=page,
            limit=limit,
            sort_by='created_at',
            sort_order=-1
        )

    def get_skill_statistics(self, skill: str) -> Dict:
        """
        Get statistics for a specific skill

        Args:
            skill: Skill name

        Returns:
            Statistics dictionary
        """
        pipeline = [
            {
                '$match': {
                    'skill': skill,
                    'status': 'verified'
                }
            },
            {
                '$group': {
                    '_id': None,
                    'total_assessments': {'$sum': 1},
                    'average_score': {'$avg': '$ai_analysis.overall_score'},
                    'highest_score': {'$max': '$ai_analysis.overall_score'},
                    'lowest_score': {'$min': '$ai_analysis.overall_score'},
                    'average_time': {'$avg': '$time_taken_seconds'}
                }
            }
        ]

        results = list(self.collection.aggregate(pipeline))

        if not results:
            return {
                'skill': skill,
                'total_assessments': 0,
                'average_score': 0,
                'highest_score': 0,
                'lowest_score': 0,
                'average_time_minutes': 0
            }

        result = results[0]
        return {
            'skill': skill,
            'total_assessments': result.get('total_assessments', 0),
            'average_score': round(result.get('average_score', 0), 2),
            'highest_score': round(result.get('highest_score', 0), 2),
            'lowest_score': round(result.get('lowest_score', 0), 2),
            'average_time_minutes': round(result.get('average_time', 0) / 60, 2)
        }

    def check_and_expire_credentials(self) -> int:
        """
        Check all credentials and expire those past expiration date

        Returns:
            Number of credentials expired
        """
        result = self.collection.update_many(
            {
                'expires_at': {'$lt': datetime.utcnow()},
                'is_expired': False
            },
            {
                '$set': {
                    'is_expired': True,
                    'updated_at': datetime.utcnow()
                }
            }
        )

        return result.modified_count

    def get_top_scorers(self, skill: str = None, limit: int = 10) -> List[Dict]:
        """
        Get top scorers for a skill

        Args:
            skill: Optional skill filter
            limit: Number of results

        Returns:
            List of top scoring assessments
        """
        query = {'status': 'verified', 'is_expired': False}

        if skill:
            query['skill'] = skill

        assessments = self.collection.find(query).sort(
            'ai_analysis.overall_score', -1
        ).limit(limit)

        return serialize_document(list(assessments))


# Singleton instance
skill_assessment_service = SkillAssessmentService()
