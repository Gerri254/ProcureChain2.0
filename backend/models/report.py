"""
Report Model

Handles whistleblowing and issue reporting for procurements
"""

from datetime import datetime
from typing import Optional
from bson import ObjectId


class Report:
    """Report model for whistleblowing and issue reporting"""

    @staticmethod
    def create(
        procurement_id: str,
        reporter_id: Optional[str],
        report_type: str,
        category: str,
        title: str,
        description: str,
        evidence: Optional[list] = None,
        anonymous: bool = False
    ) -> dict:
        """Create a new report"""
        return {
            'procurement_id': ObjectId(procurement_id),
            'reporter_id': ObjectId(reporter_id) if reporter_id and not anonymous else None,
            'report_type': report_type,  # 'whistleblow', 'issue', 'complaint'
            'category': category,  # 'corruption', 'fraud', 'irregularity', 'quality', 'delay', 'other'
            'title': title,
            'description': description,
            'evidence': evidence or [],
            'anonymous': anonymous,
            'status': 'pending',  # pending, under_review, resolved, dismissed
            'severity': 'medium',  # low, medium, high, critical
            'assigned_to': None,
            'resolution': None,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'resolved_at': None
        }

    @staticmethod
    def to_dict(report: dict) -> dict:
        """Convert report to dictionary for API response"""
        return {
            '_id': str(report['_id']),
            'procurement_id': str(report['procurement_id']),
            'reporter_id': str(report['reporter_id']) if report.get('reporter_id') else None,
            'report_type': report['report_type'],
            'category': report['category'],
            'title': report['title'],
            'description': report['description'],
            'evidence': report.get('evidence', []),
            'anonymous': report.get('anonymous', False),
            'status': report['status'],
            'severity': report.get('severity', 'medium'),
            'assigned_to': str(report['assigned_to']) if report.get('assigned_to') else None,
            'resolution': report.get('resolution'),
            'created_at': report['created_at'].isoformat() if report.get('created_at') else None,
            'updated_at': report['updated_at'].isoformat() if report.get('updated_at') else None,
            'resolved_at': report['resolved_at'].isoformat() if report.get('resolved_at') else None
        }
