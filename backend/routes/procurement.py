"""Procurement API routes"""
from flask import Blueprint, request, g
from services.procurement_service import procurement_service
from services.audit_service import audit_service
from middleware.auth import token_required, role_required, optional_auth
from utils.response import success_response, error_response, not_found_response, validation_error_response
from utils.validators import validate_required_fields, validate_pagination_params, validate_status, validate_tender_number
from models.procurement import ProcurementModel

procurement_bp = Blueprint('procurement', __name__, url_prefix='/api/procurement')


@procurement_bp.route('/public', methods=['GET'])
@optional_auth
def get_public_procurements():
    """Get public procurement records (published only)"""
    try:
        # Get pagination params
        page = request.args.get('page', 1)
        limit = request.args.get('limit', 20)
        page, limit = validate_pagination_params(page, limit)

        # Get public records
        results = procurement_service.list_public_procurements(page=page, limit=limit)

        return success_response(results)

    except Exception as e:
        print(f"Error fetching public procurements: {e}")
        return error_response('Failed to fetch procurements', status_code=500)


@procurement_bp.route('/public/<procurement_id>', methods=['GET'])
@optional_auth
def get_public_procurement(procurement_id):
    """Get specific public procurement record"""
    try:
        record = procurement_service.get_procurement_by_id(procurement_id)

        if not record:
            return not_found_response('Procurement')

        # Only show if published
        if record.get('status') != 'published':
            return error_response('Procurement not available', status_code=404)

        # Return public view
        public_record = ProcurementModel.create_public_view(record)

        # Log view action
        audit_service.log_procurement_action(
            procurement_id=procurement_id,
            action='view_public',
            procurement_title=record.get('title')
        )

        return success_response(public_record)

    except Exception as e:
        print(f"Error fetching procurement: {e}")
        return error_response('Failed to fetch procurement', status_code=500)


@procurement_bp.route('', methods=['GET'])
@token_required
def list_procurements():
    """List all procurement records (authenticated)"""
    try:
        # Get query params
        page = request.args.get('page', 1)
        limit = request.args.get('limit', 20)
        status = request.args.get('status')
        category = request.args.get('category')
        search = request.args.get('search')

        page, limit = validate_pagination_params(page, limit)

        # Get records
        results = procurement_service.list_procurements(
            page=page,
            limit=limit,
            status=status,
            category=category,
            search=search
        )

        return success_response(results)

    except Exception as e:
        print(f"Error listing procurements: {e}")
        return error_response('Failed to list procurements', status_code=500)


@procurement_bp.route('/<procurement_id>', methods=['GET'])
@token_required
def get_procurement(procurement_id):
    """Get specific procurement record (authenticated)"""
    try:
        record = procurement_service.get_procurement_by_id(procurement_id)

        if not record:
            return not_found_response('Procurement')

        # Log view action
        audit_service.log_procurement_action(
            procurement_id=procurement_id,
            action='view',
            procurement_title=record.get('title')
        )

        return success_response(record)

    except Exception as e:
        print(f"Error fetching procurement: {e}")
        return error_response('Failed to fetch procurement', status_code=500)


@procurement_bp.route('', methods=['POST'])
@token_required
@role_required('admin', 'procurement_officer')
def create_procurement():
    """Create new procurement record"""
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['title', 'category', 'estimated_value']
        is_valid, missing = validate_required_fields(data, required_fields)

        if not is_valid:
            return validation_error_response({'missing_fields': missing})

        # Validate tender number if provided
        if data.get('tender_number'):
            if not validate_tender_number(data['tender_number']):
                return validation_error_response({'tender_number': 'Invalid format'})

            # Check uniqueness
            existing = procurement_service.get_procurement_by_tender_number(data['tender_number'])
            if existing:
                return error_response('Tender number already exists', status_code=409)

        # Validate status
        if data.get('status') and not ProcurementModel.validate_status(data['status']):
            return validation_error_response({'status': f'Invalid status. Must be one of: {ProcurementModel.VALID_STATUSES}'})

        # Validate category
        if not ProcurementModel.validate_category(data['category']):
            return validation_error_response({'category': f'Invalid category. Must be one of: {ProcurementModel.VALID_CATEGORIES}'})

        # Create procurement
        procurement_id = procurement_service.create_procurement(data, created_by=g.user_id)

        # Log action
        audit_service.log_procurement_action(
            procurement_id=procurement_id,
            action='create',
            procurement_title=data.get('title')
        )

        return success_response(
            {'procurement_id': procurement_id},
            message='Procurement created successfully',
            status_code=201
        )

    except Exception as e:
        print(f"Error creating procurement: {e}")
        return error_response('Failed to create procurement', status_code=500)


@procurement_bp.route('/<procurement_id>', methods=['PUT'])
@token_required
@role_required('admin', 'procurement_officer')
def update_procurement(procurement_id):
    """Update procurement record"""
    try:
        data = request.get_json()

        # Get existing record
        existing = procurement_service.get_procurement_by_id(procurement_id)

        if not existing:
            return not_found_response('Procurement')

        # Validate status if being updated
        if data.get('status') and not ProcurementModel.validate_status(data['status']):
            return validation_error_response({'status': 'Invalid status'})

        # Update procurement
        success = procurement_service.update_procurement(procurement_id, data)

        if not success:
            return error_response('Failed to update procurement')

        # Log action
        audit_service.log_procurement_action(
            procurement_id=procurement_id,
            action='update',
            procurement_title=existing.get('title'),
            changes={'before': existing, 'after': data}
        )

        return success_response(message='Procurement updated successfully')

    except Exception as e:
        print(f"Error updating procurement: {e}")
        return error_response('Failed to update procurement', status_code=500)


@procurement_bp.route('/<procurement_id>', methods=['DELETE'])
@token_required
@role_required('admin')
def delete_procurement(procurement_id):
    """Delete procurement record (admin only)"""
    try:
        # Get existing record
        existing = procurement_service.get_procurement_by_id(procurement_id)

        if not existing:
            return not_found_response('Procurement')

        # Delete procurement
        success = procurement_service.delete_procurement(procurement_id)

        if not success:
            return error_response('Failed to delete procurement')

        # Log action
        audit_service.log_procurement_action(
            procurement_id=procurement_id,
            action='delete',
            procurement_title=existing.get('title')
        )

        return success_response(message='Procurement deleted successfully')

    except Exception as e:
        print(f"Error deleting procurement: {e}")
        return error_response('Failed to delete procurement', status_code=500)


@procurement_bp.route('/statistics', methods=['GET'])
@token_required
def get_statistics():
    """Get procurement statistics"""
    try:
        stats = procurement_service.get_statistics()

        return success_response(stats)

    except Exception as e:
        print(f"Error getting statistics: {e}")
        return error_response('Failed to get statistics', status_code=500)
