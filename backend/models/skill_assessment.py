"""Skill Assessment data models and business logic"""
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from bson import ObjectId


class SkillAssessmentModel:
    """Model for skill assessment records"""

    VALID_STATUSES = ['pending', 'grading', 'verified', 'failed', 'expired']
    VALID_SKILLS = [
        'react',
        'python',
        'javascript',
        'typescript',
        'nodejs',
        'mongodb',
        'sql',
        'html_css',
        'java',
        'cpp',
        'golang',
        'rust',
        'other'
    ]
    VALID_DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert']

    # Skill decay periods (in days) - credentials expire after this period
    SKILL_DECAY_PERIODS = {
        'react': 730,  # 2 years (framework changes fast)
        'python': 1095,  # 3 years
        'javascript': 730,  # 2 years
        'typescript': 730,  # 2 years
        'nodejs': 730,  # 2 years
        'mongodb': 1095,  # 3 years
        'sql': 1460,  # 4 years (stable)
        'html_css': 1095,  # 3 years
        'java': 1460,  # 4 years (stable)
        'cpp': 1460,  # 4 years
        'golang': 1095,  # 3 years
        'rust': 1095,  # 3 years
        'other': 730  # 2 years default
    }

    @staticmethod
    def create_schema(data: Dict) -> Dict:
        """
        Create skill assessment record schema

        Args:
            data: Assessment data

        Returns:
            Validated assessment record
        """
        now = datetime.utcnow()
        skill = data.get('skill', 'other')

        # Calculate expiration date based on skill type
        decay_period = SkillAssessmentModel.SKILL_DECAY_PERIODS.get(skill, 730)
        expires_at = now + timedelta(days=decay_period)

        return {
            'assessment_id': data.get('assessment_id'),  # Unique identifier
            'skill': skill,
            'difficulty_level': data.get('difficulty_level', 'beginner'),
            'challenge_id': data.get('challenge_id'),  # Reference to challenge used
            'user_id': data.get('user_id'),  # Who took this assessment
            'status': data.get('status', 'pending'),

            # Submitted work
            'code_submitted': data.get('code_submitted', ''),
            'submission_time': data.get('submission_time', now),
            'time_taken_seconds': data.get('time_taken_seconds', 0),

            # AI Analysis results
            'ai_analysis': {
                'analyzed': data.get('ai_analyzed', False),
                'analysis_date': data.get('ai_analysis_date'),
                'overall_score': data.get('overall_score', 0),  # 0-100
                'sub_scores': data.get('sub_scores', {}),  # Detailed breakdown
                'feedback': data.get('feedback', ''),
                'strengths': data.get('strengths', []),
                'weaknesses': data.get('weaknesses', []),
                'cheating_probability': data.get('cheating_probability', 0),
                'confidence_level': data.get('confidence_level', 0)
            },

            # Assessment metadata
            'metadata': {
                'ip_address': data.get('ip_address', ''),
                'user_agent': data.get('user_agent', ''),
                'screen_recording_url': data.get('screen_recording_url'),
                'attempt_number': data.get('attempt_number', 1)
            },

            # Validity
            'verified_date': data.get('verified_date'),
            'expires_at': expires_at,
            'is_expired': False,

            # Timestamps
            'created_at': now,
            'updated_at': now
        }

    @staticmethod
    def update_schema(data: Dict) -> Dict:
        """
        Create update schema for assessment record

        Args:
            data: Update data

        Returns:
            Update dictionary
        """
        update_fields = {}

        # Updateable fields
        updateable_fields = [
            'status', 'code_submitted', 'time_taken_seconds',
            'ai_analysis', 'verified_date', 'is_expired'
        ]

        for field in updateable_fields:
            if field in data and data[field] is not None:
                update_fields[field] = data[field]

        # Always update timestamp
        update_fields['updated_at'] = datetime.utcnow()

        return update_fields

    @staticmethod
    def validate_status(status: str) -> bool:
        """Validate assessment status"""
        return status in SkillAssessmentModel.VALID_STATUSES

    @staticmethod
    def validate_skill(skill: str) -> bool:
        """Validate skill type"""
        return skill in SkillAssessmentModel.VALID_SKILLS

    @staticmethod
    def validate_difficulty(difficulty: str) -> bool:
        """Validate difficulty level"""
        return difficulty in SkillAssessmentModel.VALID_DIFFICULTY_LEVELS

    @staticmethod
    def create_ai_analysis_schema(gemini_result: Dict) -> Dict:
        """
        Create AI analysis schema from Gemini API result

        Args:
            gemini_result: Result from Gemini API

        Returns:
            Formatted AI analysis
        """
        return {
            'analyzed': True,
            'analysis_date': datetime.utcnow(),
            'overall_score': gemini_result.get('overall_score', 0),
            'sub_scores': gemini_result.get('sub_skills', {}),
            'feedback': gemini_result.get('feedback', ''),
            'strengths': gemini_result.get('strengths', []),
            'weaknesses': gemini_result.get('weaknesses', []),
            'cheating_probability': gemini_result.get('cheating_probability', 0),
            'confidence_level': gemini_result.get('confidence', 0)
        }

    @staticmethod
    def check_expiration(assessment: Dict) -> bool:
        """
        Check if assessment credential has expired

        Args:
            assessment: Assessment record

        Returns:
            True if expired, False otherwise
        """
        if not assessment.get('expires_at'):
            return False

        return datetime.utcnow() > assessment['expires_at']

    @staticmethod
    def create_credential_summary(assessment: Dict) -> Dict:
        """
        Create summary credential for user profile display

        Args:
            assessment: Full assessment record

        Returns:
            Credential summary
        """
        ai_analysis = assessment.get('ai_analysis', {})

        return {
            'credential_id': str(assessment.get('_id')),
            'skill': assessment.get('skill'),
            'score': ai_analysis.get('overall_score', 0),
            'difficulty_level': assessment.get('difficulty_level'),
            'verified_date': assessment.get('verified_date'),
            'expires_at': assessment.get('expires_at'),
            'is_expired': assessment.get('is_expired', False),
            'status': assessment.get('status'),
            'strengths': ai_analysis.get('strengths', []),
            'badge_earned': ai_analysis.get('overall_score', 0) >= 70  # 70+ = badge
        }

    @staticmethod
    def create_public_view(assessment: Dict) -> Dict:
        """
        Create public view of assessment (for employers viewing candidates)

        Args:
            assessment: Full assessment record

        Returns:
            Public-safe assessment record
        """
        ai_analysis = assessment.get('ai_analysis', {})

        return {
            'skill': assessment.get('skill'),
            'difficulty_level': assessment.get('difficulty_level'),
            'overall_score': ai_analysis.get('overall_score', 0),
            'sub_scores': ai_analysis.get('sub_scores', {}),
            'strengths': ai_analysis.get('strengths', []),
            'verified_date': assessment.get('verified_date'),
            'expires_at': assessment.get('expires_at'),
            'is_expired': assessment.get('is_expired', False),
            'time_taken_seconds': assessment.get('time_taken_seconds', 0)
        }
