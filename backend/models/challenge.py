"""Challenge data models for skill assessments"""
from datetime import datetime
from typing import Dict, List, Optional
from bson import ObjectId


class ChallengeModel:
    """Model for coding challenge records"""

    VALID_SKILLS = [
        'react', 'python', 'javascript', 'typescript', 'nodejs',
        'mongodb', 'sql', 'html_css', 'java', 'cpp', 'golang', 'rust', 'other'
    ]
    VALID_DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert']
    VALID_TYPES = ['coding', 'multiple_choice', 'project', 'debugging']

    @staticmethod
    def create_schema(data: Dict) -> Dict:
        """
        Create challenge record schema

        Args:
            data: Challenge data

        Returns:
            Validated challenge record
        """
        now = datetime.utcnow()

        return {
            'challenge_id': data.get('challenge_id'),  # Unique identifier
            'title': data.get('title', ''),
            'description': data.get('description', ''),
            'skill': data.get('skill', 'other'),
            'difficulty_level': data.get('difficulty_level', 'beginner'),
            'challenge_type': data.get('challenge_type', 'coding'),

            # Challenge Content
            'prompt': data.get('prompt', ''),  # What user needs to do
            'starter_code': data.get('starter_code', ''),  # Optional starter code
            'test_cases': data.get('test_cases', []),  # For automated testing
            'expected_concepts': data.get('expected_concepts', []),  # What AI should look for

            # For multiple choice
            'options': data.get('options', []),  # {option: str, is_correct: bool}
            'correct_answer': data.get('correct_answer', ''),

            # Grading Criteria
            'grading_rubric': {
                'code_quality_weight': data.get('code_quality_weight', 0.3),
                'correctness_weight': data.get('correctness_weight', 0.4),
                'efficiency_weight': data.get('efficiency_weight', 0.2),
                'best_practices_weight': data.get('best_practices_weight', 0.1)
            },

            # Time Constraints
            'time_limit_minutes': data.get('time_limit_minutes', 30),
            'estimated_time_minutes': data.get('estimated_time_minutes', 20),

            # Metadata
            'metadata': {
                'created_by': data.get('created_by'),  # Educator who created
                'approved': data.get('approved', False),
                'times_used': 0,
                'average_score': 0,
                'average_completion_time': 0,
                'pass_rate': 0,  # Percentage of users who passed
                'tags': data.get('tags', [])
            },

            # Status
            'is_active': data.get('is_active', True),
            'is_public': data.get('is_public', True),

            # Timestamps
            'created_at': now,
            'updated_at': now
        }

    @staticmethod
    def create_test_case(input_data: str, expected_output: str, description: str = '') -> Dict:
        """
        Create a test case for automated grading

        Args:
            input_data: Input for the test
            expected_output: Expected output
            description: Description of what this tests

        Returns:
            Test case dictionary
        """
        return {
            'input': input_data,
            'expected_output': expected_output,
            'description': description,
            'is_hidden': False  # Hidden test cases not shown to user
        }

    @staticmethod
    def update_usage_stats(challenge: Dict, score: int, completion_time_minutes: int) -> Dict:
        """
        Update challenge usage statistics after someone takes it

        Args:
            challenge: Challenge record
            score: Score achieved
            completion_time_minutes: Time taken

        Returns:
            Updated metadata
        """
        metadata = challenge.get('metadata', {})
        times_used = metadata.get('times_used', 0)
        avg_score = metadata.get('average_score', 0)
        avg_time = metadata.get('average_completion_time', 0)
        pass_rate = metadata.get('pass_rate', 0)

        # Calculate new averages
        new_times_used = times_used + 1
        new_avg_score = ((avg_score * times_used) + score) / new_times_used
        new_avg_time = ((avg_time * times_used) + completion_time_minutes) / new_times_used

        # Update pass rate (score >= 70 is passing)
        passed = 1 if score >= 70 else 0
        total_passed = (pass_rate * times_used / 100) + passed
        new_pass_rate = (total_passed / new_times_used) * 100

        return {
            'times_used': new_times_used,
            'average_score': round(new_avg_score, 2),
            'average_completion_time': round(new_avg_time, 2),
            'pass_rate': round(new_pass_rate, 2)
        }

    @staticmethod
    def validate_skill(skill: str) -> bool:
        """Validate skill type"""
        return skill in ChallengeModel.VALID_SKILLS

    @staticmethod
    def validate_difficulty(difficulty: str) -> bool:
        """Validate difficulty level"""
        return difficulty in ChallengeModel.VALID_DIFFICULTY_LEVELS

    @staticmethod
    def validate_type(challenge_type: str) -> bool:
        """Validate challenge type"""
        return challenge_type in ChallengeModel.VALID_TYPES

    @staticmethod
    def create_public_view(challenge: Dict, include_answers: bool = False) -> Dict:
        """
        Create public view of challenge (for users taking assessment)

        Args:
            challenge: Full challenge record
            include_answers: Whether to include correct answers (False for active assessments)

        Returns:
            Public-safe challenge record
        """
        public_data = {
            'challenge_id': challenge.get('challenge_id'),
            'title': challenge.get('title'),
            'description': challenge.get('description'),
            'skill': challenge.get('skill'),
            'difficulty_level': challenge.get('difficulty_level'),
            'challenge_type': challenge.get('challenge_type'),
            'prompt': challenge.get('prompt'),
            'starter_code': challenge.get('starter_code', ''),
            'time_limit_minutes': challenge.get('time_limit_minutes'),
            'estimated_time_minutes': challenge.get('estimated_time_minutes'),
            'metadata': {
                'times_used': challenge.get('metadata', {}).get('times_used', 0),
                'average_score': challenge.get('metadata', {}).get('average_score', 0),
                'pass_rate': challenge.get('metadata', {}).get('pass_rate', 0)
            }
        }

        # Include options for multiple choice (but not correct answer unless specified)
        if challenge.get('challenge_type') == 'multiple_choice':
            if include_answers:
                public_data['options'] = challenge.get('options', [])
                public_data['correct_answer'] = challenge.get('correct_answer', '')
            else:
                # Don't include which is correct
                public_data['options'] = [
                    {'option': opt.get('option'), 'id': opt.get('id')}
                    for opt in challenge.get('options', [])
                ]

        return public_data
