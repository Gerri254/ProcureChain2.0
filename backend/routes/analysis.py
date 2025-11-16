"""Analysis and anomaly detection API routes"""
from flask import Blueprint, request, g
from services.anomaly_service import anomaly_service
from services.audit_service import audit_service
from services.procurement_service import procurement_service
from middleware.auth import token_required, role_required
from utils.response import success_response, error_response, not_found_response, validation_error_response
from utils.validators import validate_pagination_params, validate_required_fields

analysis_bp = Blueprint('analysis', __name__, url_prefix='/api/analysis')


@analysis_bp.route('/anomaly/<procurement_id>', methods=['POST'])
@token_required
@role_required('admin', 'procurement_officer', 'auditor')
def analyze_procurement(procurement_id):
    """Trigger anomaly detection for procurement"""
    try:
        # Verify procurement exists
        procurement = procurement_service.get_procurement_by_id(procurement_id)

        if not procurement:
            return not_found_response('Procurement')

        # Run anomaly detection
        result = anomaly_service.detect_and_create_anomalies(procurement_id)

        if result.get('error'):
            return error_response(result['error'], status_code=500)

        # Log action
        audit_service.log_procurement_action(
            procurement_id=procurement_id,
            action='analyze_anomalies',
            procurement_title=procurement.get('title'),
            changes={'risk_score': result.get('risk_score'), 'anomalies_created': result.get('anomalies_created')}
        )

        return success_response(
            result,
            message='Analysis completed successfully'
        )

    except Exception as e:
        print(f"Error analyzing procurement: {e}")
        return error_response('Failed to analyze procurement', status_code=500)


@analysis_bp.route('/anomalies', methods=['GET'])
@token_required
def list_anomalies():
    """List all anomaly flags"""
    try:
        # Get query params
        page = request.args.get('page', 1)
        limit = request.args.get('limit', 20)
        status = request.args.get('status')
        severity = request.args.get('severity')
        min_risk_score = request.args.get('min_risk_score', type=float)

        page, limit = validate_pagination_params(page, limit)

        # Get anomalies
        results = anomaly_service.list_anomalies(
            page=page,
            limit=limit,
            status=status,
            severity=severity,
            min_risk_score=min_risk_score
        )

        return success_response(results)

    except Exception as e:
        print(f"Error listing anomalies: {e}")
        return error_response('Failed to list anomalies', status_code=500)


@analysis_bp.route('/anomalies/<anomaly_id>', methods=['GET'])
@token_required
def get_anomaly(anomaly_id):
    """Get specific anomaly flag"""
    try:
        anomaly = anomaly_service.get_anomaly_by_id(anomaly_id)

        if not anomaly:
            return not_found_response('Anomaly')

        return success_response(anomaly)

    except Exception as e:
        print(f"Error fetching anomaly: {e}")
        return error_response('Failed to fetch anomaly', status_code=500)


@analysis_bp.route('/anomalies/<anomaly_id>/resolve', methods=['PATCH'])
@token_required
@role_required('admin', 'auditor')
def resolve_anomaly(anomaly_id):
    """Resolve an anomaly flag"""
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['resolution_notes', 'status']
        is_valid, missing = validate_required_fields(data, required_fields)

        if not is_valid:
            return validation_error_response({'missing_fields': missing})

        # Validate status
        valid_statuses = ['resolved', 'false_positive', 'escalated']
        if data['status'] not in valid_statuses:
            return validation_error_response({'status': f'Must be one of: {valid_statuses}'})

        # Get existing anomaly
        existing = anomaly_service.get_anomaly_by_id(anomaly_id)

        if not existing:
            return not_found_response('Anomaly')

        # Resolve anomaly
        success = anomaly_service.resolve_anomaly(
            anomaly_id=anomaly_id,
            resolved_by=g.user_id,
            resolution_notes=data['resolution_notes'],
            status=data['status']
        )

        if not success:
            return error_response('Failed to resolve anomaly')

        # Log action
        audit_service.log_anomaly_action(
            anomaly_id=anomaly_id,
            action='resolve',
            changes={
                'status': data['status'],
                'resolution_notes': data['resolution_notes']
            }
        )

        return success_response(message='Anomaly resolved successfully')

    except Exception as e:
        print(f"Error resolving anomaly: {e}")
        return error_response('Failed to resolve anomaly', status_code=500)


@analysis_bp.route('/anomalies/high-risk', methods=['GET'])
@token_required
def get_high_risk_anomalies():
    """Get high-risk anomalies"""
    try:
        min_risk_score = request.args.get('min_risk_score', 70, type=float)
        limit = request.args.get('limit', 50, type=int)

        anomalies = anomaly_service.get_high_risk_anomalies(
            min_risk_score=min_risk_score,
            limit=limit
        )

        return success_response({'anomalies': anomalies})

    except Exception as e:
        print(f"Error fetching high-risk anomalies: {e}")
        return error_response('Failed to fetch high-risk anomalies', status_code=500)


@analysis_bp.route('/anomalies/procurement/<procurement_id>', methods=['GET'])
@token_required
def get_procurement_anomalies(procurement_id):
    """Get all anomalies for a procurement"""
    try:
        # Verify procurement exists
        procurement = procurement_service.get_procurement_by_id(procurement_id)

        if not procurement:
            return not_found_response('Procurement')

        # Get anomalies
        anomalies = anomaly_service.get_anomalies_by_procurement(procurement_id)

        return success_response({'anomalies': anomalies})

    except Exception as e:
        print(f"Error fetching procurement anomalies: {e}")
        return error_response('Failed to fetch anomalies', status_code=500)


@analysis_bp.route('/anomalies/statistics', methods=['GET'])
@token_required
def get_anomaly_statistics():
    """Get anomaly statistics"""
    try:
        stats = anomaly_service.get_statistics()

        return success_response(stats)

    except Exception as e:
        print(f"Error getting anomaly statistics: {e}")
        return error_response('Failed to get statistics', status_code=500)


@analysis_bp.route('/vendor/<vendor_id>/patterns', methods=['POST'])
@token_required
@role_required('admin', 'auditor')
def analyze_vendor_patterns(vendor_id):
    """Analyze vendor procurement patterns"""
    try:
        result = anomaly_service.analyze_vendor_patterns(vendor_id)

        if result.get('error'):
            return error_response(result['error'], status_code=500)

        return success_response(
            result,
            message='Vendor pattern analysis completed'
        )

    except Exception as e:
        print(f"Error analyzing vendor patterns: {e}")
        return error_response('Failed to analyze vendor patterns', status_code=500)
