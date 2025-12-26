"""User Profile API routes"""
from flask import Blueprint, request, g
from services.user_profile_service import user_profile_service
from middleware.auth import token_required, optional_auth
from utils.response import success_response, error_response, not_found_response, validation_error_response
from utils.validators import validate_required_fields

user_profile_bp = Blueprint('user_profiles', __name__, url_prefix='/api/profiles')


@user_profile_bp.route('/me', methods=['GET'])
@token_required
def get_my_profile():
    """Get current user's profile"""
    try:
        profile = user_profile_service.get_profile_by_user_id(g.user_id)

        if not profile:
            return not_found_response('Profile')

        return success_response(profile)

    except Exception as e:
        print(f"Error fetching profile: {e}")
        return error_response('Failed to fetch profile', status_code=500)


@user_profile_bp.route('/me', methods=['PUT'])
@token_required
def update_my_profile():
    """Update current user's profile"""
    try:
        data = request.get_json()

        # Check if profile exists
        existing_profile = user_profile_service.get_profile_by_user_id(g.user_id)

        if not existing_profile:
            return not_found_response('Profile')

        # Update profile
        success = user_profile_service.update_profile(g.user_id, data)

        if not success:
            return error_response('Failed to update profile')

        # Get updated profile
        updated_profile = user_profile_service.get_profile_by_user_id(g.user_id)

        return success_response(
            updated_profile,
            message='Profile updated successfully'
        )

    except Exception as e:
        print(f"Error updating profile: {e}")
        return error_response('Failed to update profile', status_code=500)


@user_profile_bp.route('/<user_id>', methods=['GET'])
@optional_auth
def get_user_profile(user_id):
    """Get public view of a user's profile"""
    try:
        # Get public profile (respects privacy settings)
        public_profile = user_profile_service.get_public_profile(user_id)

        if not public_profile:
            return not_found_response('Profile')

        # If profile is private and not the owner, return limited info
        if public_profile.get('message') == 'Profile is private':
            return error_response('This profile is private', status_code=403)

        return success_response(public_profile)

    except Exception as e:
        print(f"Error fetching public profile: {e}")
        return error_response('Failed to fetch profile', status_code=500)


@user_profile_bp.route('/<user_id>/skills', methods=['GET'])
@optional_auth
def get_user_skills(user_id):
    """Get user's verified skills (public)"""
    try:
        from services.skill_assessment_service import skill_assessment_service

        # Get verified skills
        verified_skills = skill_assessment_service.get_verified_skills(user_id)

        # Get profile to check visibility
        profile = user_profile_service.get_profile_by_user_id(user_id)

        if not profile:
            return not_found_response('Profile')

        # Check if skills should be visible
        visibility = profile.get('profile_visibility', 'public')

        if visibility == 'private' and g.user_id != user_id:
            return error_response('Skills are private', status_code=403)

        return success_response({
            'user_id': user_id,
            'total_credentials': len(verified_skills),
            'verified_skills': verified_skills
        })

    except Exception as e:
        print(f"Error fetching user skills: {e}")
        return error_response('Failed to fetch skills', status_code=500)


@user_profile_bp.route('/search/learners', methods=['GET'])
@token_required
def search_learners():
    """Search for learners (employers only)"""
    try:
        # Get current user's profile to check if employer
        my_profile = user_profile_service.get_profile_by_user_id(g.user_id)

        if not my_profile or my_profile.get('user_type') != 'employer':
            return error_response('Only employers can search for learners', status_code=403)

        # Get search parameters
        skills = request.args.getlist('skills')  # Can pass multiple: ?skills=react&skills=python
        min_score = int(request.args.get('min_score', 0))
        experience_level = request.args.get('experience_level')
        location = request.args.get('location')
        looking_for_job = request.args.get('looking_for_job')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))

        # Convert looking_for_job to boolean
        if looking_for_job:
            looking_for_job = looking_for_job.lower() == 'true'
        else:
            looking_for_job = None

        # Search
        results = user_profile_service.search_learners(
            skills=skills if skills else None,
            min_score=min_score,
            experience_level=experience_level,
            location=location,
            looking_for_job=looking_for_job,
            page=page,
            limit=limit
        )

        # Create public view of each result
        results['data'] = [
            user_profile_service.get_public_profile(str(r.get('user_id')))
            for r in results.get('data', [])
        ]

        return success_response(results)

    except Exception as e:
        print(f"Error searching learners: {e}")
        return error_response('Failed to search learners', status_code=500)


