"""Vendor service for business logic and CRUD operations"""
from typing import Dict, List, Optional
from bson import ObjectId
from datetime import datetime
from config.database import db
from models.vendor import VendorModel
from utils.db_helpers import serialize_document, get_object_id, paginate_query


class VendorService:
    """Service for managing vendor records"""

    def __init__(self):
        self.collection = db.vendors

    def create_vendor(self, data: Dict) -> str:
        """
        Create new vendor record

        Args:
            data: Vendor data

        Returns:
            Created vendor ID
        """
        # Create schema
        record = VendorModel.create_schema(data)

        # Insert into database
        result = self.collection.insert_one(record)

        return str(result.inserted_id)

    def get_vendor_by_id(self, vendor_id: str) -> Optional[Dict]:
        """
        Get vendor record by ID

        Args:
            vendor_id: Vendor ID

        Returns:
            Vendor record or None
        """
        obj_id = get_object_id(vendor_id)

        if not obj_id:
            return None

        record = self.collection.find_one({'_id': obj_id})

        return serialize_document(record)

    def get_vendor_by_registration(self, registration_number: str) -> Optional[Dict]:
        """
        Get vendor by registration number

        Args:
            registration_number: Registration number

        Returns:
            Vendor record or None
        """
        record = self.collection.find_one({'registration_number': registration_number})

        return serialize_document(record)

    def update_vendor(self, vendor_id: str, data: Dict) -> bool:
        """
        Update vendor record

        Args:
            vendor_id: Vendor ID
            data: Update data

        Returns:
            True if updated, False otherwise
        """
        obj_id = get_object_id(vendor_id)

        if not obj_id:
            return False

        # Remove fields that shouldn't be updated
        update_data = {k: v for k, v in data.items() if k not in ['_id', 'created_at', 'contract_history']}
        update_data['updated_at'] = datetime.utcnow()

        result = self.collection.update_one(
            {'_id': obj_id},
            {'$set': update_data}
        )

        return result.modified_count > 0

    def delete_vendor(self, vendor_id: str) -> bool:
        """
        Delete vendor record

        Args:
            vendor_id: Vendor ID

        Returns:
            True if deleted, False otherwise
        """
        obj_id = get_object_id(vendor_id)

        if not obj_id:
            return False

        result = self.collection.delete_one({'_id': obj_id})

        return result.deleted_count > 0

    def list_vendors(self, page: int = 1, limit: int = 20, search: str = None) -> Dict:
        """
        List vendor records with pagination

        Args:
            page: Page number
            limit: Results per page
            search: Search term

        Returns:
            Paginated results
        """
        query = {}

        if search:
            query['$or'] = [
                {'name': {'$regex': search, '$options': 'i'}},
                {'registration_number': {'$regex': search, '$options': 'i'}}
            ]

        return paginate_query(
            self.collection,
            query,
            page=page,
            limit=limit,
            sort_by='name',
            sort_order=1
        )

    def list_public_vendors(self, page: int = 1, limit: int = 20) -> Dict:
        """
        List public vendor records

        Args:
            page: Page number
            limit: Results per page

        Returns:
            Paginated results with public view
        """
        results = paginate_query(
            self.collection,
            {},
            page=page,
            limit=limit,
            sort_by='name',
            sort_order=1
        )

        # Convert to public view
        results['results'] = [
            VendorModel.create_public_view(record)
            for record in results['results']
        ]

        return results

    def add_contract(
        self,
        vendor_id: str,
        procurement_id: str,
        amount: float,
        date_awarded: datetime
    ) -> bool:
        """
        Add contract to vendor's history

        Args:
            vendor_id: Vendor ID
            procurement_id: Procurement ID
            amount: Contract amount
            date_awarded: Award date

        Returns:
            True if added, False otherwise
        """
        vendor_obj_id = get_object_id(vendor_id)
        procurement_obj_id = get_object_id(procurement_id)

        if not vendor_obj_id or not procurement_obj_id:
            return False

        contract_record = VendorModel.add_contract_record(
            procurement_obj_id,
            amount,
            date_awarded
        )

        result = self.collection.update_one(
            {'_id': vendor_obj_id},
            {
                '$push': {'contract_history': contract_record},
                '$set': {'updated_at': datetime.utcnow()}
            }
        )

        if result.modified_count > 0:
            # Update performance metrics
            self.update_metrics(vendor_id)
            return True

        return False

    def update_metrics(self, vendor_id: str) -> bool:
        """
        Recalculate and update vendor performance metrics

        Args:
            vendor_id: Vendor ID

        Returns:
            True if updated, False otherwise
        """
        vendor = self.get_vendor_by_id(vendor_id)

        if not vendor:
            return False

        metrics = VendorModel.update_performance_metrics(vendor)

        obj_id = get_object_id(vendor_id)

        result = self.collection.update_one(
            {'_id': obj_id},
            {
                '$set': {
                    'performance_metrics': metrics,
                    'updated_at': datetime.utcnow()
                }
            }
        )

        return result.modified_count > 0

    def get_top_vendors(self, limit: int = 10) -> List[Dict]:
        """
        Get top vendors by contract value

        Args:
            limit: Number of vendors to return

        Returns:
            List of top vendors
        """
        pipeline = [
            {
                '$match': {
                    'performance_metrics.total_contracts': {'$gt': 0}
                }
            },
            {
                '$sort': {
                    'performance_metrics.total_value': -1
                }
            },
            {
                '$limit': limit
            },
            {
                '$project': {
                    'name': 1,
                    'registration_number': 1,
                    'performance_metrics': 1
                }
            }
        ]

        results = list(self.collection.aggregate(pipeline))

        return serialize_document(results)

    def update_risk_score(self, vendor_id: str, risk_score: float) -> bool:
        """
        Update vendor risk score

        Args:
            vendor_id: Vendor ID
            risk_score: New risk score

        Returns:
            True if updated, False otherwise
        """
        obj_id = get_object_id(vendor_id)

        if not obj_id:
            return False

        result = self.collection.update_one(
            {'_id': obj_id},
            {
                '$set': {
                    'metadata.risk_score': risk_score,
                    'updated_at': datetime.utcnow()
                }
            }
        )

        return result.modified_count > 0


# Singleton instance
vendor_service = VendorService()
