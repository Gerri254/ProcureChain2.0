"""Vendor management API routes"""
from flask import Blueprint, request, g
from services.vendor_service import vendor_service
from services.audit_service import audit_service
from middleware.auth import token_required, role_required, optional_auth
from utils.response import success_response, error_response, not_found_response, validation_error_response
from utils.validators import validate_required_fields, validate_pagination_params, validate_registration_number
from models.vendor import VendorModel

vendors_bp = Blueprint('vendors', __name__, url_prefix='/api/vendors')


@vendors_bp.route('/public', methods=['GET'])
@optional_auth
def get_public_vendors():
    """Get public vendor list"""
    try:
        page = request.args.get('page', 1)
        limit = request.args.get('limit', 20)
        page, limit = validate_pagination_params(page, limit)

        results = vendor_service.list_public_vendors(page=page, limit=limit)

        return success_response(results)

    except Exception as e:
        print(f"Error fetching public vendors: {e}")
        return error_response('Failed to fetch vendors', status_code=500)


@vendors_bp.route('', methods=['GET'])
@token_required
def list_vendors():
    """List all vendors (authenticated)"""
    try:
        page = request.args.get('page', 1)
        limit = request.args.get('limit', 20)
        search = request.args.get('search')

        page, limit = validate_pagination_params(page, limit)

        results = vendor_service.list_vendors(page=page, limit=limit, search=search)

        return success_response(results)

    except Exception as e:
        print(f"Error listing vendors: {e}")
        return error_response('Failed to list vendors', status_code=500)


@vendors_bp.route('/<vendor_id>', methods=['GET'])
@token_required
def get_vendor(vendor_id):
    """Get specific vendor"""
    try:
        vendor = vendor_service.get_vendor_by_id(vendor_id)

        if not vendor:
            return not_found_response('Vendor')

        return success_response(vendor)

    except Exception as e:
        print(f"Error fetching vendor: {e}")
        return error_response('Failed to fetch vendor', status_code=500)


@vendors_bp.route('', methods=['POST'])
@token_required
@role_required('admin', 'procurement_officer')
def create_vendor():
    """Create new vendor"""
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['name', 'registration_number']
        is_valid, missing = validate_required_fields(data, required_fields)

        if not is_valid:
            return validation_error_response({'missing_fields': missing})

        # Validate registration number format
        if not validate_registration_number(data['registration_number']):
            return validation_error_response({'registration_number': 'Invalid format'})

        # Check uniqueness
        existing = vendor_service.get_vendor_by_registration(data['registration_number'])
        if existing:
            return error_response('Vendor registration number already exists', status_code=409)

        # Create vendor
        vendor_id = vendor_service.create_vendor(data)

        # Log action
        audit_service.log_action(
            event_type='vendor',
            action='create',
            resource_type='vendor',
            resource_id=vendor_id,
            resource_name=data.get('name')
        )

        return success_response(
            {'vendor_id': vendor_id},
            message='Vendor created successfully',
            status_code=201
        )

    except Exception as e:
        print(f"Error creating vendor: {e}")
        return error_response('Failed to create vendor', status_code=500)


@vendors_bp.route('/<vendor_id>', methods=['PUT'])
@token_required
@role_required('admin', 'procurement_officer')
def update_vendor(vendor_id):
    """Update vendor"""
    try:
        data = request.get_json()

        # Get existing vendor
        existing = vendor_service.get_vendor_by_id(vendor_id)

        if not existing:
            return not_found_response('Vendor')

        # Update vendor
        success = vendor_service.update_vendor(vendor_id, data)

        if not success:
            return error_response('Failed to update vendor')

        # Log action
        audit_service.log_action(
            event_type='vendor',
            action='update',
            resource_type='vendor',
            resource_id=vendor_id,
            resource_name=existing.get('name'),
            changes={'before': existing, 'after': data}
        )

        return success_response(message='Vendor updated successfully')

    except Exception as e:
        print(f"Error updating vendor: {e}")
        return error_response('Failed to update vendor', status_code=500)


@vendors_bp.route('/<vendor_id>', methods=['DELETE'])
@token_required
@role_required('admin')
def delete_vendor(vendor_id):
    """Delete vendor (admin only)"""
    try:
        # Get existing vendor
        existing = vendor_service.get_vendor_by_id(vendor_id)

        if not existing:
            return not_found_response('Vendor')

        # Delete vendor
        success = vendor_service.delete_vendor(vendor_id)

        if not success:
            return error_response('Failed to delete vendor')

        # Log action
        audit_service.log_action(
            event_type='vendor',
            action='delete',
            resource_type='vendor',
            resource_id=vendor_id,
            resource_name=existing.get('name')
        )

        return success_response(message='Vendor deleted successfully')

    except Exception as e:
        print(f"Error deleting vendor: {e}")
        return error_response('Failed to delete vendor', status_code=500)


@vendors_bp.route('/top', methods=['GET'])
@token_required
def get_top_vendors():
    """Get top vendors by contract value"""
    try:
        limit = request.args.get('limit', 10, type=int)

        vendors = vendor_service.get_top_vendors(limit=limit)

        return success_response({'vendors': vendors})

    except Exception as e:
        print(f"Error fetching top vendors: {e}")
        return error_response('Failed to fetch top vendors', status_code=500)
