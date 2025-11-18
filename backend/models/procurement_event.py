"""
Procurement Event Model

Handles events in the procurement lifecycle with status tracking and file attachments
"""

from datetime import datetime
from typing import Optional, List
from bson import ObjectId


class ProcurementEvent:
    """Model for tracking procurement lifecycle events"""

    @staticmethod
    def create(
        procurement_id: str,
        event_type: str,
        title: str,
        description: str,
        scheduled_date: Optional[str] = None,
        created_by: str = None,
        files: Optional[List[dict]] = None,
        findings: Optional[str] = None
    ) -> dict:
        """Create a new procurement event"""
        return {
            'procurement_id': ObjectId(procurement_id),
            'event_type': event_type,  # 'published', 'evaluation', 'award', 'delivery', 'inspection', 'completion', 'milestone', 'other'
            'title': title,
            'description': description,
            'status': 'pending',  # pending, in_progress, completed, cancelled
            'scheduled_date': datetime.fromisoformat(scheduled_date.replace('Z', '+00:00')) if scheduled_date else None,
            'actual_date': None,
            'created_by': ObjectId(created_by) if created_by else None,
            'files': files or [],  # [{ 'name': str, 'url': str, 'type': str, 'size': int }]
            'findings': findings,
            'notes': [],  # [{ 'text': str, 'added_by': ObjectId, 'added_at': datetime }]
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'completed_at': None,
            'cancelled_at': None
        }

    @staticmethod
    def to_dict(event: dict) -> dict:
        """Convert event to dictionary for API response"""
        return {
            '_id': str(event['_id']),
            'procurement_id': str(event['procurement_id']),
            'event_type': event['event_type'],
            'title': event['title'],
            'description': event['description'],
            'status': event['status'],
            'scheduled_date': event['scheduled_date'].isoformat() if event.get('scheduled_date') else None,
            'actual_date': event['actual_date'].isoformat() if event.get('actual_date') else None,
            'created_by': str(event['created_by']) if event.get('created_by') else None,
            'files': event.get('files', []),
            'findings': event.get('findings'),
            'notes': [
                {
                    'text': note['text'],
                    'added_by': str(note['added_by']) if note.get('added_by') else None,
                    'added_at': note['added_at'].isoformat() if note.get('added_at') else None
                }
                for note in event.get('notes', [])
            ],
            'created_at': event['created_at'].isoformat() if event.get('created_at') else None,
            'updated_at': event['updated_at'].isoformat() if event.get('updated_at') else None,
            'completed_at': event['completed_at'].isoformat() if event.get('completed_at') else None,
            'cancelled_at': event['cancelled_at'].isoformat() if event.get('cancelled_at') else None
        }
