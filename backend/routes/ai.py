"""AI-powered features API routes"""
from flask import Blueprint, request, g
from services.ai_service import ai_service
from services.procurement_service import procurement_service
from services.anomaly_service import anomaly_service
from services.vendor_service import vendor_service
from middleware.auth import token_required, optional_auth
from utils.response import success_response, error_response, not_found_response

ai_bp = Blueprint('ai', __name__, url_prefix='/api/ai')


@ai_bp.route('/status', methods=['GET'])
def get_ai_status():
    """Check if AI service is available"""
    try:
        is_available = ai_service.is_available()
        return success_response({
            'available': is_available,
            'message': 'AI service is ready' if is_available else 'AI service not configured'
        })
    except Exception as e:
        print(f"Error checking AI status: {e}")
        return error_response('Failed to check AI status', status_code=500)


@ai_bp.route('/explain-procurement/<procurement_id>', methods=['GET'])
@optional_auth
def explain_procurement(procurement_id):
    """
    Get AI-powered explanation of a procurement
    Public endpoint - anyone can get explanations
    """
    try:
        # Get procurement
        procurement = procurement_service.get_procurement_by_id(procurement_id)

        if not procurement:
            return not_found_response('Procurement')

        # Only explain published procurements for public
        if procurement.get('status') != 'published':
            # Check if user is authenticated with proper role
            if not hasattr(g, 'user_id'):
                return error_response('Procurement not available', status_code=404)

        # Get AI explanation
        explanation = ai_service.explain_procurement(procurement)

        return success_response({
            'procurement_id': procurement_id,
            'title': procurement.get('title'),
            'explanation': explanation
        })

    except Exception as e:
        print(f"Error explaining procurement: {e}")
        return error_response('Failed to generate explanation', status_code=500)


@ai_bp.route('/analyze-anomaly/<anomaly_id>', methods=['GET'])
@token_required
def analyze_anomaly(anomaly_id):
    """
    Get AI-powered analysis of an anomaly
    Requires authentication
    """
    try:
        # Get anomaly
        anomaly = anomaly_service.get_anomaly_by_id(anomaly_id)

        if not anomaly:
            return not_found_response('Anomaly')

        # Get related procurement if available
        procurement = None
        if anomaly.get('procurement_id'):
            procurement = procurement_service.get_procurement_by_id(str(anomaly['procurement_id']))

        # Get AI analysis
        analysis = ai_service.analyze_anomaly(anomaly, procurement)

        return success_response({
            'anomaly_id': anomaly_id,
            'anomaly_type': anomaly.get('anomaly_type'),
            'severity': anomaly.get('severity'),
            'analysis': analysis
        })

    except Exception as e:
        print(f"Error analyzing anomaly: {e}")
        return error_response('Failed to generate analysis', status_code=500)


@ai_bp.route('/verify-vendor', methods=['POST'])
@token_required
def verify_vendor():
    """
    Verify vendor information using AI
    Requires authentication
    """
    try:
        data = request.get_json()

        if not data:
            return error_response('No vendor data provided', status_code=400)

        # Get AI verification
        verification = ai_service.verify_vendor(data)

        return success_response({
            'vendor_name': data.get('name'),
            'verification': verification
        })

    except Exception as e:
        print(f"Error verifying vendor: {e}")
        return error_response('Failed to verify vendor', status_code=500)


@ai_bp.route('/suggest-improvements/<procurement_id>', methods=['GET'])
@token_required
def suggest_improvements(procurement_id):
    """
    Get AI suggestions to improve a procurement
    Requires authentication (admin/procurement_officer)
    """
    try:
        # Get procurement
        procurement = procurement_service.get_procurement_by_id(procurement_id)

        if not procurement:
            return not_found_response('Procurement')

        # Get AI suggestions
        suggestions = ai_service.suggest_improvements(procurement)

        return success_response({
            'procurement_id': procurement_id,
            'title': procurement.get('title'),
            'suggestions': suggestions
        })

    except Exception as e:
        print(f"Error generating suggestions: {e}")
        return error_response('Failed to generate suggestions', status_code=500)


@ai_bp.route('/batch-explain', methods=['POST'])
@optional_auth
def batch_explain_procurements():
    """
    Get AI explanations for multiple procurements
    Useful for list views
    """
    try:
        data = request.get_json()
        procurement_ids = data.get('procurement_ids', [])

        if not procurement_ids or len(procurement_ids) > 10:
            return error_response('Provide 1-10 procurement IDs', status_code=400)

        explanations = []
        for proc_id in procurement_ids:
            procurement = procurement_service.get_procurement_by_id(proc_id)
            if procurement and procurement.get('status') == 'published':
                explanation = ai_service.explain_procurement(procurement)
                explanations.append({
                    'procurement_id': proc_id,
                    'explanation': explanation
                })

        return success_response({
            'count': len(explanations),
            'explanations': explanations
        })

    except Exception as e:
        print(f"Error in batch explain: {e}")
        return error_response('Failed to generate explanations', status_code=500)
