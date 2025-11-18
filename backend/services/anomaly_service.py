"""Anomaly detection service with AI integration"""
from typing import Dict, List, Optional
from bson import ObjectId
from datetime import datetime
from config.database import db
from models.anomaly import AnomalyModel
from services.gemini_service import gemini_service
from services.procurement_service import procurement_service
from utils.db_helpers import serialize_document, get_object_id, paginate_query


class AnomalyService:
    """Service for anomaly detection and management"""

    def __init__(self):
        self.collection = db.anomalies

    def detect_and_create_anomalies(self, procurement_id: str) -> Dict:
        """
        Detect anomalies for procurement and create flags

        Args:
            procurement_id: Procurement ID to analyze

        Returns:
            Dictionary with analysis results
        """
        # Get procurement record
        procurement = procurement_service.get_procurement_by_id(procurement_id)

        if not procurement:
            return {'error': 'Procurement not found', 'anomalies_created': 0}

        # Get historical data for comparison
        category = procurement.get('category')
        historical_data = procurement_service.get_by_category(category, limit=100)

        # Run Gemini AI analysis
        gemini_result = gemini_service.detect_anomalies(procurement, historical_data)

        risk_score = gemini_result.get('risk_score', 0)

        # Update procurement metadata
        procurement_service.update_ai_metadata(procurement_id, gemini_result, risk_score)

        # Create anomaly flags if risk score is significant
        anomalies_created = 0

        if risk_score > 30:  # Threshold for creating anomaly flags
            proc_obj_id = get_object_id(procurement_id)
            anomaly_records = AnomalyModel.create_from_gemini_analysis(proc_obj_id, gemini_result)

            if anomaly_records:
                self.collection.insert_many(anomaly_records)
                anomalies_created = len(anomaly_records)

        return {
            'success': True,
            'risk_score': risk_score,
            'anomalies_created': anomalies_created,
            'analysis': gemini_result
        }

    def get_anomaly_by_id(self, anomaly_id: str) -> Optional[Dict]:
        """
        Get anomaly flag by ID

        Args:
            anomaly_id: Anomaly ID

        Returns:
            Anomaly record or None
        """
        obj_id = get_object_id(anomaly_id)

        if not obj_id:
            return None

        record = self.collection.find_one({'_id': obj_id})

        return serialize_document(record)

    def get_anomalies_by_procurement(self, procurement_id: str) -> List[Dict]:
        """
        Get all anomaly flags for a procurement

        Args:
            procurement_id: Procurement ID

        Returns:
            List of anomaly records
        """
        proc_obj_id = get_object_id(procurement_id)

        if not proc_obj_id:
            return []

        records = self.collection.find({'procurement_id': proc_obj_id}).sort('flagged_at', -1)

        return serialize_document(list(records))

    def list_anomalies(
        self,
        page: int = 1,
        limit: int = 20,
        status: str = None,
        severity: str = None,
        min_risk_score: float = None
    ) -> Dict:
        """
        List anomaly flags with pagination and filters

        Args:
            page: Page number
            limit: Results per page
            status: Filter by status
            severity: Filter by severity
            min_risk_score: Minimum risk score

        Returns:
            Paginated results
        """
        query = {}

        if status:
            query['status'] = status

        if severity:
            query['severity'] = severity

        if min_risk_score is not None:
            query['risk_score'] = {'$gte': min_risk_score}

        return paginate_query(
            self.collection,
            query,
            page=page,
            limit=limit,
            sort_by='flagged_at',
            sort_order=-1
        )

    def resolve_anomaly(
        self,
        anomaly_id: str,
        resolved_by: str,
        resolution_notes: str,
        status: str = 'resolved'
    ) -> bool:
        """
        Resolve anomaly flag

        Args:
            anomaly_id: Anomaly ID
            resolved_by: User ID who resolved it
            resolution_notes: Notes about resolution
            status: New status

        Returns:
            True if resolved, False otherwise
        """
        obj_id = get_object_id(anomaly_id)
        user_obj_id = get_object_id(resolved_by)

        if not obj_id or not user_obj_id:
            return False

        update_dict = AnomalyModel.resolve_schema(user_obj_id, resolution_notes, status)

        result = self.collection.update_one(
            {'_id': obj_id},
            update_dict
        )

        return result.modified_count > 0

    def get_high_risk_anomalies(self, min_risk_score: float = 70, limit: int = 50) -> List[Dict]:
        """
        Get high-risk anomalies

        Args:
            min_risk_score: Minimum risk score
            limit: Maximum results

        Returns:
            List of high-risk anomalies
        """
        records = self.collection.find({
            'risk_score': {'$gte': min_risk_score},
            'status': {'$in': ['pending', 'investigating']}
        }).sort('risk_score', -1).limit(limit)

        return serialize_document(list(records))

    def get_statistics(self) -> Dict:
        """
        Get anomaly statistics

        Returns:
            Dictionary with statistics
        """
        pipeline = [
            {
                '$group': {
                    '_id': '$status',
                    'count': {'$sum': 1},
                    'avg_risk_score': {'$avg': '$risk_score'}
                }
            }
        ]

        results = list(self.collection.aggregate(pipeline))

        stats = {
            'by_status': {},
            'total_anomalies': 0
        }

        for item in results:
            status = item['_id']
            stats['by_status'][status] = {
                'count': item['count'],
                'avg_risk_score': round(item['avg_risk_score'], 2)
            }
            stats['total_anomalies'] += item['count']

        # Add severity breakdown
        severity_pipeline = [
            {
                '$group': {
                    '_id': '$severity',
                    'count': {'$sum': 1}
                }
            }
        ]

        severity_results = list(self.collection.aggregate(severity_pipeline))
        stats['by_severity'] = {item['_id']: item['count'] for item in severity_results}

        return stats

    def analyze_vendor_patterns(self, vendor_id: str) -> Dict:
        """
        Analyze vendor patterns for anomalies

        Args:
            vendor_id: Vendor ID

        Returns:
            Analysis results
        """
        from services.vendor_service import vendor_service

        vendor = vendor_service.get_vendor_by_id(vendor_id)

        if not vendor:
            return {'error': 'Vendor not found'}

        contract_history = vendor.get('contract_history', [])

        if not contract_history:
            return {'message': 'No contract history available', 'vendor_risk_score': 0}

        # Use Gemini to analyze patterns
        analysis = gemini_service.analyze_vendor_patterns(contract_history)

        # Update vendor risk score
        vendor_risk_score = analysis.get('vendor_risk_score', 0)
        vendor_service.update_risk_score(vendor_id, vendor_risk_score)

        return analysis


# Singleton instance
anomaly_service = AnomalyService()
