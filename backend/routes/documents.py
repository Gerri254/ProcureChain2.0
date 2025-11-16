"""Document upload and management API routes"""
from flask import Blueprint, request, g, send_file
from werkzeug.utils import secure_filename
import io
from services.document_service import document_service
from services.procurement_service import procurement_service
from services.gemini_service import gemini_service
from services.audit_service import audit_service
from middleware.auth import token_required, role_required
from utils.response import success_response, error_response, not_found_response, validation_error_response
from utils.validators import validate_file_extension, validate_file_size
from config.settings import get_config

documents_bp = Blueprint('documents', __name__, url_prefix='/api/documents')


@documents_bp.route('/upload', methods=['POST'])
@token_required
@role_required('admin', 'procurement_officer')
def upload_document():
    """Upload procurement document"""
    try:
        config = get_config()

        # Check if file is in request
        if 'file' not in request.files:
            return error_response('No file provided', status_code=400)

        file = request.files['file']

        if file.filename == '':
            return error_response('No file selected', status_code=400)

        # Validate file extension
        if not validate_file_extension(file.filename, config.ALLOWED_EXTENSIONS):
            return error_response(
                f'Invalid file type. Allowed: {", ".join(config.ALLOWED_EXTENSIONS)}',
                status_code=400
            )

        # Validate file size
        if not validate_file_size(file, config.MAX_FILE_SIZE):
            max_mb = config.MAX_FILE_SIZE / (1024 * 1024)
            return error_response(f'File too large. Maximum size: {max_mb}MB', status_code=400)

        # Get optional procurement_id
        procurement_id = request.form.get('procurement_id')

        # Verify procurement exists if provided
        if procurement_id:
            procurement = procurement_service.get_procurement_by_id(procurement_id)
            if not procurement:
                return not_found_response('Procurement')

        # Read file data
        file_data = file.read()
        filename = secure_filename(file.filename)
        content_type = file.content_type or 'application/octet-stream'

        # Upload to GridFS
        file_id = document_service.upload_document(
            file_data=file_data,
            filename=filename,
            content_type=content_type,
            procurement_id=procurement_id,
            uploaded_by=g.user_id
        )

        # If procurement_id provided, add document reference
        if procurement_id:
            procurement_service.add_document(
                procurement_id=procurement_id,
                file_id=file_id,
                filename=filename,
                file_type=content_type
            )

        # Process with Gemini AI for document parsing
        try:
            gemini_result = gemini_service.parse_procurement_document(file_data, content_type)

            # Update document with extracted data
            document_service.update_gemini_analysis(file_id, gemini_result)

            # If we have procurement data and no procurement_id, create one
            if not procurement_id and gemini_result.get('title'):
                procurement_data = gemini_result
                procurement_data['documents'] = [{
                    'file_id': file_id,
                    'file_name': filename,
                    'file_type': content_type
                }]

                new_procurement_id = procurement_service.create_procurement(
                    procurement_data,
                    created_by=g.user_id
                )

                procurement_id = new_procurement_id

        except Exception as e:
            print(f"Gemini processing error: {e}")
            gemini_result = {'error': str(e)}

        # Log action
        audit_service.log_document_action(
            document_id=file_id,
            action='upload',
            filename=filename,
            procurement_id=procurement_id
        )

        return success_response(
            {
                'document_id': file_id,
                'filename': filename,
                'procurement_id': procurement_id,
                'gemini_analysis': gemini_result
            },
            message='Document uploaded successfully',
            status_code=201
        )

    except Exception as e:
        print(f"Error uploading document: {e}")
        return error_response('Failed to upload document', status_code=500)


@documents_bp.route('/<document_id>', methods=['GET'])
@token_required
def get_document_metadata(document_id):
    """Get document metadata"""
    try:
        metadata = document_service.get_document(document_id)

        if not metadata:
            return not_found_response('Document')

        return success_response(metadata)

    except Exception as e:
        print(f"Error fetching document metadata: {e}")
        return error_response('Failed to fetch document', status_code=500)


@documents_bp.route('/<document_id>/download', methods=['GET'])
@token_required
def download_document(document_id):
    """Download document file"""
    try:
        # Get document metadata
        metadata = document_service.get_document(document_id)

        if not metadata:
            return not_found_response('Document')

        # Get document data
        file_data = document_service.get_document_data(document_id)

        if not file_data:
            return error_response('Failed to retrieve document data', status_code=500)

        # Log action
        audit_service.log_document_action(
            document_id=document_id,
            action='download',
            filename=metadata.get('filename')
        )

        # Return file
        return send_file(
            io.BytesIO(file_data),
            mimetype=metadata.get('content_type', 'application/octet-stream'),
            as_attachment=True,
            download_name=metadata.get('filename', 'document')
        )

    except Exception as e:
        print(f"Error downloading document: {e}")
        return error_response('Failed to download document', status_code=500)


@documents_bp.route('/<document_id>', methods=['DELETE'])
@token_required
@role_required('admin', 'procurement_officer')
def delete_document(document_id):
    """Delete document"""
    try:
        # Get metadata first
        metadata = document_service.get_document(document_id)

        if not metadata:
            return not_found_response('Document')

        # Delete document
        success = document_service.delete_document(document_id)

        if not success:
            return error_response('Failed to delete document')

        # Log action
        audit_service.log_document_action(
            document_id=document_id,
            action='delete',
            filename=metadata.get('filename')
        )

        return success_response(message='Document deleted successfully')

    except Exception as e:
        print(f"Error deleting document: {e}")
        return error_response('Failed to delete document', status_code=500)


@documents_bp.route('/procurement/<procurement_id>', methods=['GET'])
@token_required
def get_procurement_documents(procurement_id):
    """Get all documents for a procurement"""
    try:
        # Verify procurement exists
        procurement = procurement_service.get_procurement_by_id(procurement_id)

        if not procurement:
            return not_found_response('Procurement')

        # Get documents
        documents = document_service.get_document_by_procurement(procurement_id)

        return success_response({'documents': documents})

    except Exception as e:
        print(f"Error fetching procurement documents: {e}")
        return error_response('Failed to fetch documents', status_code=500)


@documents_bp.route('/<document_id>/parse', methods=['GET'])
@token_required
def get_parsed_data(document_id):
    """Get Gemini AI parsed data for document"""
    try:
        metadata = document_service.get_document(document_id)

        if not metadata:
            return not_found_response('Document')

        gemini_data = metadata.get('metadata', {}).get('gemini_analysis', {})

        if not gemini_data.get('processed'):
            return error_response('Document has not been processed by AI', status_code=404)

        return success_response(gemini_data)

    except Exception as e:
        print(f"Error fetching parsed data: {e}")
        return error_response('Failed to fetch parsed data', status_code=500)
