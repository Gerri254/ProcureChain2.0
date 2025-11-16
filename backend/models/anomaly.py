"""Anomaly flag data models"""
from datetime import datetime
from typing import Dict, List
from bson import ObjectId


class AnomalyModel:
    """Model for anomaly flags"""

    VALID_FLAG_TYPES = [
        'price_anomaly',
        'vendor_pattern',
        'timeline_issue',
        'missing_info',
        'compliance_issue',
        'document_inconsistency',
        'frequency_anomaly'
    ]

    VALID_SEVERITIES = ['low', 'medium', 'high', 'critical']
    VALID_STATUSES = ['pending', 'investigating', 'resolved', 'false_positive', 'escalated']

    @staticmethod
    def create_schema(procurement_id: ObjectId, anomaly_data: Dict) -> Dict:
        """
        Create anomaly flag schema

        Args:
            procurement_id: Reference to procurement record
            anomaly_data: Anomaly detection results from Gemini AI

        Returns:
            Validated anomaly record
        """
        now = datetime.utcnow()

        return {
            'procurement_id': procurement_id,
            'flag_type': anomaly_data.get('type', 'unknown'),
            'severity': anomaly_data.get('severity', 'low'),
            'risk_score': anomaly_data.get('risk_score', 0),
            'description': anomaly_data.get('description', ''),
            'ai_reasoning': anomaly_data.get('reasoning', ''),
            'details': {
                'detected_pattern': anomaly_data.get('detected_pattern', ''),
                'expected_value': anomaly_data.get('expected_value'),
                'actual_value': anomaly_data.get('actual_value'),
                'deviation_percentage': anomaly_data.get('deviation_percentage', 0),
                'comparison_metrics': anomaly_data.get('comparison_metrics', {})
            },
            'status': 'pending',
            'flagged_at': now,
            'resolved_at': None,
            'resolved_by': None,
            'resolution_notes': '',
            'notifications_sent': []
        }

    @staticmethod
    def create_from_gemini_analysis(procurement_id: ObjectId, gemini_result: Dict) -> List[Dict]:
        """
        Create multiple anomaly flags from Gemini AI analysis result

        Args:
            procurement_id: Reference to procurement record
            gemini_result: Complete Gemini analysis result

        Returns:
            List of anomaly flag records
        """
        anomalies = []

        risk_score = gemini_result.get('risk_score', 0)
        reasoning = gemini_result.get('reasoning', '')
        anomaly_flags = gemini_result.get('anomaly_flags', [])

        if risk_score > 50 and not anomaly_flags:
            # Create generic anomaly if high risk but no specific flags
            anomaly_data = {
                'type': 'compliance_issue',
                'severity': 'high' if risk_score > 75 else 'medium',
                'risk_score': risk_score,
                'description': 'High risk score detected',
                'reasoning': reasoning
            }
            anomalies.append(AnomalyModel.create_schema(procurement_id, anomaly_data))

        # Create specific anomaly flags
        for flag in anomaly_flags:
            anomaly_data = {
                **flag,
                'risk_score': risk_score,
                'reasoning': reasoning
            }
            anomalies.append(AnomalyModel.create_schema(procurement_id, anomaly_data))

        return anomalies

    @staticmethod
    def resolve_schema(resolved_by: ObjectId, resolution_notes: str, status: str = 'resolved') -> Dict:
        """
        Create resolution update schema

        Args:
            resolved_by: User ID who resolved the anomaly
            resolution_notes: Notes about resolution
            status: New status

        Returns:
            Update dictionary
        """
        return {
            '$set': {
                'status': status,
                'resolved_at': datetime.utcnow(),
                'resolved_by': resolved_by,
                'resolution_notes': resolution_notes
            }
        }

    @staticmethod
    def add_notification(notification_type: str, recipient: str) -> Dict:
        """
        Create notification record for push to array

        Args:
            notification_type: Type of notification (email, sms, etc.)
            recipient: Recipient identifier

        Returns:
            Notification record
        """
        return {
            'type': notification_type,
            'recipient': recipient,
            'sent_at': datetime.utcnow(),
            'status': 'sent'
        }

    @staticmethod
    def calculate_severity_from_risk_score(risk_score: float) -> str:
        """
        Calculate severity level from risk score

        Args:
            risk_score: Risk score (0-100)

        Returns:
            Severity level
        """
        if risk_score >= 80:
            return 'critical'
        elif risk_score >= 60:
            return 'high'
        elif risk_score >= 40:
            return 'medium'
        else:
            return 'low'
