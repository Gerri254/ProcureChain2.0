"""Skill Assessment API routes"""
from flask import Blueprint, request, g
from services.skill_assessment_service import skill_assessment_service
from middleware.auth import token_required, optional_auth
from utils.response import success_response, error_response, not_found_response, validation_error_response
from utils.validators import validate_required_fields
from models.skill_assessment import SkillAssessmentModel

skill_assessment_bp = Blueprint('skill_assessments', __name__, url_prefix='/api/assessments')


@skill_assessment_bp.route('', methods=['POST'])
@token_required
def create_assessment():
    """Create new skill assessment"""
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['skill', 'challenge_id']
        is_valid, missing = validate_required_fields(data, required_fields)

        if not is_valid:
            return validation_error_response({'missing_fields': missing})

        # Validate skill
        if not SkillAssessmentModel.validate_skill(data['skill']):
            return validation_error_response({
                'skill': f'Invalid skill. Must be one of: {SkillAssessmentModel.VALID_SKILLS}'
            })

        # Validate difficulty if provided
        if data.get('difficulty_level') and not SkillAssessmentModel.validate_difficulty(data['difficulty_level']):
            return validation_error_response({
                'difficulty_level': f'Invalid difficulty. Must be one of: {SkillAssessmentModel.VALID_DIFFICULTY_LEVELS}'
            })

        # Create assessment
        assessment_id = skill_assessment_service.create_assessment(data, user_id=g.user_id)

        return success_response(
            {'assessment_id': assessment_id},
            message='Assessment created successfully. You can now submit your code.',
            status_code=201
        )

    except Exception as e:
        print(f"Error creating assessment: {e}")
        return error_response('Failed to create assessment', status_code=500)


@skill_assessment_bp.route('/<assessment_id>', methods=['GET'])
@token_required
def get_assessment(assessment_id):
    """Get specific assessment"""
    try:
        assessment = skill_assessment_service.get_assessment_by_id(assessment_id)

        if not assessment:
            return not_found_response('Assessment')

        # Users can only view their own assessments (unless admin)
        if str(assessment.get('user_id')) != g.user_id and g.user_role != 'admin':
            return error_response('Unauthorized to view this assessment', status_code=403)

        return success_response(assessment)

    except Exception as e:
        print(f"Error fetching assessment: {e}")
        return error_response('Failed to fetch assessment', status_code=500)


@skill_assessment_bp.route('/<assessment_id>/submit', methods=['POST'])
@token_required
def submit_assessment_code(assessment_id):
    """Submit code for assessment"""
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['code_submitted']
        is_valid, missing = validate_required_fields(data, required_fields)

        if not is_valid:
            return validation_error_response({'missing_fields': missing})

        # Get assessment
        assessment = skill_assessment_service.get_assessment_by_id(assessment_id)

        if not assessment:
            return not_found_response('Assessment')

        # Verify ownership
        if str(assessment.get('user_id')) != g.user_id:
            return error_response('Unauthorized to submit for this assessment', status_code=403)

        # Check if already submitted
        if assessment.get('status') in ['verified', 'failed']:
            return error_response('Assessment already graded', status_code=400)

        # Submit code
        time_taken = data.get('time_taken_seconds', 0)
        success = skill_assessment_service.submit_assessment_code(
            assessment_id,
            data['code_submitted'],
            time_taken
        )

        if not success:
            return error_response('Failed to submit code')

        # Trigger AI analysis (async in production, sync for now)
        challenge_data = data.get('challenge_data', {})
        skill_assessment_service.analyze_with_ai(assessment_id, challenge_data)

        return success_response(
            message='Code submitted successfully. AI is analyzing your code...'
        )

    except Exception as e:
        print(f"Error submitting assessment: {e}")
        return error_response('Failed to submit assessment', status_code=500)


@skill_assessment_bp.route('/my-assessments', methods=['GET'])
@token_required
def get_my_assessments():
    """Get current user's assessments"""
    try:
        # Get query params
        status = request.args.get('status')

        assessments = skill_assessment_service.get_user_assessments(g.user_id, status=status)

        return success_response({
            'total': len(assessments),
            'assessments': assessments
        })

    except Exception as e:
        print(f"Error fetching user assessments: {e}")
        return error_response('Failed to fetch assessments', status_code=500)


@skill_assessment_bp.route('/my-skills', methods=['GET'])
@token_required
def get_my_verified_skills():
    """Get current user's verified skills"""
    try:
        verified_skills = skill_assessment_service.get_verified_skills(g.user_id)

        # Calculate summary stats
        total_credentials = len(verified_skills)
        average_score = sum(s.get('score', 0) for s in verified_skills) / total_credentials if total_credentials > 0 else 0

        return success_response({
            'total_credentials': total_credentials,
            'average_score': round(average_score, 2),
            'verified_skills': verified_skills
        })

    except Exception as e:
        print(f"Error fetching verified skills: {e}")
        return error_response('Failed to fetch verified skills', status_code=500)


@skill_assessment_bp.route('/statistics/<skill>', methods=['GET'])
@optional_auth
def get_skill_statistics(skill):
    """Get statistics for a specific skill"""
    try:
        # Validate skill
        if not SkillAssessmentModel.validate_skill(skill):
            return validation_error_response({
                'skill': 'Invalid skill'
            })

        stats = skill_assessment_service.get_skill_statistics(skill)

        return success_response(stats)

    except Exception as e:
        print(f"Error fetching skill statistics: {e}")
        return error_response('Failed to fetch statistics', status_code=500)


@skill_assessment_bp.route('/leaderboard', methods=['GET'])
@optional_auth
def get_leaderboard():
    """Get top scorers leaderboard"""
    try:
        skill = request.args.get('skill')
        limit = int(request.args.get('limit', 10))

        top_scorers = skill_assessment_service.get_top_scorers(skill=skill, limit=limit)

        # Create public view (hide personal details)
        leaderboard = []
        for idx, assessment in enumerate(top_scorers):
            leaderboard.append({
                'rank': idx + 1,
                'skill': assessment.get('skill'),
                'score': assessment.get('ai_analysis', {}).get('overall_score', 0),
                'verified_date': assessment.get('verified_date'),
                'difficulty_level': assessment.get('difficulty_level')
            })

        return success_response({
            'skill': skill if skill else 'all',
            'leaderboard': leaderboard
        })

    except Exception as e:
        print(f"Error fetching leaderboard: {e}")
        return error_response('Failed to fetch leaderboard', status_code=500)


@skill_assessment_bp.route('', methods=['GET'])
@token_required
def list_assessments():
    """List all assessments (admin only)"""
    try:
        # Only admins can see all assessments
        if g.user_role != 'admin':
            return error_response('Unauthorized', status_code=403)

        # Get query params
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        skill = request.args.get('skill')
        status = request.args.get('status')

        results = skill_assessment_service.list_assessments(
            page=page,
            limit=limit,
            skill=skill,
            status=status
        )

        return success_response(results)

    except Exception as e:
        print(f"Error listing assessments: {e}")
        return error_response('Failed to list assessments', status_code=500)
