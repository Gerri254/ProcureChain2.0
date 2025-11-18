"""Procurement service for business logic and CRUD operations"""
from typing import Dict, List, Optional
from bson import ObjectId
from datetime import datetime
from config.database import db
from models.procurement import ProcurementModel
from utils.db_helpers import serialize_document, get_object_id, paginate_query


class ProcurementService:
    """Service for managing procurement records"""

    def __init__(self):
        self.collection = db.procurements

    def create_procurement(self, data: Dict, created_by: str = None) -> str:
        """
        Create new procurement record

        Args:
            data: Procurement data
            created_by: User ID who created the record

        Returns:
            Created procurement ID
        """
        # Add creator
        if created_by:
            data['created_by'] = ObjectId(created_by)

        # Create schema
        record = ProcurementModel.create_schema(data)

        # Insert into database
        result = self.collection.insert_one(record)

        return str(result.inserted_id)

    def get_procurement_by_id(self, procurement_id: str) -> Optional[Dict]:
        """
        Get procurement record by ID

        Args:
            procurement_id: Procurement ID

        Returns:
            Procurement record or None
        """
        obj_id = get_object_id(procurement_id)

        if not obj_id:
            return None

        record = self.collection.find_one({'_id': obj_id})

        return serialize_document(record)

    def get_procurement_by_tender_number(self, tender_number: str) -> Optional[Dict]:
        """
        Get procurement record by tender number

        Args:
            tender_number: Tender number

        Returns:
            Procurement record or None
        """
        record = self.collection.find_one({'tender_number': tender_number})

        return serialize_document(record)

    def update_procurement(self, procurement_id: str, data: Dict) -> bool:
        """
        Update procurement record

        Args:
            procurement_id: Procurement ID
            data: Update data

        Returns:
            True if updated, False otherwise
        """
        obj_id = get_object_id(procurement_id)

        if not obj_id:
            return False

        # Create update schema
        update_fields = ProcurementModel.update_schema(data)

        # Update record
        result = self.collection.update_one(
            {'_id': obj_id},
            {'$set': update_fields}
        )

        return result.modified_count > 0

    def delete_procurement(self, procurement_id: str) -> bool:
        """
        Delete procurement record

        Args:
            procurement_id: Procurement ID

        Returns:
            True if deleted, False otherwise
        """
        obj_id = get_object_id(procurement_id)

        if not obj_id:
            return False

        result = self.collection.delete_one({'_id': obj_id})

        return result.deleted_count > 0

    def list_procurements(
        self,
        page: int = 1,
        limit: int = 20,
        status: str = None,
        category: str = None,
        search: str = None
    ) -> Dict:
        """
        List procurement records with pagination and filters

        Args:
            page: Page number
            limit: Results per page
            status: Filter by status
            category: Filter by category
            search: Search term

        Returns:
            Paginated results
        """
        query = {}

        # Apply filters
        if status:
            query['status'] = status

        if category:
            query['category'] = category

        if search:
            query['$or'] = [
                {'title': {'$regex': search, '$options': 'i'}},
                {'description': {'$regex': search, '$options': 'i'}},
                {'tender_number': {'$regex': search, '$options': 'i'}}
            ]

        # Paginate
        return paginate_query(
            self.collection,
            query,
            page=page,
            limit=limit,
            sort_by='published_date',
            sort_order=-1
        )

    def list_public_procurements(self, page: int = 1, limit: int = 20) -> Dict:
        """
        List public procurement records (published only)

        Args:
            page: Page number
            limit: Results per page

        Returns:
            Paginated results with public view
        """
        query = {'status': 'published'}

        results = paginate_query(
            self.collection,
            query,
            page=page,
            limit=limit,
            sort_by='published_date',
            sort_order=-1
        )

        # Convert to public view
        results['results'] = [
            ProcurementModel.create_public_view(record)
            for record in results['results']
        ]

        return results

    def add_document(self, procurement_id: str, file_id: ObjectId, filename: str, file_type: str) -> bool:
        """
        Add document reference to procurement record

        Args:
            procurement_id: Procurement ID
            file_id: GridFS file ID
            filename: Original filename
            file_type: File MIME type

        Returns:
            True if added, False otherwise
        """
        obj_id = get_object_id(procurement_id)

        if not obj_id:
            return False

        document_ref = ProcurementModel.add_document_reference(file_id, filename, file_type)

        result = self.collection.update_one(
            {'_id': obj_id},
            {
                '$push': {'documents': document_ref},
                '$set': {'updated_at': datetime.utcnow()}
            }
        )

        return result.modified_count > 0

    def update_ai_metadata(self, procurement_id: str, ai_analysis: Dict, risk_score: float) -> bool:
        """
        Update AI analysis metadata for procurement

        Args:
            procurement_id: Procurement ID
            ai_analysis: AI analysis results
            risk_score: Risk score from analysis

        Returns:
            True if updated, False otherwise
        """
        obj_id = get_object_id(procurement_id)

        if not obj_id:
            return False

        result = self.collection.update_one(
            {'_id': obj_id},
            {
                '$set': {
                    'metadata.ai_analyzed': True,
                    'metadata.ai_analysis_date': datetime.utcnow(),
                    'metadata.risk_score': risk_score,
                    'metadata.has_anomalies': risk_score > 50,
                    'updated_at': datetime.utcnow()
                }
            }
        )

        return result.modified_count > 0

    def get_by_category(self, category: str, limit: int = 100) -> List[Dict]:
        """
        Get procurement records by category

        Args:
            category: Procurement category
            limit: Maximum results

        Returns:
            List of procurement records
        """
        records = self.collection.find(
            {'category': category, 'status': {'$ne': 'draft'}}
        ).sort('published_date', -1).limit(limit)

        return serialize_document(list(records))

    def get_statistics(self) -> Dict:
        """
        Get procurement statistics

        Returns:
            Dictionary with statistics
        """
        pipeline = [
            {
                '$group': {
                    '_id': '$status',
                    'count': {'$sum': 1},
                    'total_value': {'$sum': '$estimated_value'}
                }
            }
        ]

        results = list(self.collection.aggregate(pipeline))

        stats = {
            'by_status': {},
            'total_procurements': 0,
            'total_value': 0
        }

        for item in results:
            status = item['_id']
            stats['by_status'][status] = {
                'count': item['count'],
                'total_value': item['total_value']
            }
            stats['total_procurements'] += item['count']
            stats['total_value'] += item['total_value']

        return stats


# Singleton instance
procurement_service = ProcurementService()
