"""Document service for GridFS file management"""
from typing import Dict, Optional, BinaryIO
from bson import ObjectId
from datetime import datetime
from config.database import db, gridfs
from werkzeug.utils import secure_filename
from utils.db_helpers import serialize_document, get_object_id


class DocumentService:
    """Service for managing documents using GridFS"""

    def __init__(self):
        self.fs = gridfs
        self.files_collection = db['documents.files']

    def upload_document(
        self,
        file_data: bytes,
        filename: str,
        content_type: str,
        procurement_id: str = None,
        uploaded_by: str = None
    ) -> str:
        """
        Upload document to GridFS

        Args:
            file_data: File binary data
            filename: Original filename
            content_type: MIME type
            procurement_id: Optional procurement reference
            uploaded_by: Optional user ID

        Returns:
            GridFS file ID
        """
        # Secure filename
        safe_filename = secure_filename(filename)

        # Prepare metadata
        metadata = {
            'original_filename': filename,
            'content_type': content_type,
            'file_size': len(file_data),
            'uploaded_at': datetime.utcnow(),
            'gemini_analysis': {
                'processed': False,
                'extracted_data': None,
                'processing_date': None
            }
        }

        if procurement_id:
            proc_obj_id = get_object_id(procurement_id)
            if proc_obj_id:
                metadata['procurement_id'] = proc_obj_id

        if uploaded_by:
            user_obj_id = get_object_id(uploaded_by)
            if user_obj_id:
                metadata['uploaded_by'] = user_obj_id

        # Store in GridFS
        file_id = self.fs.put(
            file_data,
            filename=safe_filename,
            content_type=content_type,
            metadata=metadata
        )

        return str(file_id)

    def get_document(self, file_id: str) -> Optional[Dict]:
        """
        Get document metadata by ID

        Args:
            file_id: GridFS file ID

        Returns:
            Document metadata or None
        """
        obj_id = get_object_id(file_id)

        if not obj_id:
            return None

        try:
            grid_out = self.fs.get(obj_id)

            metadata = {
                '_id': str(grid_out._id),
                'filename': grid_out.filename,
                'content_type': grid_out.content_type,
                'length': grid_out.length,
                'upload_date': grid_out.upload_date,
                'metadata': grid_out.metadata
            }

            return metadata

        except Exception as e:
            print(f"Error retrieving document: {e}")
            return None

    def get_document_data(self, file_id: str) -> Optional[bytes]:
        """
        Get document binary data

        Args:
            file_id: GridFS file ID

        Returns:
            Binary data or None
        """
        obj_id = get_object_id(file_id)

        if not obj_id:
            return None

        try:
            grid_out = self.fs.get(obj_id)
            return grid_out.read()

        except Exception as e:
            print(f"Error retrieving document data: {e}")
            return None

    def delete_document(self, file_id: str) -> bool:
        """
        Delete document from GridFS

        Args:
            file_id: GridFS file ID

        Returns:
            True if deleted, False otherwise
        """
        obj_id = get_object_id(file_id)

        if not obj_id:
            return False

        try:
            self.fs.delete(obj_id)
            return True

        except Exception as e:
            print(f"Error deleting document: {e}")
            return False

    def update_gemini_analysis(self, file_id: str, extracted_data: Dict) -> bool:
        """
        Update Gemini AI analysis results for document

        Args:
            file_id: GridFS file ID
            extracted_data: Extracted data from Gemini

        Returns:
            True if updated, False otherwise
        """
        obj_id = get_object_id(file_id)

        if not obj_id:
            return False

        try:
            result = self.files_collection.update_one(
                {'_id': obj_id},
                {
                    '$set': {
                        'metadata.gemini_analysis.processed': True,
                        'metadata.gemini_analysis.extracted_data': extracted_data,
                        'metadata.gemini_analysis.processing_date': datetime.utcnow()
                    }
                }
            )

            return result.modified_count > 0

        except Exception as e:
            print(f"Error updating Gemini analysis: {e}")
            return False

    def list_documents(
        self,
        procurement_id: str = None,
        limit: int = 50
    ) -> list:
        """
        List documents with optional filters

        Args:
            procurement_id: Filter by procurement ID
            limit: Maximum results

        Returns:
            List of document metadata
        """
        query = {}

        if procurement_id:
            proc_obj_id = get_object_id(procurement_id)
            if proc_obj_id:
                query['metadata.procurement_id'] = proc_obj_id

        documents = self.files_collection.find(query).limit(limit)

        return serialize_document(list(documents))

    def get_document_by_procurement(self, procurement_id: str) -> list:
        """
        Get all documents for a procurement

        Args:
            procurement_id: Procurement ID

        Returns:
            List of document metadata
        """
        return self.list_documents(procurement_id=procurement_id)


# Singleton instance
document_service = DocumentService()
