"""
Bid Routes

API endpoints for bid management
"""

from flask import Blueprint, request, jsonify
from services.bid_service import bid_service
from middleware.auth import token_required, role_required, optional_auth
from utils.response import success_response, error_response

bids_bp = Blueprint('bids', __name__, url_prefix='/api/bids')


@bids_bp.route('/procurement/<procurement_id>', methods=['POST'])
@token_required
@role_required(['vendor'])
def submit_bid(procurement_id, current_user):
    """
    Submit a bid for a procurement (vendors only)

    Body:
    {
        "bid_amount": 500000,
        "currency": "KES",
        "delivery_timeline": "60 days",
        "technical_proposal_file_id": "file_id",
        "technical_proposal_file_name": "technical.pdf",
        "financial_proposal_file_id": "file_id",
        "financial_proposal_file_name": "financial.pdf",
        "bid_bond_file_id": "file_id",
        "bid_bond_file_name": "bond.pdf",
        "bid_bond_amount": 50000,
        "bid_validity_days": 90,
        "remarks": "We are pleased to submit our bid..."
    }
    """
    try:
        data = request.get_json()

        # Use the vendor_id from the authenticated user
        vendor_id = current_user.get('vendor_id')
        if not vendor_id:
            return error_response('User is not associated with a vendor', 403)

        bid = bid_service.submit_bid(
            procurement_id=procurement_id,
            vendor_id=str(vendor_id),
            bid_data=data
        )

        return success_response(
            data=bid,
            message='Bid submitted successfully',
            status_code=201
        )
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response(f'Failed to submit bid: {str(e)}', 500)


@bids_bp.route('/procurement/<procurement_id>', methods=['GET'])
@token_required
@role_required(['admin', 'procurement_officer', 'auditor'])
def get_procurement_bids(procurement_id, current_user):
    """
    Get all bids for a procurement (officers only)

    Query params:
    - include_disqualified: true/false (default: false)
    """
    try:
        include_disqualified = request.args.get('include_disqualified', 'false').lower() == 'true'

        bids = bid_service.get_procurement_bids(
            procurement_id=procurement_id,
            include_disqualified=include_disqualified
        )

        return success_response(
            data=bids,
            message='Bids retrieved successfully'
        )
    except Exception as e:
        return error_response(f'Failed to retrieve bids: {str(e)}', 500)


@bids_bp.route('/vendor/my-bids', methods=['GET'])
@token_required
@role_required(['vendor'])
def get_my_bids(current_user):
    """Get all bids submitted by the current vendor"""
    try:
        vendor_id = current_user.get('vendor_id')
        if not vendor_id:
            return error_response('User is not associated with a vendor', 403)

        bids = bid_service.get_vendor_bids(str(vendor_id))

        return success_response(
            data=bids,
            message='Your bids retrieved successfully'
        )
    except Exception as e:
        return error_response(f'Failed to retrieve bids: {str(e)}', 500)


@bids_bp.route('/<bid_id>', methods=['GET'])
@token_required
def get_bid(bid_id, current_user):
    """
    Get a specific bid by ID

    Access control:
    - Vendors can only see their own bids
    - Officers can see all bids
    """
    try:
        bid = bid_service.get_bid_by_id(bid_id)

        if not bid:
            return error_response('Bid not found', 404)

        # Check access permissions
        user_role = current_user.get('role')
        if user_role == 'vendor':
            vendor_id = current_user.get('vendor_id')
            if str(bid['vendor_id']) != str(vendor_id):
                return error_response('Access denied', 403)

        return success_response(
            data=bid,
            message='Bid retrieved successfully'
        )
    except Exception as e:
        return error_response(f'Failed to retrieve bid: {str(e)}', 500)


@bids_bp.route('/<bid_id>/evaluate', methods=['POST'])
@token_required
@role_required(['admin', 'procurement_officer'])
def evaluate_bid(bid_id, current_user):
    """
    Add an evaluation to a bid (officers only)

    Body:
    {
        "technical_score": 85,
        "financial_score": 90,
        "comments": "Excellent proposal with competitive pricing"
    }
    """
    try:
        data = request.get_json()

        evaluator_id = str(current_user['_id'])

        bid = bid_service.evaluate_bid(
            bid_id=bid_id,
            evaluator_id=evaluator_id,
            evaluation_data=data
        )

        return success_response(
            data=bid,
            message='Bid evaluated successfully'
        )
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response(f'Failed to evaluate bid: {str(e)}', 500)


@bids_bp.route('/procurement/<procurement_id>/calculate-scores', methods=['POST'])
@token_required
@role_required(['admin', 'procurement_officer'])
def calculate_scores(procurement_id, current_user):
    """
    Calculate final scores and rankings for all bids (officers only)

    This aggregates all evaluations and ranks bids accordingly
    """
    try:
        bids = bid_service.calculate_final_scores(procurement_id)

        return success_response(
            data=bids,
            message='Scores calculated and rankings updated successfully'
        )
    except Exception as e:
        return error_response(f'Failed to calculate scores: {str(e)}', 500)


@bids_bp.route('/<bid_id>/award', methods=['POST'])
@token_required
@role_required(['admin', 'procurement_officer'])
def award_bid(bid_id, current_user):
    """
    Award a bid to the winning vendor (officers only)

    Body:
    {
        "awarded_amount": 480000,
        "notes": "After negotiation, final awarded amount is..."
    }
    """
    try:
        data = request.get_json()

        bid = bid_service.award_bid(
            bid_id=bid_id,
            award_data=data
        )

        return success_response(
            data=bid,
            message='Bid awarded successfully'
        )
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response(f'Failed to award bid: {str(e)}', 500)


@bids_bp.route('/<bid_id>/disqualify', methods=['POST'])
@token_required
@role_required(['admin', 'procurement_officer'])
def disqualify_bid(bid_id, current_user):
    """
    Disqualify a bid (officers only)

    Body:
    {
        "reason": "Failed to meet technical requirements..."
    }
    """
    try:
        data = request.get_json()
        reason = data.get('reason', '')

        bid = bid_service.disqualify_bid(
            bid_id=bid_id,
            reason=reason
        )

        return success_response(
            data=bid,
            message='Bid disqualified successfully'
        )
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response(f'Failed to disqualify bid: {str(e)}', 500)


@bids_bp.route('/procurement/<procurement_id>/statistics', methods=['GET'])
@token_required
@role_required(['admin', 'procurement_officer', 'auditor'])
def get_bid_statistics(procurement_id, current_user):
    """
    Get bid statistics for a procurement (officers only)

    Returns bid count, average amount, lowest/highest bids, etc.
    """
    try:
        stats = bid_service.get_bid_statistics(procurement_id)

        return success_response(
            data=stats,
            message='Bid statistics retrieved successfully'
        )
    except Exception as e:
        return error_response(f'Failed to retrieve statistics: {str(e)}', 500)


# Public endpoint for bid count (transparency)
@bids_bp.route('/procurement/<procurement_id>/count', methods=['GET'])
def get_bid_count(procurement_id):
    """
    Get the number of bids for a procurement (public endpoint)

    This promotes transparency without revealing bid details
    """
    try:
        stats = bid_service.get_bid_statistics(procurement_id)

        return success_response(
            data={'bid_count': stats.get('total_bids', 0)},
            message='Bid count retrieved successfully'
        )
    except Exception as e:
        return error_response(f'Failed to retrieve bid count: {str(e)}', 500)
