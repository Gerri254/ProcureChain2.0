"""
Question Service

Manages public Q&A functionality for procurements
"""

from typing import Dict, List, Any, Optional
from bson import ObjectId
from datetime import datetime
from config.database import db
from models.question import QuestionModel


class QuestionService:
    def __init__(self):
        self.collection = db.questions
        self.procurements = db.procurements

    def create_question(self, procurement_id: str, question_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new question for a procurement

        Args:
            procurement_id: The procurement ID
            question_data: Question details

        Returns:
            Created question document

        Raises:
            ValueError: If validation fails
        """
        # Validate procurement exists
        procurement = self.procurements.find_one({'_id': ObjectId(procurement_id)})
        if not procurement:
            raise ValueError('Procurement not found')

        # Validate question data
        is_valid, error = QuestionModel.validate_question(question_data)
        if not is_valid:
            raise ValueError(error)

        # Create question schema
        question_schema = QuestionModel.create_schema(procurement_id, question_data)

        # Insert into database
        result = self.collection.insert_one(question_schema)
        question_schema['_id'] = result.inserted_id

        return self._format_question(question_schema)

    def answer_question(
        self,
        question_id: str,
        answer_data: Dict[str, Any],
        user_id: str
    ) -> Dict[str, Any]:
        """
        Answer a question (procurement officers only)

        Args:
            question_id: Question ID
            answer_data: Answer details
            user_id: User providing the answer

        Returns:
            Updated question document

        Raises:
            ValueError: If validation fails or question not found
        """
        # Validate answer data
        answer_data['answered_by_user_id'] = user_id
        is_valid, error = QuestionModel.validate_answer(answer_data)
        if not is_valid:
            raise ValueError(error)

        # Update question
        update_schema = QuestionModel.answer_schema(answer_data)
        result = self.collection.find_one_and_update(
            {'_id': ObjectId(question_id)},
            update_schema,
            return_document=True
        )

        if not result:
            raise ValueError('Question not found')

        return self._format_question(result)

    def get_procurement_questions(
        self,
        procurement_id: str,
        include_pending: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Get all questions for a procurement

        Args:
            procurement_id: The procurement ID
            include_pending: Include unanswered questions

        Returns:
            List of question documents
        """
        query = {
            'procurement_id': ObjectId(procurement_id),
            'is_public': True
        }

        if not include_pending:
            query['status'] = 'answered'

        questions = list(self.collection.find(query).sort('created_at', -1))
        return [self._format_question(q) for q in questions]

    def get_question_by_id(self, question_id: str) -> Optional[Dict[str, Any]]:
        """Get a single question by ID"""
        question = self.collection.find_one({'_id': ObjectId(question_id)})
        return self._format_question(question) if question else None

    def get_pending_questions(self, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get all pending questions across all procurements

        Args:
            limit: Maximum number of questions to return

        Returns:
            List of pending questions
        """
        questions = list(
            self.collection.find({'status': 'pending', 'is_public': True})
            .sort('created_at', -1)
            .limit(limit)
        )
        return [self._format_question(q) for q in questions]

    def upvote_question(self, question_id: str) -> Dict[str, Any]:
        """Increase upvote count for a question"""
        result = self.collection.find_one_and_update(
            {'_id': ObjectId(question_id)},
            {'$inc': {'upvotes': 1}},
            return_document=True
        )

        if not result:
            raise ValueError('Question not found')

        return self._format_question(result)

    def downvote_question(self, question_id: str) -> Dict[str, Any]:
        """Increase downvote count for a question"""
        result = self.collection.find_one_and_update(
            {'_id': ObjectId(question_id)},
            {'$inc': {'downvotes': 1}},
            return_document=True
        )

        if not result:
            raise ValueError('Question not found')

        return self._format_question(result)

    def archive_question(self, question_id: str) -> Dict[str, Any]:
        """Archive a question (hide from public view)"""
        result = self.collection.find_one_and_update(
            {'_id': ObjectId(question_id)},
            {
                '$set': {
                    'status': 'archived',
                    'is_public': False,
                    'updated_at': datetime.utcnow()
                }
            },
            return_document=True
        )

        if not result:
            raise ValueError('Question not found')

        return self._format_question(result)

    def get_user_questions(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all questions asked by a specific user"""
        questions = list(
            self.collection.find({'asked_by_user_id': ObjectId(user_id)})
            .sort('created_at', -1)
        )
        return [self._format_question(q) for q in questions]

    def _format_question(self, question: Dict[str, Any]) -> Dict[str, Any]:
        """Format question for API response"""
        if not question:
            return None

        return {
            '_id': str(question['_id']),
            'procurement_id': str(question['procurement_id']),
            'question': question['question'],
            'asked_by': question['asked_by'],
            'asked_by_email': question.get('asked_by_email'),
            'asked_by_user_id': str(question['asked_by_user_id']) if question.get('asked_by_user_id') else None,
            'answer': question.get('answer'),
            'answered_by': question.get('answered_by'),
            'answered_by_user_id': str(question['answered_by_user_id']) if question.get('answered_by_user_id') else None,
            'answered_at': question.get('answered_at').isoformat() if question.get('answered_at') else None,
            'status': question['status'],
            'is_public': question.get('is_public', True),
            'upvotes': question.get('upvotes', 0),
            'downvotes': question.get('downvotes', 0),
            'created_at': question['created_at'].isoformat(),
            'updated_at': question['updated_at'].isoformat(),
        }


# Create service instance
question_service = QuestionService()
