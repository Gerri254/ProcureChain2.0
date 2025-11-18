"""
Procurement Events Routes

Endpoints for managing procurement lifecycle events
"""

from flask import Blueprint, request, g
from bson import ObjectId
from config.database import db
from middleware.auth import token_required, role_required
from models.procurement_event import ProcurementEvent
from utils.response import success_response, error_response
from datetime import datetime

events_bp = Blueprint('procurement_events', __name__)


@events_bp.route('', methods=['POST'])
@token_required
@role_required('admin', 'government_official')
def create_event():
    """
    Create a new procurement event
    """
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['procurement_id', 'event_type', 'title', 'description']
        for field in required_fields:
            if field not in data:
                return error_response(f'Missing required field: {field}', 400)

        # Validate event_type
        valid_types = ['published', 'evaluation', 'award', 'delivery', 'inspection', 'completion', 'milestone', 'other']
        if data['event_type'] not in valid_types:
            return error_response(f'Invalid event_type. Must be one of: {", ".join(valid_types)}', 400)

        # Create event
        event_data = ProcurementEvent.create(
            procurement_id=data['procurement_id'],
            event_type=data['event_type'],
            title=data['title'],
            description=data['description'],
            scheduled_date=data.get('scheduled_date'),
            created_by=str(g.current_user['_id']),
            files=data.get('files', []),
            findings=data.get('findings')
        )

        result = db.procurement_events.insert_one(event_data)
        event_data['_id'] = result.inserted_id

        return success_response(
            data=ProcurementEvent.to_dict(event_data),
            message='Event created successfully',
            status_code=201
        )

    except Exception as e:
        return error_response(f'Failed to create event: {str(e)}', 500)


@events_bp.route('/procurement/<procurement_id>', methods=['GET'])
def get_procurement_events(procurement_id):
    """
    Get all events for a procurement (public endpoint)
    """
    try:
        events = list(db.procurement_events.find({
            'procurement_id': ObjectId(procurement_id)
        }).sort('scheduled_date', 1))

        events_list = [ProcurementEvent.to_dict(event) for event in events]

        return success_response(
            data=events_list,
            message='Events retrieved successfully'
        )

    except Exception as e:
        return error_response(f'Failed to retrieve events: {str(e)}', 500)


@events_bp.route('/<event_id>', methods=['GET'])
def get_event(event_id):
    """
    Get a specific event by ID
    """
    try:
        event = db.procurement_events.find_one({'_id': ObjectId(event_id)})

        if not event:
            return error_response('Event not found', 404)

        return success_response(
            data=ProcurementEvent.to_dict(event),
            message='Event retrieved successfully'
        )

    except Exception as e:
        return error_response(f'Failed to retrieve event: {str(e)}', 500)


@events_bp.route('/<event_id>/status', methods=['PATCH'])
@token_required
@role_required('admin', 'government_official')
def update_event_status(event_id):
    """
    Update event status (pending, in_progress, completed, cancelled)
    """
    try:
        data = request.get_json()

        if 'status' not in data:
            return error_response('Status is required', 400)

        valid_statuses = ['pending', 'in_progress', 'completed', 'cancelled']
        if data['status'] not in valid_statuses:
            return error_response(f'Invalid status. Must be one of: {", ".join(valid_statuses)}', 400)

        update_data = {
            'status': data['status'],
            'updated_at': datetime.utcnow()
        }

        # Set completion/cancellation dates
        if data['status'] == 'completed':
            update_data['completed_at'] = datetime.utcnow()
            update_data['actual_date'] = datetime.utcnow()
        elif data['status'] == 'cancelled':
            update_data['cancelled_at'] = datetime.utcnow()

        # Update findings if provided
        if 'findings' in data:
            update_data['findings'] = data['findings']

        # Update files if provided
        if 'files' in data:
            update_data['files'] = data['files']

        result = db.procurement_events.update_one(
            {'_id': ObjectId(event_id)},
            {'$set': update_data}
        )

        if result.matched_count == 0:
            return error_response('Event not found', 404)

        updated_event = db.procurement_events.find_one({'_id': ObjectId(event_id)})

        return success_response(
            data=ProcurementEvent.to_dict(updated_event),
            message='Event status updated successfully'
        )

    except Exception as e:
        return error_response(f'Failed to update event: {str(e)}', 500)


@events_bp.route('/<event_id>/notes', methods=['POST'])
@token_required
def add_event_note(event_id):
    """
    Add a note to an event
    """
    try:
        data = request.get_json()

        if 'text' not in data:
            return error_response('Note text is required', 400)

        note = {
            'text': data['text'],
            'added_by': g.current_user['_id'],
            'added_at': datetime.utcnow()
        }

        result = db.procurement_events.update_one(
            {'_id': ObjectId(event_id)},
            {
                '$push': {'notes': note},
                '$set': {'updated_at': datetime.utcnow()}
            }
        )

        if result.matched_count == 0:
            return error_response('Event not found', 404)

        updated_event = db.procurement_events.find_one({'_id': ObjectId(event_id)})

        return success_response(
            data=ProcurementEvent.to_dict(updated_event),
            message='Note added successfully'
        )

    except Exception as e:
        return error_response(f'Failed to add note: {str(e)}', 500)


@events_bp.route('/<event_id>', methods=['DELETE'])
@token_required
@role_required('admin', 'government_official')
def delete_event(event_id):
    """
    Delete an event
    """
    try:
        result = db.procurement_events.delete_one({'_id': ObjectId(event_id)})

        if result.deleted_count == 0:
            return error_response('Event not found', 404)

        return success_response(
            message='Event deleted successfully'
        )

    except Exception as e:
        return error_response(f'Failed to delete event: {str(e)}', 500)
