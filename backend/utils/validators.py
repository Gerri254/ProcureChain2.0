"""Input validation utilities"""
import re
from typing import Any, Dict, List, Optional
from werkzeug.datastructures import FileStorage


def validate_email(email: str) -> bool:
    """
    Validate email format

    Args:
        email: Email address to validate

    Returns:
        True if valid, False otherwise
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_phone(phone: str) -> bool:
    """
    Validate Kenyan phone number format

    Args:
        phone: Phone number to validate

    Returns:
        True if valid, False otherwise
    """
    # Kenya phone format: +254XXXXXXXXX or 0XXXXXXXXX
    pattern = r'^(\+254|0)[17]\d{8}$'
    return bool(re.match(pattern, phone))


def validate_file_extension(filename: str, allowed_extensions: set) -> bool:
    """
    Validate file extension

    Args:
        filename: Name of file
        allowed_extensions: Set of allowed extensions

    Returns:
        True if valid, False otherwise
    """
    if '.' not in filename:
        return False
    extension = filename.rsplit('.', 1)[1].lower()
    return extension in allowed_extensions


def validate_file_size(file: FileStorage, max_size: int) -> bool:
    """
    Validate file size

    Args:
        file: File to validate
        max_size: Maximum size in bytes

    Returns:
        True if valid, False otherwise
    """
    # Seek to end to get size
    file.seek(0, 2)
    size = file.tell()
    # Reset to beginning
    file.seek(0)
    return size <= max_size


def validate_required_fields(data: Dict, required_fields: List[str]) -> tuple:
    """
    Validate that all required fields are present

    Args:
        data: Data dictionary to validate
        required_fields: List of required field names

    Returns:
        Tuple of (is_valid, missing_fields)
    """
    missing_fields = [field for field in required_fields if field not in data or data[field] is None or data[field] == '']
    return len(missing_fields) == 0, missing_fields


def validate_tender_number(tender_number: str) -> bool:
    """
    Validate tender number format

    Args:
        tender_number: Tender number to validate

    Returns:
        True if valid, False otherwise
    """
    # Format: PREFIX/YEAR/NUMBER (e.g., KRK/2025/001)
    pattern = r'^[A-Z]{2,5}/\d{4}/\d{3,5}$'
    return bool(re.match(pattern, tender_number))


def validate_registration_number(reg_number: str) -> bool:
    """
    Validate vendor registration number format

    Args:
        reg_number: Registration number to validate

    Returns:
        True if valid, False otherwise
    """
    # Allow alphanumeric with slashes and hyphens
    pattern = r'^[A-Z0-9/-]{5,20}$'
    return bool(re.match(pattern, reg_number.upper()))


def validate_currency(currency: str) -> bool:
    """
    Validate currency code

    Args:
        currency: Currency code to validate

    Returns:
        True if valid, False otherwise
    """
    valid_currencies = {'KES', 'USD', 'EUR', 'GBP'}
    return currency.upper() in valid_currencies


def validate_status(status: str, valid_statuses: List[str]) -> bool:
    """
    Validate status value

    Args:
        status: Status to validate
        valid_statuses: List of valid status values

    Returns:
        True if valid, False otherwise
    """
    return status in valid_statuses


def sanitize_string(text: str, max_length: Optional[int] = None) -> str:
    """
    Sanitize string input by removing dangerous characters

    Args:
        text: Text to sanitize
        max_length: Optional maximum length

    Returns:
        Sanitized string
    """
    if not isinstance(text, str):
        return ''

    # Remove null bytes
    text = text.replace('\x00', '')

    # Strip whitespace
    text = text.strip()

    # Truncate if needed
    if max_length and len(text) > max_length:
        text = text[:max_length]

    return text


def validate_pagination_params(page: Any, limit: Any, max_limit: int = 100) -> tuple:
    """
    Validate and convert pagination parameters

    Args:
        page: Page number
        limit: Results per page
        max_limit: Maximum allowed limit

    Returns:
        Tuple of (page, limit)
    """
    try:
        page = int(page) if page else 1
        page = max(1, page)
    except (ValueError, TypeError):
        page = 1

    try:
        limit = int(limit) if limit else 20
        limit = min(max(1, limit), max_limit)
    except (ValueError, TypeError):
        limit = 20

    return page, limit
