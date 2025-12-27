"""Job Posting Routes - API endpoints for job postings"""
from flask import Blueprint, request, jsonify, g
from middleware.auth import token_required
from services.job_posting_service import job_posting_service
from utils.response_helpers import success_response, error_response


job_posting_bp = Blueprint('job_postings', __name__)


# ========== Public Routes (Learners) ==========

@job_posting_bp.route('', methods=['GET'])
def browse_job_postings():
    """
    Browse active job postings with filters

    Query Parameters:
    - skills: Comma-separated skill names
    - location: Location string (partial match)
    - employment_type: full-time, part-time, contract, internship
    - experience_level: junior, mid-level, senior, expert
    - location_type: onsite, remote, hybrid
    - min_salary: Minimum salary
    - search: Search in title, description, company name
    - page: Page number (default 1)
    - per_page: Items per page (default 20)
    """
    try:
        # Get query parameters
        skills = request.args.get('skills', '').split(',') if request.args.get('skills') else None
        location = request.args.get('location')
        employment_type = request.args.get('employment_type')
        experience_level = request.args.get('experience_level')
        location_type = request.args.get('location_type')
        min_salary = request.args.get('min_salary', type=int)
        search = request.args.get('search')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)

        # Clean up skills list
        if skills:
            skills = [s.strip().lower() for s in skills if s.strip()]

        # Get job postings
        result = job_posting_service.get_job_postings(
            skills=skills,
            location=location,
            employment_type=employment_type,
            experience_level=experience_level,
            location_type=location_type,
            min_salary=min_salary,
            search=search,
            page=page,
            per_page=per_page
        )

        return success_response(
            data=result,
            message='Job postings retrieved successfully'
        )

    except Exception as e:
        return error_response(f'Error browsing job postings: {str(e)}', 500)


@job_posting_bp.route('/<job_id>', methods=['GET'])
def get_job_posting(job_id):
    """Get single job posting by ID (public view)"""
    try:
        job_posting = job_posting_service.get_job_posting_by_id(job_id, include_private=False)

        if not job_posting:
            return error_response('Job posting not found', 404)

        return success_response(
            data={'job_posting': job_posting},
            message='Job posting retrieved successfully'
        )

    except Exception as e:
        return error_response(f'Error getting job posting: {str(e)}', 500)


# ========== Protected Routes (Employers) ==========

@job_posting_bp.route('', methods=['POST'])
@token_required
def create_job_posting():
    """
    Create new job posting (employers only)

    Required fields:
    - title: Job title
    - description: Job description

    Optional fields:
    - company_name, location, location_type, employment_type
    - experience_level, skills_required, minimum_score
    - responsibilities, qualifications, salary_min, salary_max
    - benefits, how_to_apply, application_url, status
    """
    try:
        user = g.current_user

        # Only employers can create job postings
        if user.get('user_type') != 'employer':
            return error_response('Only employers can create job postings', 403)

        data = request.get_json()

        # Validate required fields
        if not data.get('title'):
            return error_response('Title is required', 400)
        if not data.get('description'):
            return error_response('Description is required', 400)

        # Create job posting
        job_id = job_posting_service.create_job_posting(
            employer_id=str(user['_id']),
            data=data
        )

        if not job_id:
            return error_response('Failed to create job posting', 500)

        # Get created job posting
        job_posting = job_posting_service.get_job_posting_by_id(job_id, include_private=True)

        return success_response(
            data={'job_posting': job_posting},
            message='Job posting created successfully',
            status_code=201
        )

    except Exception as e:
        return error_response(f'Error creating job posting: {str(e)}', 500)


@job_posting_bp.route('/my-postings', methods=['GET'])
@token_required
def get_my_job_postings():
    """
    Get job postings for current employer

    Query Parameters:
    - status: Filter by status (draft, active, closed, expired)
    - page: Page number (default 1)
    - per_page: Items per page (default 20)
    """
    try:
        user = g.current_user

        # Only employers can access this
        if user.get('user_type') != 'employer':
            return error_response('Only employers can access this endpoint', 403)

        # Get query parameters
        status = request.args.get('status')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)

        # Get job postings
        result = job_posting_service.get_employer_job_postings(
            employer_id=str(user['_id']),
            status=status,
            page=page,
            per_page=per_page
        )

        return success_response(
            data=result,
            message='Job postings retrieved successfully'
        )

    except Exception as e:
        return error_response(f'Error getting job postings: {str(e)}', 500)


@job_posting_bp.route('/<job_id>', methods=['PUT'])
@token_required
def update_job_posting(job_id):
    """Update job posting (employer must own the job)"""
    try:
        user = g.current_user

        # Only employers can update job postings
        if user.get('user_type') != 'employer':
            return error_response('Only employers can update job postings', 403)

        data = request.get_json()

        # Update job posting
        success = job_posting_service.update_job_posting(
            job_id=job_id,
            employer_id=str(user['_id']),
            data=data
        )

        if not success:
            return error_response('Failed to update job posting or unauthorized', 404)

        # Get updated job posting
        job_posting = job_posting_service.get_job_posting_by_id(job_id, include_private=True)

        return success_response(
            data={'job_posting': job_posting},
            message='Job posting updated successfully'
        )

    except Exception as e:
        return error_response(f'Error updating job posting: {str(e)}', 500)


@job_posting_bp.route('/<job_id>', methods=['DELETE'])
@token_required
def delete_job_posting(job_id):
    """Delete job posting (soft delete - sets status to closed)"""
    try:
        user = g.current_user

        # Only employers can delete job postings
        if user.get('user_type') != 'employer':
            return error_response('Only employers can delete job postings', 403)

        # Delete job posting
        success = job_posting_service.delete_job_posting(
            job_id=job_id,
            employer_id=str(user['_id'])
        )

        if not success:
            return error_response('Failed to delete job posting or unauthorized', 404)

        return success_response(
            message='Job posting deleted successfully'
        )

    except Exception as e:
        return error_response(f'Error deleting job posting: {str(e)}', 500)


@job_posting_bp.route('/stats', methods=['GET'])
@token_required
def get_job_posting_stats():
    """Get job posting statistics for current employer"""
    try:
        user = g.current_user

        # Only employers can access stats
        if user.get('user_type') != 'employer':
            return error_response('Only employers can access stats', 403)

        stats = job_posting_service.get_job_posting_stats(str(user['_id']))

        return success_response(
            data={'stats': stats},
            message='Statistics retrieved successfully'
        )

    except Exception as e:
        return error_response(f'Error getting statistics: {str(e)}', 500)
