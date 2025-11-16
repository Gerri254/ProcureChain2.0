"""Rate limiting middleware"""
from functools import wraps
from flask import request
from datetime import datetime, timedelta
from config.database import db
from utils.response import error_response
from config.settings import get_config


class RateLimiter:
    """Simple rate limiter using MongoDB"""

    @staticmethod
    def is_rate_limited(identifier: str, max_requests: int, window_seconds: int) -> tuple:
        """
        Check if identifier has exceeded rate limit

        Args:
            identifier: Unique identifier (IP address, user ID, etc.)
            max_requests: Maximum requests allowed in window
            window_seconds: Time window in seconds

        Returns:
            Tuple of (is_limited, remaining_requests, reset_time)
        """
        config = get_config()

        if not config.RATE_LIMIT_ENABLED:
            return False, max_requests, None

        now = datetime.utcnow()
        window_start = now - timedelta(seconds=window_seconds)

        # Get rate limit collection
        rate_limits = db.rate_limits

        # Count requests in current window
        request_count = rate_limits.count_documents({
            'identifier': identifier,
            'timestamp': {'$gte': window_start}
        })

        if request_count >= max_requests:
            # Get oldest request to calculate reset time
            oldest = rate_limits.find_one(
                {'identifier': identifier, 'timestamp': {'$gte': window_start}},
                sort=[('timestamp', 1)]
            )

            reset_time = oldest['timestamp'] + timedelta(seconds=window_seconds) if oldest else now

            return True, 0, reset_time

        # Log this request
        rate_limits.insert_one({
            'identifier': identifier,
            'timestamp': now
        })

        # Clean up old entries
        rate_limits.delete_many({
            'identifier': identifier,
            'timestamp': {'$lt': window_start}
        })

        remaining = max_requests - request_count - 1

        return False, remaining, None


def rate_limit(max_requests: int = None, window_seconds: int = None, key_func=None):
    """
    Decorator to apply rate limiting to routes

    Args:
        max_requests: Maximum requests allowed (default from config)
        window_seconds: Time window in seconds (default from config)
        key_func: Function to generate identifier key (default uses IP address)

    Usage:
        @app.route('/api/endpoint')
        @rate_limit(max_requests=10, window_seconds=60)
        def endpoint():
            return {'data': 'value'}

        # Custom key function (e.g., by user ID)
        @app.route('/api/user-endpoint')
        @token_required
        @rate_limit(max_requests=100, window_seconds=3600, key_func=lambda: g.user_id)
        def user_endpoint():
            return {'data': 'value'}
    """
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            config = get_config()

            # Use provided values or defaults from config
            _max_requests = max_requests or config.RATE_LIMIT_REQUESTS
            _window_seconds = window_seconds or config.RATE_LIMIT_WINDOW

            # Generate identifier
            if key_func:
                identifier = key_func()
            else:
                # Default to IP address
                identifier = request.remote_addr

            # Check rate limit
            is_limited, remaining, reset_time = RateLimiter.is_rate_limited(
                identifier,
                _max_requests,
                _window_seconds
            )

            if is_limited:
                reset_in = int((reset_time - datetime.utcnow()).total_seconds()) if reset_time else _window_seconds

                return error_response(
                    f'Rate limit exceeded. Try again in {reset_in} seconds',
                    status_code=429
                )

            # Add rate limit headers to response
            response = f(*args, **kwargs)

            if isinstance(response, tuple):
                response_obj, status_code = response[0], response[1]
            else:
                response_obj, status_code = response, 200

            # Add headers if response is Flask response object
            if hasattr(response_obj, 'headers'):
                response_obj.headers['X-RateLimit-Limit'] = str(_max_requests)
                response_obj.headers['X-RateLimit-Remaining'] = str(remaining)
                response_obj.headers['X-RateLimit-Window'] = str(_window_seconds)

            return response

        return decorated

    return decorator
