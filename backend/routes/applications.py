"""Job Application API routes"""
from flask import Blueprint, request, g
from config.database import db
from bson import ObjectId
from models.job_application import JobApplicationModel
from services.matching_service import matching_service
from middleware.auth import token_required
from utils.response import success_response, error_response, validation_error_response
from utils.validators import validate_required_fields
from utils.db_helpers import serialize_document

applications_bp = Blueprint('applications', __name__, url_prefix='/api/applications')


@applications_bp.route('/', methods=['POST'])
@token_required
def create_application():
    """Submit a job application"""
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['job_id']
        is_valid, missing = validate_required_fields(data, required_fields)

        if not is_valid:
            return validation_error_response({'missing_fields': missing})

        # Check if job exists
        job = db.job_postings.find_one({'_id': ObjectId(data['job_id'])})
        if not job:
            return error_response('Job posting not found', status_code=404)

        # Check if job is still active
        if job.get('status') != 'active':
            return error_response('This job posting is no longer accepting applications', status_code=400)

        # Check if already applied
        existing = db.job_applications.find_one({
            'job_id': data['job_id'],
            'user_id': g.user_id
        })

        if existing:
            return error_response('You have already applied to this job', status_code=409)

        # Get user info
        user = g.current_user
        profile = db.user_profiles.find_one({'user_id': g.user_id})

        # Create application
        application_data = {
            'job_id': data['job_id'],
            'user_id': g.user_id,
            'applicant_name': user.get('full_name'),
            'applicant_email': user.get('email'),
            'cover_letter': data.get('cover_letter', ''),
            'resume_url': profile.get('portfolio_url') if profile else None,
            'portfolio_url': profile.get('portfolio_url') if profile else None,
        }

        application = JobApplicationModel.create_schema(application_data)
        result = db.job_applications.insert_one(application)

        application['_id'] = result.inserted_id

        return success_response(
            JobApplicationModel.create_safe_view(serialize_document(application)),
            message='Application submitted successfully',
            status_code=201
        )

    except Exception as e:
        print(f"Error creating application: {e}")
        return error_response('Failed to submit application', status_code=500)


@applications_bp.route('/my-applications', methods=['GET'])
@token_required
def get_my_applications():
    """Get all applications for the current user"""
    try:
        applications = list(db.job_applications.find({'user_id': g.user_id}))

        # Enrich with job details
        for app in applications:
            job = db.job_postings.find_one({'_id': ObjectId(app['job_id'])})
            if job:
                app['job_details'] = {
                    'title': job.get('title'),
                    'company_name': job.get('company_name'),
                    'location': job.get('location'),
                    'employment_type': job.get('employment_type'),
                    'status': job.get('status')
                }

        safe_applications = [
            JobApplicationModel.create_safe_view(serialize_document(app))
            for app in applications
        ]

        return success_response(safe_applications)

    except Exception as e:
        print(f"Error fetching applications: {e}")
        return error_response('Failed to fetch applications', status_code=500)


@applications_bp.route('/job/<job_id>', methods=['GET'])
@token_required
def get_job_applications(job_id):
    """Get all applications for a specific job (Employer only)"""
    try:
        # Verify job belongs to this employer
        job = db.job_postings.find_one({
            '_id': ObjectId(job_id),
            'employer_id': g.user_id
        })

        if not job:
            return error_response('Job not found or unauthorized', status_code=404)

        # Get ranked applicants with match scores
        ranked_applicants = matching_service.rank_applicants_for_job(job_id)

        return success_response({
            'job': serialize_document(job),
            'applicants': ranked_applicants,
            'total_applicants': len(ranked_applicants)
        })

    except Exception as e:
        print(f"Error fetching job applications: {e}")
        return error_response('Failed to fetch applications', status_code=500)


@applications_bp.route('/<application_id>/status', methods=['PUT'])
@token_required
def update_application_status(application_id):
    """Update application status (Employer only)"""
    try:
        data = request.get_json()

        required_fields = ['status']
        is_valid, missing = validate_required_fields(data, required_fields)

        if not is_valid:
            return validation_error_response({'missing_fields': missing})

        new_status = data['status']

        if new_status not in JobApplicationModel.VALID_STATUSES:
            return validation_error_response({
                'status': f'Invalid status. Must be one of: {JobApplicationModel.VALID_STATUSES}'
            })

        # Get application
        application = db.job_applications.find_one({'_id': ObjectId(application_id)})
        if not application:
            return error_response('Application not found', status_code=404)

        # Verify job belongs to this employer
        job = db.job_postings.find_one({
            '_id': ObjectId(application['job_id']),
            'employer_id': g.user_id
        })

        if not job:
            return error_response('Unauthorized', status_code=403)

        # Update status
        update_doc = JobApplicationModel.update_status(
            application_id,
            new_status,
            data.get('notes')
        )

        db.job_applications.update_one(
            {'_id': ObjectId(application_id)},
            update_doc
        )

        return success_response(message=f'Application status updated to {new_status}')

    except Exception as e:
        print(f"Error updating application status: {e}")
        return error_response('Failed to update status', status_code=500)


@applications_bp.route('/matched-jobs', methods=['GET'])
@token_required
def get_matched_jobs():
    """Get jobs matched to current learner with match scores"""
    try:
        # Only learners can access this
        if g.current_user.get('user_type') != 'learner':
            return error_response('Only learners can view matched jobs', status_code=403)

        # Get minimum match score from query params (default 60%)
        min_score = float(request.args.get('min_score', 60.0))

        matched_jobs = matching_service.get_matched_jobs_for_learner(g.user_id, min_score)

        return success_response({
            'jobs': matched_jobs,
            'total_matches': len(matched_jobs),
            'min_match_score': min_score
        })

    except Exception as e:
        print(f"Error fetching matched jobs: {e}")
        return error_response('Failed to fetch matched jobs', status_code=500)
