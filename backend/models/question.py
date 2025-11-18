"""
Question and Answer Model

Manages public Q&A for procurements to enable citizen engagement
"""

from datetime import datetime
from typing import Dict, Any, Optional
from bson import ObjectId


class QuestionModel:
    """Model for procurement questions and answers"""

    @staticmethod
    def create_schema(procurement_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a question schema for insertion

        Args:
            procurement_id: The procurement this question is about
            data: Question data including question text, author info

        Returns:
            Complete question document
        """
        now = datetime.utcnow()

        schema = {
            'procurement_id': ObjectId(procurement_id),
            'question': data.get('question', '').strip(),
            'asked_by': data.get('asked_by', 'Anonymous'),
            'asked_by_email': data.get('asked_by_email'),
            'asked_by_user_id': ObjectId(data['asked_by_user_id']) if data.get('asked_by_user_id') else None,
            'answer': None,
            'answered_by': None,
            'answered_by_user_id': None,
            'answered_at': None,
            'status': 'pending',  # pending, answered, archived
            'is_public': data.get('is_public', True),
            'upvotes': 0,
            'downvotes': 0,
            'created_at': now,
            'updated_at': now,
        }

        return schema

    @staticmethod
    def answer_schema(answer_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create answer update schema

        Args:
            answer_data: Answer text and metadata

        Returns:
            Update document for answering
        """
        now = datetime.utcnow()

        return {
            '$set': {
                'answer': answer_data.get('answer', '').strip(),
                'answered_by': answer_data.get('answered_by'),
                'answered_by_user_id': ObjectId(answer_data['answered_by_user_id']) if answer_data.get('answered_by_user_id') else None,
                'answered_at': now,
                'status': 'answered',
                'updated_at': now,
            }
        }

    @staticmethod
    def validate_question(data: Dict[str, Any]) -> tuple[bool, Optional[str]]:
        """
        Validate question data

        Returns:
            (is_valid, error_message)
        """
        question = data.get('question', '').strip()

        if not question:
            return False, 'Question text is required'

        if len(question) < 10:
            return False, 'Question must be at least 10 characters'

        if len(question) > 1000:
            return False, 'Question cannot exceed 1000 characters'

        # Check for asked_by
        if not data.get('asked_by') and not data.get('asked_by_user_id'):
            return False, 'Questioner name is required'

        return True, None

    @staticmethod
    def validate_answer(data: Dict[str, Any]) -> tuple[bool, Optional[str]]:
        """
        Validate answer data

        Returns:
            (is_valid, error_message)
        """
        answer = data.get('answer', '').strip()

        if not answer:
            return False, 'Answer text is required'

        if len(answer) < 10:
            return False, 'Answer must be at least 10 characters'

        if len(answer) > 2000:
            return False, 'Answer cannot exceed 2000 characters'

        if not data.get('answered_by_user_id'):
            return False, 'Answerer user ID is required'

        return True, None
