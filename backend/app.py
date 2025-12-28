"""Main Flask application for ProcureChain backend"""
from flask import Flask, jsonify
from flask_cors import CORS
from config.settings import get_config
from config.database import db_instance
import os

# Import blueprints
from routes.procurement import procurement_bp
from routes.documents import documents_bp
from routes.analysis import analysis_bp
from routes.vendors import vendors_bp
from routes.auth import auth_bp
from routes.analytics import analytics_bp
from routes.questions import questions_bp
from routes.bids import bids_bp
from routes.reports import reports_bp
from routes.comments import comments_bp
from routes.procurement_events import events_bp
from routes.ai import ai_bp

# New SkillChain routes
from routes.skill_assessments import skill_assessment_bp
from routes.user_profiles import user_profile_bp
from routes.challenges import challenges_bp
from routes.job_postings import job_posting_bp
from routes.applications import applications_bp


def create_app():
    """Application factory pattern"""
    app = Flask(__name__)

    # Load configuration
    config = get_config()
    app.config.from_object(config)

    # Enable CORS
    CORS(app, origins=config.CORS_ORIGINS, supports_credentials=True)

    # Test database connection
    try:
        if db_instance.ping():
            print("✓ Database connection verified")
        else:
            print("✗ Database connection failed")
    except Exception as e:
        print(f"✗ Database error: {e}")

    # Register blueprints
    app.register_blueprint(procurement_bp)
    app.register_blueprint(documents_bp)
    app.register_blueprint(analysis_bp)
    app.register_blueprint(vendors_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(questions_bp)
    app.register_blueprint(bids_bp)
    app.register_blueprint(reports_bp, url_prefix='/api/reports')
    app.register_blueprint(comments_bp, url_prefix='/api/comments')
    app.register_blueprint(events_bp, url_prefix='/api/events')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')

    # New SkillChain routes
    app.register_blueprint(skill_assessment_bp)
    app.register_blueprint(user_profile_bp)
    app.register_blueprint(challenges_bp, url_prefix='/api/challenges')
    app.register_blueprint(job_posting_bp, url_prefix='/api/jobs')
    app.register_blueprint(applications_bp)

    # Health check endpoint
    @app.route('/health', methods=['GET'])
    def health_check():
        """Health check endpoint"""
        return jsonify({
            'status': 'healthy',
            'service': 'ProcureChain API',
            'version': '1.0.0'
        }), 200

    # Root endpoint
    @app.route('/', methods=['GET'])
    def root():
        """Root endpoint with API info"""
        return jsonify({
            'name': 'ProcureChain API',
            'version': '1.0.0',
            'description': 'Backend API for ProcureChain procurement transparency platform',
            'endpoints': {
                'health': '/health',
                'procurement': '/api/procurement',
                'documents': '/api/documents',
                'analysis': '/api/analysis',
                'vendors': '/api/vendors',
                'auth': '/api/auth',
                'analytics': '/api/analytics',
                'questions': '/api/questions',
                'bids': '/api/bids'
            },
            'documentation': 'See DESIGN_README.md for full API documentation'
        }), 200

    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'error': 'Resource not found'
        }), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({
            'success': False,
            'error': 'Access forbidden'
        }), 403

    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({
            'success': False,
            'error': 'Unauthorized'
        }), 401

    # Request logging (optional)
    @app.before_request
    def log_request():
        """Log incoming requests (optional)"""
        pass

    @app.after_request
    def after_request(response):
        """Add headers to response"""
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        return response

    return app


# Create app instance
app = create_app()


if __name__ == '__main__':
    config = get_config()

    print("\n" + "="*50)
    print("ProcureChain API Server")
    print("="*50)
    print(f"Environment: {os.getenv('FLASK_ENV', 'development')}")
    print(f"Debug mode: {config.DEBUG}")
    print(f"Database: {config.MONGODB_DB}")
    print("="*50 + "\n")

    # Run the application
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=config.DEBUG
    )
