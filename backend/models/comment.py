"""
Comment Model

Handles comments and discussions on procurements
"""

from datetime import datetime
from bson import ObjectId


class Comment:
    """Comment model for procurement discussions"""

    @staticmethod
    def create(
        procurement_id: str,
        user_id: str,
        content: str,
        parent_id: str = None
    ) -> dict:
        """Create a new comment"""
        return {
            'procurement_id': ObjectId(procurement_id),
            'user_id': ObjectId(user_id),
            'content': content,
            'parent_id': ObjectId(parent_id) if parent_id else None,
            'edited': False,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }

    @staticmethod
    def to_dict(comment: dict, user: dict = None) -> dict:
        """Convert comment to dictionary for API response"""
        return {
            '_id': str(comment['_id']),
            'procurement_id': str(comment['procurement_id']),
            'user_id': str(comment['user_id']),
            'user': {
                'full_name': user.get('full_name') if user else 'Unknown User',
                'role': user.get('role') if user else 'public'
            } if user else None,
            'content': comment['content'],
            'parent_id': str(comment['parent_id']) if comment.get('parent_id') else None,
            'edited': comment.get('edited', False),
            'created_at': comment['created_at'].isoformat() if comment.get('created_at') else None,
            'updated_at': comment['updated_at'].isoformat() if comment.get('updated_at') else None
        }
