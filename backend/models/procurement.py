"""Procurement data models and business logic"""
from datetime import datetime
from typing import Dict, List, Optional
from bson import ObjectId


class ProcurementModel:
    """Model for procurement records"""

    VALID_STATUSES = ['draft', 'published', 'awarded', 'cancelled', 'completed']
    VALID_CATEGORIES = [
        'infrastructure',
        'supplies',
        'services',
        'consultancy',
        'works',
        'goods',
        'equipment',
        'other'
    ]

    @staticmethod
    def create_schema(data: Dict) -> Dict:
        """
        Create procurement record schema

        Args:
            data: Procurement data

        Returns:
            Validated procurement record
        """
        now = datetime.utcnow()

        return {
            'tender_number': data.get('tender_number'),
            'title': data.get('title'),
            'description': data.get('description', ''),
            'category': data.get('category', 'other'),
            'estimated_value': float(data.get('estimated_value', 0)),
            'currency': data.get('currency', 'KES'),
            'status': data.get('status', 'draft'),
            'published_date': data.get('published_date'),
            'deadline': data.get('deadline'),
            'eligibility_criteria': data.get('eligibility_criteria', []),
            'evaluation_criteria': data.get('evaluation_criteria', []),
            'required_documents': data.get('required_documents', []),
            'contact_info': data.get('contact_info', {}),
            'awarded_vendor_id': data.get('awarded_vendor_id'),
            'awarded_amount': data.get('awarded_amount'),
            'awarded_date': data.get('awarded_date'),
            'documents': data.get('documents', []),
            'metadata': {
                'ai_analyzed': data.get('ai_analyzed', False),
                'ai_analysis_date': data.get('ai_analysis_date'),
                'has_anomalies': data.get('has_anomalies', False),
                'risk_score': data.get('risk_score', 0)
            },
            'created_at': now,
            'updated_at': now,
            'created_by': data.get('created_by')
        }

    @staticmethod
    def update_schema(data: Dict) -> Dict:
        """
        Create update schema for procurement record

        Args:
            data: Update data

        Returns:
            Update dictionary
        """
        update_fields = {}

        # Updateable fields
        updateable_fields = [
            'title', 'description', 'category', 'estimated_value',
            'currency', 'status', 'published_date', 'deadline',
            'eligibility_criteria', 'evaluation_criteria',
            'required_documents', 'contact_info', 'awarded_vendor_id',
            'awarded_amount', 'awarded_date'
        ]

        for field in updateable_fields:
            if field in data and data[field] is not None:
                update_fields[field] = data[field]

        # Always update timestamp
        update_fields['updated_at'] = datetime.utcnow()

        return update_fields

    @staticmethod
    def validate_status(status: str) -> bool:
        """Validate procurement status"""
        return status in ProcurementModel.VALID_STATUSES

    @staticmethod
    def validate_category(category: str) -> bool:
        """Validate procurement category"""
        return category in ProcurementModel.VALID_CATEGORIES

    @staticmethod
    def add_document_reference(file_id: ObjectId, filename: str, file_type: str) -> Dict:
        """
        Create document reference for procurement record

        Args:
            file_id: GridFS file ID
            filename: Original filename
            file_type: File MIME type

        Returns:
            Document reference dictionary
        """
        return {
            'file_id': file_id,
            'file_name': filename,
            'file_type': file_type,
            'uploaded_at': datetime.utcnow()
        }

    @staticmethod
    def create_public_view(record: Dict) -> Dict:
        """
        Create public view of procurement record (removes sensitive data)

        Args:
            record: Full procurement record

        Returns:
            Public-safe procurement record
        """
        public_fields = [
            '_id', 'tender_number', 'title', 'description', 'category',
            'estimated_value', 'currency', 'status', 'published_date',
            'deadline', 'evaluation_criteria', 'required_documents',
            'contact_info', 'created_at'
        ]

        return {key: record.get(key) for key in public_fields if key in record}
