"""Authentication middleware using JWT tokens"""
from functools import wraps
from flask import request, g
import jwt
from datetime import datetime, timedelta
from config.settings import get_config
from utils.response import unauthorized_response, forbidden_response
from config.database import db
from bson import ObjectId


class AuthMiddleware:
    """JWT authentication middleware"""

    @staticmethod
    def generate_access_token(user_id: str, role: str) -> str:
        """
        Generate JWT access token

        Args:
            user_id: User ID
            role: User role

        Returns:
            JWT token string
        """
        config = get_config()

        payload = {
            'user_id': user_id,
            'role': role,
            'type': 'access',
            'exp': datetime.utcnow() + timedelta(seconds=config.JWT_ACCESS_TOKEN_EXPIRES),
            'iat': datetime.utcnow()
        }

        token = jwt.encode(payload, config.JWT_SECRET, algorithm=config.JWT_ALGORITHM)
        return token

    @staticmethod
    def generate_refresh_token(user_id: str) -> str:
        """
        Generate JWT refresh token

        Args:
            user_id: User ID

        Returns:
            JWT refresh token string
        """
        config = get_config()

        payload = {
            'user_id': user_id,
            'type': 'refresh',
            'exp': datetime.utcnow() + timedelta(seconds=config.JWT_REFRESH_TOKEN_EXPIRES),
            'iat': datetime.utcnow()
        }

        token = jwt.encode(payload, config.JWT_SECRET, algorithm=config.JWT_ALGORITHM)
        return token

    @staticmethod
    def decode_token(token: str) -> dict:
        """
        Decode and validate JWT token

        Args:
            token: JWT token

        Returns:
            Decoded token payload

        Raises:
            jwt.ExpiredSignatureError: Token has expired
            jwt.InvalidTokenError: Token is invalid
        """
        config = get_config()
        payload = jwt.decode(token, config.JWT_SECRET, algorithms=[config.JWT_ALGORITHM])
        return payload

    @staticmethod
    def extract_token_from_header() -> str:
        """
        Extract token from Authorization header

        Returns:
            JWT token or None

        Raises:
            ValueError: If header format is invalid
        """
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return None

        parts = auth_header.split()

        if len(parts) != 2 or parts[0].lower() != 'bearer':
            raise ValueError('Invalid authorization header format. Expected: Bearer <token>')

        return parts[1]


def token_required(f):
    """
    Decorator to require valid JWT token for route access

    Usage:
        @app.route('/protected')
        @token_required
        def protected_route():
            user = g.current_user
            return {'user_id': user['_id']}
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            # Extract token
            token = AuthMiddleware.extract_token_from_header()

            if not token:
                return unauthorized_response('Token is missing')

            # Decode token
            payload = AuthMiddleware.decode_token(token)

            # Verify it's an access token
            if payload.get('type') != 'access':
                return unauthorized_response('Invalid token type')

            # Get user from database
            user = db.users.find_one({'_id': ObjectId(payload['user_id'])})

            if not user:
                return unauthorized_response('User not found')

            if user.get('status') != 'active':
                return forbidden_response('User account is not active')

            # Store user in Flask g object for access in route
            g.current_user = user
            g.user_id = str(user['_id'])
            g.user_role = user.get('role')

        except jwt.ExpiredSignatureError:
            return unauthorized_response('Token has expired')
        except jwt.InvalidTokenError as e:
            return unauthorized_response(f'Invalid token: {str(e)}')
        except ValueError as e:
            return unauthorized_response(str(e))
        except Exception as e:
            print(f"Authentication error: {e}")
            return unauthorized_response('Authentication failed')

        return f(*args, **kwargs)

    return decorated


def role_required(*allowed_roles):
    """
    Decorator to require specific role(s) for route access

    Usage:
        @app.route('/admin')
        @token_required
        @role_required('admin', 'procurement_officer')
        def admin_route():
            return {'message': 'Admin access granted'}
    """
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            user = g.get('current_user')

            if not user:
                return unauthorized_response('Authentication required')

            user_role = user.get('role')

            if user_role not in allowed_roles:
                return forbidden_response(f'Access denied. Required roles: {", ".join(allowed_roles)}')

            return f(*args, **kwargs)

        return decorated

    return decorator


def permission_required(*required_permissions):
    """
    Decorator to require specific permission(s) for route access

    Usage:
        @app.route('/delete')
        @token_required
        @permission_required('delete', 'manage_procurements')
        def delete_route():
            return {'message': 'Permission granted'}
    """
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            user = g.get('current_user')

            if not user:
                return unauthorized_response('Authentication required')

            user_permissions = user.get('permissions', [])

            # Check if user has all required permissions
            missing_permissions = [perm for perm in required_permissions if perm not in user_permissions]

            if missing_permissions:
                return forbidden_response(f'Missing permissions: {", ".join(missing_permissions)}')

            return f(*args, **kwargs)

        return decorated

    return decorator


def optional_auth(f):
    """
    Decorator for routes that work with or without authentication
    If token is provided and valid, user info is added to g

    Usage:
        @app.route('/public')
        @optional_auth
        def public_route():
            user = g.get('current_user')
            if user:
                return {'message': f'Welcome {user["full_name"]}'}
            return {'message': 'Welcome guest'}
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            token = AuthMiddleware.extract_token_from_header()

            if token:
                payload = AuthMiddleware.decode_token(token)

                if payload.get('type') == 'access':
                    user = db.users.find_one({'_id': ObjectId(payload['user_id'])})

                    if user and user.get('status') == 'active':
                        g.current_user = user
                        g.user_id = str(user['_id'])
                        g.user_role = user.get('role')

        except Exception:
            # Silently fail for optional auth
            pass

        return f(*args, **kwargs)

    return decorated
