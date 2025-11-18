"""
Comments Routes

Endpoints for procurement comments and discussions
"""

from flask import Blueprint, request, g
from bson import ObjectId
from config.database import db
from middleware.auth import token_required
from models.comment import Comment
from utils.response import success_response, error_response
from datetime import datetime

comments_bp = Blueprint('comments', __name__)


@comments_bp.route('', methods=['POST'])
def create_comment():
    """
    Create a new comment on a procurement (public - allows anonymous)
    """
    try:
        data = request.get_json()

        # Validate required fields
        if 'procurement_id' not in data:
            return error_response('procurement_id is required', 400)
        if 'content' not in data or not data['content'].strip():
            return error_response('content is required', 400)

        # Get user ID if authenticated, otherwise allow anonymous
        user_id = None
        user_name = data.get('name', 'Anonymous')
        anonymous = data.get('anonymous', False)

        # Check if user is authenticated
        if hasattr(g, 'current_user') and g.current_user:
            user_id = g.current_user['_id']
            if not anonymous:
                user = db.users.find_one({'_id': ObjectId(user_id)})
                user_name = user.get('full_name') if user else 'Unknown User'

        # Create comment with optional user_id
        comment_data = {
            'procurement_id': ObjectId(data['procurement_id']),
            'user_id': ObjectId(user_id) if user_id else None,
            'user_name': user_name,
            'content': data['content'].strip(),
            'parent_id': ObjectId(data['parent_id']) if data.get('parent_id') else None,
            'anonymous': anonymous,
            'edited': False,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }

        result = db.comments.insert_one(comment_data)
        comment_data['_id'] = result.inserted_id

        # Get user info if not anonymous
        user_info = None
        if user_id and not anonymous:
            user = db.users.find_one({'_id': ObjectId(user_id)})
            user_info = user

        return success_response(
            data=Comment.to_dict(comment_data, user_info),
            message='Comment created successfully',
            status_code=201
        )

    except Exception as e:
        return error_response(f'Failed to create comment: {str(e)}', 500)


@comments_bp.route('/procurement/<procurement_id>', methods=['GET'])
def get_procurement_comments(procurement_id):
    """
    Get all comments for a specific procurement (public endpoint)
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)

        # Get total count
        total = db.comments.count_documents({'procurement_id': ObjectId(procurement_id)})

        # Get comments
        comments = list(db.comments.find({'procurement_id': ObjectId(procurement_id)})
                       .sort('created_at', -1)
                       .skip((page - 1) * per_page)
                       .limit(per_page))

        # Get user info for each comment
        comments_list = []
        for comment in comments:
            user = db.users.find_one({'_id': comment['user_id']})
            comments_list.append(Comment.to_dict(comment, user))

        return success_response(
            data={
                'items': comments_list,
                'total': total,
                'page': page,
                'per_page': per_page,
                'pages': (total + per_page - 1) // per_page
            },
            message='Comments retrieved successfully'
        )

    except Exception as e:
        return error_response(f'Failed to retrieve comments: {str(e)}', 500)


@comments_bp.route('/<comment_id>', methods=['PUT'])
@token_required
def update_comment(comment_id):
    """
    Update a comment (only by the comment owner)
    """
    try:
        data = request.get_json()

        if 'content' not in data or not data['content'].strip():
            return error_response('content is required', 400)

        # Check if comment exists and belongs to user
        comment = db.comments.find_one({'_id': ObjectId(comment_id)})

        if not comment:
            return error_response('Comment not found', 404)

        if str(comment['user_id']) != str(g.current_user['_id']):
            return error_response('You can only edit your own comments', 403)

        # Update comment
        result = db.comments.update_one(
            {'_id': ObjectId(comment_id)},
            {
                '$set': {
                    'content': data['content'].strip(),
                    'edited': True,
                    'updated_at': datetime.utcnow()
                }
            }
        )

        if result.matched_count == 0:
            return error_response('Comment not found', 404)

        # Get updated comment with user info
        updated_comment = db.comments.find_one({'_id': ObjectId(comment_id)})
        user = db.users.find_one({'_id': updated_comment['user_id']})

        return success_response(
            data=Comment.to_dict(updated_comment, user),
            message='Comment updated successfully'
        )

    except Exception as e:
        return error_response(f'Failed to update comment: {str(e)}', 500)


@comments_bp.route('/<comment_id>', methods=['DELETE'])
@token_required
def delete_comment(comment_id):
    """
    Delete a comment (only by the comment owner or admin)
    """
    try:
        # Check if comment exists
        comment = db.comments.find_one({'_id': ObjectId(comment_id)})

        if not comment:
            return error_response('Comment not found', 404)

        # Check permissions
        user_role = g.current_user.get('role')
        is_owner = str(comment['user_id']) == str(g.current_user['_id'])
        is_admin = user_role == 'admin'

        if not (is_owner or is_admin):
            return error_response('You can only delete your own comments', 403)

        # Delete comment
        db.comments.delete_one({'_id': ObjectId(comment_id)})

        # Also delete replies if any
        db.comments.delete_many({'parent_id': ObjectId(comment_id)})

        return success_response(
            data=None,
            message='Comment deleted successfully'
        )

    except Exception as e:
        return error_response(f'Failed to delete comment: {str(e)}', 500)


@comments_bp.route('/procurement/<procurement_id>/count', methods=['GET'])
def get_procurement_comment_count(procurement_id):
    """
    Get count of comments for a specific procurement
    """
    try:
        count = db.comments.count_documents({'procurement_id': ObjectId(procurement_id)})

        return success_response(
            data={'count': count},
            message='Comment count retrieved successfully'
        )

    except Exception as e:
        return error_response(f'Failed to get comment count: {str(e)}', 500)
