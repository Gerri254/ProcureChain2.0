"""
Analytics Routes

Endpoints for advanced analytics and reporting
"""

from flask import Blueprint, request, jsonify
from middleware.auth import token_required, role_required
from services.analytics_service import analytics_service
from utils.response import success_response, error_response

analytics_bp = Blueprint('analytics', __name__)


@analytics_bp.route('/trends', methods=['GET'])
@token_required
@role_required(['admin', 'procurement_officer', 'auditor'])
def get_spending_trends():
    """
    Get spending trends over time
    Query params: days (default: 365)
    """
    try:
        days = request.args.get('days', 365, type=int)
        trends = analytics_service.get_spending_trends(days=days)

        return success_response(
            data=trends,
            message='Spending trends retrieved successfully'
        )
    except Exception as e:
        return error_response(f'Failed to retrieve spending trends: {str(e)}', 500)


@analytics_bp.route('/categories', methods=['GET'])
@token_required
@role_required(['admin', 'procurement_officer', 'auditor'])
def get_category_distribution():
    """
    Get procurement distribution by category
    """
    try:
        distribution = analytics_service.get_category_distribution()

        return success_response(
            data=distribution,
            message='Category distribution retrieved successfully'
        )
    except Exception as e:
        return error_response(f'Failed to retrieve category distribution: {str(e)}', 500)


@analytics_bp.route('/vendors/performance', methods=['GET'])
@token_required
@role_required(['admin', 'procurement_officer', 'auditor'])
def get_vendor_performance():
    """
    Get top vendor performance metrics
    Query params: limit (default: 10)
    """
    try:
        limit = request.args.get('limit', 10, type=int)
        performance = analytics_service.get_vendor_performance(limit=limit)

        return success_response(
            data=performance,
            message='Vendor performance retrieved successfully'
        )
    except Exception as e:
        return error_response(f'Failed to retrieve vendor performance: {str(e)}', 500)


@analytics_bp.route('/anomalies/breakdown', methods=['GET'])
@token_required
@role_required(['admin', 'auditor'])
def get_anomaly_breakdown():
    """
    Get anomaly statistics breakdown
    """
    try:
        breakdown = analytics_service.get_anomaly_breakdown()

        return success_response(
            data=breakdown,
            message='Anomaly breakdown retrieved successfully'
        )
    except Exception as e:
        return error_response(f'Failed to retrieve anomaly breakdown: {str(e)}', 500)


@analytics_bp.route('/metrics', methods=['GET'])
@token_required
@role_required(['admin', 'procurement_officer', 'auditor'])
def get_key_metrics():
    """
    Get key performance indicators
    """
    try:
        metrics = analytics_service.get_key_metrics()

        return success_response(
            data=metrics,
            message='Key metrics retrieved successfully'
        )
    except Exception as e:
        return error_response(f'Failed to retrieve key metrics: {str(e)}', 500)


@analytics_bp.route('/departments', methods=['GET'])
@token_required
@role_required(['admin', 'auditor'])
def get_department_analysis():
    """
    Get spending analysis by department
    """
    try:
        analysis = analytics_service.get_department_analysis()

        return success_response(
            data=analysis,
            message='Department analysis retrieved successfully'
        )
    except Exception as e:
        return error_response(f'Failed to retrieve department analysis: {str(e)}', 500)


@analytics_bp.route('/status/distribution', methods=['GET'])
@token_required
def get_status_distribution():
    """
    Get procurement distribution by status
    """
    try:
        distribution = analytics_service.get_status_distribution()

        return success_response(
            data=distribution,
            message='Status distribution retrieved successfully'
        )
    except Exception as e:
        return error_response(f'Failed to retrieve status distribution: {str(e)}', 500)


@analytics_bp.route('/timeline/<procurement_id>', methods=['GET'])
def get_procurement_timeline(procurement_id):
    """
    Get detailed timeline for a procurement (public endpoint)
    """
    try:
        timeline = analytics_service.get_timeline_data(procurement_id)

        if not timeline:
            return error_response('Procurement not found', 404)

        return success_response(
            data=timeline,
            message='Procurement timeline retrieved successfully'
        )
    except Exception as e:
        return error_response(f'Failed to retrieve timeline: {str(e)}', 500)
