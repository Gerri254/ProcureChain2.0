"""Challenge API Routes"""
from flask import Blueprint, request
from services.challenge_service import challenge_service
from middleware.auth import token_required, admin_required
from utils.response import success_response, error_response

challenges_bp = Blueprint('challenges', __name__)


@challenges_bp.route('', methods=['GET'])
def get_challenges():
    """
    Get challenges with optional filtering
    Query params: skill, difficulty_level, challenge_type, page, per_page
    """
    try:
        skill = request.args.get('skill')
        difficulty_level = request.args.get('difficulty_level')
        challenge_type = request.args.get('challenge_type')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))

        result = challenge_service.get_challenges(
            skill=skill,
            difficulty_level=difficulty_level,
            challenge_type=challenge_type,
            page=page,
            per_page=per_page
        )

        return success_response(
            data=result,
            message='Challenges retrieved successfully'
        )

    except Exception as e:
        return error_response(f'Error fetching challenges: {str(e)}', 500)


@challenges_bp.route('/<challenge_id>', methods=['GET'])
def get_challenge(challenge_id):
    """Get single challenge by ID (public view)"""
    try:
        # Get query param to include answers (for post-assessment review)
        include_answers = request.args.get('include_answers', 'false').lower() == 'true'

        challenge = challenge_service.get_public_challenge(challenge_id, include_answers)

        if not challenge:
            return error_response('Challenge not found', 404)

        return success_response(data=challenge)

    except Exception as e:
        return error_response(f'Error fetching challenge: {str(e)}', 500)


@challenges_bp.route('/random', methods=['GET'])
def get_random_challenge():
    """
    Get a random challenge for assessment
    Query params: skill (required), difficulty_level (required)
    """
    try:
        skill = request.args.get('skill')
        difficulty_level = request.args.get('difficulty_level')

        if not skill or not difficulty_level:
            return error_response('skill and difficulty_level are required', 400)

        challenge = challenge_service.get_random_challenge(skill, difficulty_level)

        if not challenge:
            return error_response(
                f'No challenges found for {skill} - {difficulty_level}',
                404
            )

        # Return public view
        public_challenge = challenge_service.get_public_challenge(str(challenge['_id']))

        return success_response(data=public_challenge)

    except Exception as e:
        return error_response(f'Error fetching random challenge: {str(e)}', 500)


@challenges_bp.route('/search', methods=['GET'])
def search_challenges():
    """
    Search challenges by title/description
    Query params: q (search term), page, per_page
    """
    try:
        search_term = request.args.get('q', '')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))

        if not search_term:
            return error_response('Search term (q) is required', 400)

        result = challenge_service.search_challenges(
            search_term=search_term,
            page=page,
            per_page=per_page
        )

        return success_response(
            data=result,
            message=f'Found {result["total"]} challenges'
        )

    except Exception as e:
        return error_response(f'Error searching challenges: {str(e)}', 500)


@challenges_bp.route('/stats', methods=['GET'])
def get_challenge_stats():
    """Get overall challenge statistics"""
    try:
        stats = challenge_service.get_challenge_stats()

        return success_response(data=stats)

    except Exception as e:
        return error_response(f'Error fetching stats: {str(e)}', 500)


# ========== ADMIN ROUTES ==========

@challenges_bp.route('', methods=['POST'])
@token_required
@admin_required
def create_challenge(current_user):
    """Create new challenge (admin only)"""
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['title', 'description', 'skill', 'difficulty_level', 'prompt']
        for field in required_fields:
            if field not in data:
                return error_response(f'Missing required field: {field}', 400)

        # Add creator info
        data['created_by'] = str(current_user['_id'])

        challenge_id = challenge_service.create_challenge(data)

        if not challenge_id:
            return error_response('Failed to create challenge', 500)

        return success_response(
            data={'challenge_id': challenge_id},
            message='Challenge created successfully',
            status_code=201
        )

    except Exception as e:
        return error_response(f'Error creating challenge: {str(e)}', 500)


@challenges_bp.route('/<challenge_id>', methods=['PUT'])
@token_required
@admin_required
def update_challenge(current_user, challenge_id):
    """Update challenge (admin only)"""
    try:
        data = request.get_json()

        success = challenge_service.update_challenge(challenge_id, data)

        if not success:
            return error_response('Failed to update challenge', 500)

        return success_response(message='Challenge updated successfully')

    except Exception as e:
        return error_response(f'Error updating challenge: {str(e)}', 500)


@challenges_bp.route('/<challenge_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_challenge(current_user, challenge_id):
    """Soft delete challenge (admin only)"""
    try:
        success = challenge_service.delete_challenge(challenge_id)

        if not success:
            return error_response('Failed to delete challenge', 500)

        return success_response(message='Challenge deleted successfully')

    except Exception as e:
        return error_response(f'Error deleting challenge: {str(e)}', 500)


@challenges_bp.route('/<challenge_id>/full', methods=['GET'])
@token_required
@admin_required
def get_full_challenge(current_user, challenge_id):
    """Get full challenge data including answers (admin only)"""
    try:
        challenge = challenge_service.get_challenge_by_id(challenge_id)

        if not challenge:
            return error_response('Challenge not found', 404)

        return success_response(data=challenge)

    except Exception as e:
        return error_response(f'Error fetching challenge: {str(e)}', 500)
