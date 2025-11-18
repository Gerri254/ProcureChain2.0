"""
Question Routes

Public Q&A endpoints for procurements
"""

from flask import Blueprint, request, g
from middleware.auth import token_required, role_required, optional_auth
from services.question_service import question_service
from utils.response import success_response, error_response

questions_bp = Blueprint('questions', __name__, url_prefix='/api/questions')


@questions_bp.route('/procurement/<procurement_id>', methods=['GET'])
def get_procurement_questions(procurement_id):
    """
    Get all questions for a procurement (public endpoint)
    Query params: include_pending (default: true)
    """
    try:
        include_pending = request.args.get('include_pending', 'true').lower() == 'true'
        questions = question_service.get_procurement_questions(
            procurement_id,
            include_pending=include_pending
        )

        return success_response(
            data=questions,
            message=f'Retrieved {len(questions)} questions'
        )
    except Exception as e:
        return error_response(f'Failed to retrieve questions: {str(e)}', 500)


@questions_bp.route('/procurement/<procurement_id>', methods=['POST'])
@optional_auth
def create_question(procurement_id):
    """
    Create a new question (public endpoint, authentication optional)
    """
    try:
        data = request.get_json()

        # Add user info if authenticated
        if hasattr(g, 'current_user') and g.current_user:
            data['asked_by'] = g.current_user.get('full_name', 'Anonymous')
            data['asked_by_email'] = g.current_user.get('email')
            data['asked_by_user_id'] = str(g.current_user['_id'])
        else:
            # Public user must provide name
            if not data.get('asked_by'):
                return error_response('Name is required for anonymous questions', 400)

        question = question_service.create_question(procurement_id, data)

        return success_response(
            data=question,
            message='Question submitted successfully',
            status_code=201
        )
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response(f'Failed to create question: {str(e)}', 500)


@questions_bp.route('/<question_id>/answer', methods=['POST'])
@token_required
@role_required(['admin', 'procurement_officer'])
def answer_question(question_id):
    """
    Answer a question (procurement officers and admins only)
    """
    try:
        data = request.get_json()
        data['answered_by'] = g.current_user.get('full_name', 'Official')

        question = question_service.answer_question(
            question_id,
            data,
            str(g.current_user['_id'])
        )

        return success_response(
            data=question,
            message='Question answered successfully'
        )
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response(f'Failed to answer question: {str(e)}', 500)


@questions_bp.route('/<question_id>', methods=['GET'])
def get_question(question_id):
    """Get a single question by ID (public endpoint)"""
    try:
        question = question_service.get_question_by_id(question_id)

        if not question:
            return error_response('Question not found', 404)

        return success_response(
            data=question,
            message='Question retrieved successfully'
        )
    except Exception as e:
        return error_response(f'Failed to retrieve question: {str(e)}', 500)


@questions_bp.route('/pending', methods=['GET'])
@token_required
@role_required(['admin', 'procurement_officer', 'auditor'])
def get_pending_questions():
    """
    Get all pending questions (authenticated users only)
    Query params: limit (default: 50)
    """
    try:
        limit = request.args.get('limit', 50, type=int)
        questions = question_service.get_pending_questions(limit=limit)

        return success_response(
            data=questions,
            message=f'Retrieved {len(questions)} pending questions'
        )
    except Exception as e:
        return error_response(f'Failed to retrieve pending questions: {str(e)}', 500)


@questions_bp.route('/<question_id>/upvote', methods=['POST'])
def upvote_question(question_id):
    """Upvote a question (public endpoint)"""
    try:
        question = question_service.upvote_question(question_id)

        return success_response(
            data=question,
            message='Question upvoted'
        )
    except ValueError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(f'Failed to upvote question: {str(e)}', 500)


@questions_bp.route('/<question_id>/downvote', methods=['POST'])
def downvote_question(question_id):
    """Downvote a question (public endpoint)"""
    try:
        question = question_service.downvote_question(question_id)

        return success_response(
            data=question,
            message='Question downvoted'
        )
    except ValueError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(f'Failed to downvote question: {str(e)}', 500)


@questions_bp.route('/<question_id>/archive', methods=['POST'])
@token_required
@role_required(['admin', 'procurement_officer'])
def archive_question(question_id):
    """Archive a question (hide from public view)"""
    try:
        question = question_service.archive_question(question_id)

        return success_response(
            data=question,
            message='Question archived'
        )
    except ValueError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(f'Failed to archive question: {str(e)}', 500)


@questions_bp.route('/user/my-questions', methods=['GET'])
@token_required
def get_my_questions():
    """Get all questions asked by the current user"""
    try:
        questions = question_service.get_user_questions(str(g.current_user['_id']))

        return success_response(
            data=questions,
            message=f'Retrieved {len(questions)} questions'
        )
    except Exception as e:
        return error_response(f'Failed to retrieve your questions: {str(e)}', 500)