@user_profile_bp.route('/completeness', methods=['GET'])
@token_required
def get_profile_completeness():
    """Get profile completeness score and suggestions"""
    try:
        profile = user_profile_service.get_profile_by_user_id(g.user_id)

        if not profile:
            return not_found_response('Profile')

        completeness_score = profile.get('metadata', {}).get('profile_completeness_score', 0)
        profile_complete = profile.get('metadata', {}).get('profile_complete', False)

        # Generate suggestions for improvement
        suggestions = []

        if not profile.get('full_name'):
            suggestions.append({'field': 'full_name', 'message': 'Add your full name (+5%)'})

        if not profile.get('bio'):
            suggestions.append({'field': 'bio', 'message': 'Add a bio to tell employers about yourself (+5%)'})

        if not profile.get('location'):
            suggestions.append({'field': 'location', 'message': 'Add your location (+5%)'})

        prof_info = profile.get('professional_info', {})
        if not prof_info.get('preferred_roles'):
            suggestions.append({'field': 'preferred_roles', 'message': 'Add your preferred job roles (+5%)'})

        if not prof_info.get('salary_expectation', {}).get('min'):
            suggestions.append({'field': 'salary_expectation', 'message': 'Add salary expectations (+5%)'})

        contact = profile.get('contact', {})
        if not contact.get('github'):
            suggestions.append({'field': 'github', 'message': 'Add your GitHub profile (+5%)'})

        if not contact.get('linkedin'):
            suggestions.append({'field': 'linkedin', 'message': 'Add your LinkedIn profile (+5%)'})

        credentials = profile.get('total_credentials', 0)
        if credentials < 3:
            suggestions.append({'field': 'credentials', 'message': f'Take {3 - credentials} more skill assessments (+{(3 - credentials) * 10}%)'})

        if not profile.get('portfolio_items'):
            suggestions.append({'field': 'portfolio', 'message': 'Add portfolio projects (+10%)'})

        return success_response({
            'completeness_score': completeness_score,
            'profile_complete': profile_complete,
            'suggestions': suggestions,
            'progress': {
                'basic_info': 20 if profile.get('full_name') and profile.get('bio') else 10,
                'professional_info': min(20, len(prof_info.keys()) * 4),
                'skills': min(30, credentials * 10),
                'contact': min(15, len([v for v in contact.values() if v]) * 5),
                'portfolio': 15 if profile.get('portfolio_items') else 0
            }
        })

    except Exception as e:
        print(f"Error fetching completeness: {e}")
        return error_response('Failed to fetch completeness', status_code=500)


@user_profile_bp.route('/me/employment', methods=['POST'])
@token_required
def add_employment_record():
    """Add employment record to profile"""
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['employer_id', 'company_name', 'role', 'start_date']
        is_valid, missing = validate_required_fields(data, required_fields)

        if not is_valid:
            return validation_error_response({'missing_fields': missing})

        # Add employment record
        success = user_profile_service.add_employment_record(
            user_id=g.user_id,
            employer_id=data['employer_id'],
            job_data=data
        )

        if not success:
            return error_response('Failed to add employment record')

        return success_response(
            message='Employment record added successfully'
        )

    except Exception as e:
        print(f"Error adding employment: {e}")
        return error_response('Failed to add employment record', status_code=500)


@user_profile_bp.route('/stats', methods=['GET'])
@optional_auth
def get_platform_stats():
    """Get platform statistics (public)"""
    try:
        from config.database import db

        # Total learners
        total_learners = db.user_profiles.count_documents({'user_type': 'learner'})

        # Total employers
        total_employers = db.user_profiles.count_documents({'user_type': 'employer'})

        # Total credentials issued
        total_credentials = db.skill_assessments.count_documents({'status': 'verified'})

        # Active job seekers
        active_job_seekers = db.user_profiles.count_documents({
            'user_type': 'learner',
            'professional_info.looking_for_job': True
        })

        # Average skill score
        pipeline = [
            {'$match': {'user_type': 'learner', 'total_credentials': {'$gt': 0}}},
            {'$group': {'_id': None, 'avg_score': {'$avg': '$average_skill_score'}}}
        ]
        avg_result = list(db.user_profiles.aggregate(pipeline))
        average_skill_score = round(avg_result[0]['avg_score'], 2) if avg_result else 0

        return success_response({
            'total_learners': total_learners,
            'total_employers': total_employers,
            'total_credentials_issued': total_credentials,
            'active_job_seekers': active_job_seekers,
            'average_skill_score': average_skill_score
        })

    except Exception as e:
        print(f"Error fetching platform stats: {e}")
        return error_response('Failed to fetch platform statistics', status_code=500)
