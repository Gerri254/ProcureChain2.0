"""
Reports Routes

Endpoints for whistleblowing and issue reporting
"""

from flask import Blueprint, request, g
from bson import ObjectId
from config.database import db
from middleware.auth import token_required, role_required
from models.report import Report
from utils.response import success_response, error_response
from datetime import datetime

reports_bp = Blueprint('reports', __name__)


@reports_bp.route('', methods=['POST'])
def create_report():
    """
    Create a new report (whistleblow/issue/complaint) - allows anonymous
    """
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['procurement_id', 'report_type', 'category', 'title', 'description']
        for field in required_fields:
            if field not in data:
                return error_response(f'Missing required field: {field}', 400)

        # Validate report_type
        valid_types = ['whistleblow', 'issue', 'complaint']
        if data['report_type'] not in valid_types:
            return error_response(f'Invalid report_type. Must be one of: {", ".join(valid_types)}', 400)

        # Validate category
        valid_categories = ['corruption', 'fraud', 'irregularity', 'quality', 'delay', 'discrimination', 'other']
        if data['category'] not in valid_categories:
            return error_response(f'Invalid category. Must be one of: {", ".join(valid_categories)}', 400)

        # Get user ID if authenticated, otherwise allow anonymous
        reporter_id = None
        anonymous = data.get('anonymous', False)

        if hasattr(g, 'current_user') and g.current_user:
            reporter_id = g.current_user['_id']

        # Create report
        report_data = Report.create(
            procurement_id=data['procurement_id'],
            reporter_id=reporter_id,
            report_type=data['report_type'],
            category=data['category'],
            title=data['title'],
            description=data['description'],
            evidence=data.get('evidence', []),
            anonymous=anonymous
        )

        result = db.reports.insert_one(report_data)
        report_data['_id'] = result.inserted_id

        return success_response(
            data=Report.to_dict(report_data),
            message='Report submitted successfully',
            status_code=201
        )

    except Exception as e:
        return error_response(f'Failed to create report: {str(e)}', 500)


@reports_bp.route('', methods=['GET'])
@token_required
@role_required('admin', 'government_official', 'auditor')
def get_reports():
    """
    Get all reports (admin/official/auditor only)
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        procurement_id = request.args.get('procurement_id')
        status = request.args.get('status')
        report_type = request.args.get('type')

        # Build query
        query = {}
        if procurement_id:
            query['procurement_id'] = ObjectId(procurement_id)
        if status:
            query['status'] = status
        if report_type:
            query['report_type'] = report_type

        # Get total count
        total = db.reports.count_documents(query)

        # Get reports
        reports = list(db.reports.find(query)
                      .sort('created_at', -1)
                      .skip((page - 1) * per_page)
                      .limit(per_page))

        # Convert to dict
        reports_list = [Report.to_dict(report) for report in reports]

        return success_response(
            data={
                'items': reports_list,
                'total': total,
                'page': page,
                'per_page': per_page,
                'pages': (total + per_page - 1) // per_page
            },
            message='Reports retrieved successfully'
        )

    except Exception as e:
        return error_response(f'Failed to retrieve reports: {str(e)}', 500)


@reports_bp.route('/<report_id>', methods=['GET'])
@token_required
@role_required('admin', 'government_official', 'auditor')
def get_report(report_id):
    """
    Get a specific report by ID
    """
    try:
        report = db.reports.find_one({'_id': ObjectId(report_id)})

        if not report:
            return error_response('Report not found', 404)

        return success_response(
            data=Report.to_dict(report),
            message='Report retrieved successfully'
        )

    except Exception as e:
        return error_response(f'Failed to retrieve report: {str(e)}', 500)


@reports_bp.route('/<report_id>/status', methods=['PATCH'])
@token_required
@role_required('admin', 'government_official')
def update_report_status(report_id):
    """
    Update report status
    """
    try:
        data = request.get_json()

        if 'status' not in data:
            return error_response('Status is required', 400)

        valid_statuses = ['pending', 'under_review', 'resolved', 'dismissed']
        if data['status'] not in valid_statuses:
            return error_response(f'Invalid status. Must be one of: {", ".join(valid_statuses)}', 400)

        update_data = {
            'status': data['status'],
            'updated_at': datetime.utcnow()
        }

        if data['status'] == 'resolved':
            update_data['resolved_at'] = datetime.utcnow()
            if 'resolution' in data:
                update_data['resolution'] = data['resolution']

        if 'severity' in data:
            update_data['severity'] = data['severity']

        if 'assigned_to' in data:
            update_data['assigned_to'] = ObjectId(data['assigned_to'])

        result = db.reports.update_one(
            {'_id': ObjectId(report_id)},
            {'$set': update_data}
        )

        if result.matched_count == 0:
            return error_response('Report not found', 404)

        updated_report = db.reports.find_one({'_id': ObjectId(report_id)})

        return success_response(
            data=Report.to_dict(updated_report),
            message='Report status updated successfully'
        )

    except Exception as e:
        return error_response(f'Failed to update report: {str(e)}', 500)


@reports_bp.route('/procurement/<procurement_id>/count', methods=['GET'])
@token_required
def get_procurement_report_count(procurement_id):
    """
    Get count of reports for a specific procurement
    """
    try:
        count = db.reports.count_documents({'procurement_id': ObjectId(procurement_id)})

        return success_response(
            data={'count': count},
            message='Report count retrieved successfully'
        )

    except Exception as e:
        return error_response(f'Failed to get report count: {str(e)}', 500)
