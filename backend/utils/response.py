"""API response utilities"""
from flask import jsonify
from typing import Any, Dict, Optional


def success_response(data: Any = None, message: str = None, status_code: int = 200):
    """
    Create successful API response

    Args:
        data: Response data
        message: Optional success message
        status_code: HTTP status code

    Returns:
        Flask JSON response
    """
    response = {'success': True}

    if message:
        response['message'] = message

    if data is not None:
        response['data'] = data

    return jsonify(response), status_code


def error_response(message: str, status_code: int = 400, errors: Dict = None):
    """
    Create error API response

    Args:
        message: Error message
        status_code: HTTP status code
        errors: Optional dictionary of field-specific errors

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


def validation_error_response(errors: Dict, message: str = "Validation failed"):
    """
    Create validation error response

    Args:
        errors: Dictionary of validation errors
        message: Error message

    Returns:
        Flask JSON response
    """
    return error_response(message, status_code=422, errors=errors)


def not_found_response(resource: str = "Resource"):
    """
    Create not found response

    Args:
        resource: Name of resource that wasn't found

    Returns:
        Flask JSON response
    """
    return error_response(f"{resource} not found", status_code=404)


def unauthorized_response(message: str = "Unauthorized access"):
    """
    Create unauthorized response

    Args:
        message: Error message

    Returns:
        Flask JSON response
    """
    return error_response(message, status_code=401)


def forbidden_response(message: str = "Access forbidden"):
    """
    Create forbidden response

    Args:
        message: Error message

    Returns:
        Flask JSON response
    """
    return error_response(message, status_code=403)


def server_error_response(message: str = "Internal server error"):
    """
    Create server error response

    Args:
        message: Error message

    Returns:
        Flask JSON response
    """
    return error_response(message, status_code=500)
