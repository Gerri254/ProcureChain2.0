"""User data models and business logic"""
from datetime import datetime
from typing import Dict, List
import bcrypt


class UserModel:
    """Model for user records"""

    VALID_ROLES = ['admin', 'procurement_officer', 'auditor', 'public']
    VALID_STATUSES = ['active', 'inactive', 'suspended']

    # SkillChain user types
    VALID_USER_TYPES = ['learner', 'employer', 'educator', 'admin']

    @staticmethod
    def create_schema(data: Dict) -> Dict:
        """
        Create user record schema

        Args:
            data: User data

        Returns:
            Validated user record
        """
        now = datetime.utcnow()

        return {
            'email': data.get('email'),
            'password_hash': UserModel.hash_password(data.get('password')),
            'full_name': data.get('full_name'),
            'role': data.get('role', 'public'),
            'department': data.get('department', ''),
            'permissions': UserModel.get_role_permissions(data.get('role', 'public')),
            'status': data.get('status', 'active'),
            # SkillChain fields
            'user_type': data.get('user_type', 'learner'),  # learner, employer, educator, admin
            'profile_id': None,  # Will be set after profile creation
            'last_login': None,
            'created_at': now,
            'updated_at': now
        }

    @staticmethod
    def hash_password(password: str) -> str:
        """
        Hash password using bcrypt

        Args:
            password: Plain text password

        Returns:
            Hashed password
        """
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')

    @staticmethod
    def verify_password(password: str, password_hash: str) -> bool:
        """
        Verify password against hash

        Args:
            password: Plain text password
            password_hash: Hashed password

        Returns:
            True if password matches, False otherwise
        """
        return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))

    @staticmethod
    def get_role_permissions(role: str) -> List[str]:
        """
        Get permissions for a given role

        Args:
            role: User role

        Returns:
            List of permissions
        """
        permissions_map = {
            'admin': [
                'read', 'write', 'delete', 'manage_users',
                'view_analytics', 'manage_anomalies', 'audit_logs'
            ],
            'procurement_officer': [
                'read', 'write', 'upload_documents',
                'view_analytics', 'manage_procurements'
            ],
            'auditor': [
                'read', 'view_analytics', 'view_anomalies',
                'comment', 'audit_logs'
            ],
            'public': [
                'read_public', 'submit_feedback'
            ]
        }

        return permissions_map.get(role, permissions_map['public'])

    @staticmethod
    def has_permission(user: Dict, permission: str) -> bool:
        """
        Check if user has a specific permission

        Args:
            user: User record
            permission: Permission to check

        Returns:
            True if user has permission, False otherwise
        """
        return permission in user.get('permissions', [])

    @staticmethod
    def update_last_login(user_id) -> Dict:
        """
        Create update dict for last login

        Args:
            user_id: User ID

        Returns:
            Update dictionary
        """
        return {
            '$set': {
                'last_login': datetime.utcnow()
            }
        }

    @staticmethod
    def create_safe_view(user: Dict) -> Dict:
        """
        Create safe view of user record (removes sensitive data)

        Args:
            user: Full user record

        Returns:
            Safe user record without password
        """
        safe_fields = [
            '_id', 'email', 'full_name', 'role', 'department',
            'permissions', 'status', 'created_at', 'last_login'
        ]

        return {key: user.get(key) for key in safe_fields if key in user}
