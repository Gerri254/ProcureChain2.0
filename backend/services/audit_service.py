"""Audit logging service for tracking all system actions"""
from typing import Dict, Optional
from datetime import datetime
from flask import request, g
from config.database import db
from utils.db_helpers import serialize_document, paginate_query


class AuditService:
    """Service for comprehensive audit logging"""

    def __init__(self):
        self.collection = db.audit_logs

    def log_action(
        self,
        event_type: str,
        action: str,
        resource_type: str,
        resource_id: str = None,
        resource_name: str = None,
        changes: Dict = None,
        user_id: str = None,
        user_role: str = None
    ) -> str:
        """
        Log system action to audit trail

        Args:
            event_type: Type of event (authentication, procurement, document, etc.)
            action: Action performed (create, update, delete, view, etc.)
            resource_type: Type of resource affected
            resource_id: Resource ID
            resource_name: Resource name/title
            changes: Before/after changes
            user_id: User who performed action
            user_role: User role

        Returns:
            Audit log ID
        """
        # Get user from Flask g if not provided
        if not user_id and hasattr(g, 'user_id'):
            user_id = g.user_id

        if not user_role and hasattr(g, 'user_role'):
            user_role = g.user_role

        # Get request metadata
        metadata = {
            'ip_address': request.remote_addr if request else None,
            'user_agent': request.headers.get('User-Agent') if request else None,
            'method': request.method if request else None,
            'endpoint': request.endpoint if request else None
        }

        # Create audit log record
        log_record = {
            'event_type': event_type,
            'user_id': user_id,
            'user_role': user_role,
            'resource': {
                'type': resource_type,
                'id': resource_id,
                'name': resource_name
            },
            'action': action,
            'changes': changes or {},
            'metadata': metadata,
            'created_at': datetime.utcnow()
        }

        result = self.collection.insert_one(log_record)

        return str(result.inserted_id)

    def log_authentication(self, user_id: str, action: str, success: bool, reason: str = None) -> str:
        """
        Log authentication event

        Args:
            user_id: User ID
            action: Action (login, logout, register, etc.)
            success: Whether action succeeded
            reason: Failure reason if applicable

        Returns:
            Audit log ID
        """
        return self.log_action(
            event_type='authentication',
            action=action,
            resource_type='user',
            resource_id=user_id,
            changes={'success': success, 'reason': reason},
            user_id=user_id
        )

    def log_procurement_action(
        self,
        procurement_id: str,
        action: str,
        procurement_title: str = None,
        changes: Dict = None
    ) -> str:
        """
        Log procurement-related action

        Args:
            procurement_id: Procurement ID
            action: Action performed
            procurement_title: Procurement title
            changes: Changes made

        Returns:
            Audit log ID
        """
        return self.log_action(
            event_type='procurement',
            action=action,
            resource_type='procurement',
            resource_id=procurement_id,
            resource_name=procurement_title,
            changes=changes
        )

    def log_document_action(
        self,
        document_id: str,
        action: str,
        filename: str = None,
        procurement_id: str = None
    ) -> str:
        """
        Log document-related action

        Args:
            document_id: Document ID
            action: Action performed
            filename: Document filename
            procurement_id: Related procurement ID

        Returns:
            Audit log ID
        """
        return self.log_action(
            event_type='document',
            action=action,
            resource_type='document',
            resource_id=document_id,
            resource_name=filename,
            changes={'procurement_id': procurement_id} if procurement_id else None
        )

    def log_anomaly_action(
        self,
        anomaly_id: str,
        action: str,
        changes: Dict = None
    ) -> str:
        """
        Log anomaly-related action

        Args:
            anomaly_id: Anomaly ID
            action: Action performed
            changes: Changes made

        Returns:
            Audit log ID
        """
        return self.log_action(
            event_type='anomaly',
            action=action,
            resource_type='anomaly',
            resource_id=anomaly_id,
            changes=changes
        )

    def get_audit_logs(
        self,
        page: int = 1,
        limit: int = 50,
        event_type: str = None,
        user_id: str = None,
        resource_type: str = None,
        start_date: datetime = None,
        end_date: datetime = None
    ) -> Dict:
        """
        Get audit logs with filters

        Args:
            page: Page number
            limit: Results per page
            event_type: Filter by event type
            user_id: Filter by user
            resource_type: Filter by resource type
            start_date: Filter from date
            end_date: Filter to date

        Returns:
            Paginated audit logs
        """
        query = {}

        if event_type:
            query['event_type'] = event_type

        if user_id:
            query['user_id'] = user_id

        if resource_type:
            query['resource.type'] = resource_type

        if start_date or end_date:
            query['created_at'] = {}
            if start_date:
                query['created_at']['$gte'] = start_date
            if end_date:
                query['created_at']['$lte'] = end_date

        return paginate_query(
            self.collection,
            query,
            page=page,
            limit=limit,
            sort_by='created_at',
            sort_order=-1
        )

    def get_user_activity(self, user_id: str, limit: int = 100) -> list:
        """
        Get recent activity for a user

        Args:
            user_id: User ID
            limit: Maximum results

        Returns:
            List of audit logs
        """
        logs = self.collection.find({
            'user_id': user_id
        }).sort('created_at', -1).limit(limit)

        return serialize_document(list(logs))

    def get_resource_history(self, resource_type: str, resource_id: str) -> list:
        """
        Get full history of actions on a resource

        Args:
            resource_type: Type of resource
            resource_id: Resource ID

        Returns:
            List of audit logs
        """
        logs = self.collection.find({
            'resource.type': resource_type,
            'resource.id': resource_id
        }).sort('created_at', -1)

        return serialize_document(list(logs))


# Singleton instance
audit_service = AuditService()
