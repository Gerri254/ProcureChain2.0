"""Response Helper Functions - Standardized API responses"""
from flask import jsonify
from typing import Any, Optional, Dict


def success_response(
    data: Optional[Any] = None,
    message: str = 'Success',
    status_code: int = 200
):
    """
    Create a standardized success response

    Args:
        data: Response data (optional)
        message: Success message
        status_code: HTTP status code (default 200)

    Returns:
        Flask JSON response
    """
    response = {
        'success': True,
        'message': message
    }

    if data is not None:
        response['data'] = data

    return jsonify(response), status_code


def error_response(
    message: str = 'An error occurred',
    status_code: int = 400,
    errors: Optional[Dict] = None
):
    """
    Create a standardized error response

    Args:
        message: Error message
        status_code: HTTP status code (default 400)
        errors: Additional error details (optional)

    Returns:
        Flask JSON response
    """
    response = {
        'success': False,
        'error': message
    }

    if errors:
        response['errors'] = errors

    return jsonify(response), status_code


def unauthorized_response(message: str = 'Unauthorized'):
    """Create a 401 unauthorized response"""
    return error_response(message, 401)


def forbidden_response(message: str = 'Forbidden'):
    """Create a 403 forbidden response"""
    return error_response(message, 403)


def not_found_response(message: str = 'Resource not found'):
    """Create a 404 not found response"""
    return error_response(message, 404)


def validation_error_response(errors: Dict):
    """Create a 422 validation error response"""
    return error_response(
        message='Validation failed',
        status_code=422,
        errors=errors
    )
