"""Authentication API routes"""
from flask import Blueprint, request, g
from config.database import db
from models.user import UserModel
from middleware.auth import AuthMiddleware, token_required
from services.audit_service import audit_service
from services.user_profile_service import user_profile_service
from utils.response import success_response, error_response, unauthorized_response, validation_error_response
from utils.validators import validate_required_fields, validate_email
from utils.db_helpers import serialize_document

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register new user"""
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['email', 'password', 'full_name']
        is_valid, missing = validate_required_fields(data, required_fields)

        if not is_valid:
            return validation_error_response({'missing_fields': missing})

        # Validate email format
        if not validate_email(data['email']):
            return validation_error_response({'email': 'Invalid email format'})

        # Check if user already exists
        existing_user = db.users.find_one({'email': data['email'].lower()})
        if existing_user:
            return error_response('Email already registered', status_code=409)

        # Validate role if provided
        role = data.get('role', 'public')
        if role not in UserModel.VALID_ROLES:
            return validation_error_response({'role': f'Invalid role. Must be one of: {UserModel.VALID_ROLES}'})

        # Only admins can create admin or procurement_officer accounts
        # For now, all self-registered users get 'public' role
        data['role'] = 'public'

        # Validate user_type for SkillChain (learner/employer/educator)
        user_type = data.get('user_type', 'learner')
        if user_type not in UserModel.VALID_USER_TYPES:
            return validation_error_response({'user_type': f'Invalid user type. Must be one of: {UserModel.VALID_USER_TYPES}'})

        data['user_type'] = user_type

        # Create user
        data['email'] = data['email'].lower()
        user_record = UserModel.create_schema(data)
        result = db.users.insert_one(user_record)
        user_id = str(result.inserted_id)

        # Auto-create user profile based on user_type
        try:
            if user_type == 'learner':
                profile_id = user_profile_service.create_learner_profile(user_id, {
                    'full_name': data.get('full_name'),
                    'email': data.get('email')
                })
            elif user_type == 'employer':
                profile_id = user_profile_service.create_employer_profile(user_id, {
                    'company_name': data.get('company_name', data.get('full_name')),
                    'email': data.get('email')
                })
            elif user_type == 'educator':
                # Educators get learner profile for now
                profile_id = user_profile_service.create_learner_profile(user_id, {
                    'full_name': data.get('full_name'),
                    'email': data.get('email')
                })
            else:
                profile_id = None

            # Update user record with profile_id
            if profile_id:
                from bson import ObjectId
                db.users.update_one(
                    {'_id': ObjectId(user_id)},
                    {'$set': {'profile_id': profile_id}}
                )
        except Exception as e:
            print(f"Warning: Failed to create profile: {e}")
            # Don't fail registration if profile creation fails

        # Log registration
        audit_service.log_authentication(
            user_id=user_id,
            action='register',
            success=True
        )

        # Generate tokens
        access_token = AuthMiddleware.generate_access_token(user_id, data['role'])
        refresh_token = AuthMiddleware.generate_refresh_token(user_id)

        # Get safe user view
        user_record['_id'] = result.inserted_id
        safe_user = UserModel.create_safe_view(serialize_document(user_record))

        return success_response(
            {
                'user': safe_user,
                'access_token': access_token,
                'refresh_token': refresh_token
            },
            message='Registration successful',
            status_code=201
        )

    except Exception as e:
        print(f"Error registering user: {e}")
        return error_response('Registration failed', status_code=500)


@auth_bp.route('/login', methods=['POST'])
def login():
    """User login"""
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['email', 'password']
        is_valid, missing = validate_required_fields(data, required_fields)

        if not is_valid:
            return validation_error_response({'missing_fields': missing})

        # Find user
        email = data['email'].lower()
        user = db.users.find_one({'email': email})

        if not user:
            audit_service.log_authentication(
                user_id=email,
                action='login',
                success=False,
                reason='User not found'
            )
            return unauthorized_response('Invalid email or password')

        # Verify password
        if not UserModel.verify_password(data['password'], user['password_hash']):
            audit_service.log_authentication(
                user_id=str(user['_id']),
                action='login',
                success=False,
                reason='Invalid password'
            )
            return unauthorized_response('Invalid email or password')

        # Check user status
        if user.get('status') != 'active':
            audit_service.log_authentication(
                user_id=str(user['_id']),
                action='login',
                success=False,
                reason=f'Account {user.get("status")}'
            )
            return error_response(f'Account is {user.get("status")}', status_code=403)

        # Update last login
        user_id = str(user['_id'])
        db.users.update_one(
            {'_id': user['_id']},
            UserModel.update_last_login(user['_id'])
        )

        # Log successful login
        audit_service.log_authentication(
            user_id=user_id,
            action='login',
            success=True
        )

        # Generate tokens
        access_token = AuthMiddleware.generate_access_token(user_id, user['role'])
        refresh_token = AuthMiddleware.generate_refresh_token(user_id)

        # Get safe user view
        safe_user = UserModel.create_safe_view(serialize_document(user))

        return success_response(
            {
                'user': safe_user,
                'access_token': access_token,
                'refresh_token': refresh_token
            },
            message='Login successful'
        )

    except Exception as e:
        print(f"Error during login: {e}")
        return error_response('Login failed', status_code=500)


@auth_bp.route('/refresh', methods=['POST'])
def refresh_token():
    """Refresh access token using refresh token"""
    try:
        data = request.get_json()

        if not data or 'refresh_token' not in data:
            return error_response('Refresh token required', status_code=400)

        # Decode refresh token
        try:
            payload = AuthMiddleware.decode_token(data['refresh_token'])
        except Exception as e:
            return unauthorized_response('Invalid or expired refresh token')

        # Verify it's a refresh token
        if payload.get('type') != 'refresh':
            return unauthorized_response('Invalid token type')

        # Get user
        user = db.users.find_one({'_id': payload['user_id']})

        if not user or user.get('status') != 'active':
            return unauthorized_response('User not found or inactive')

        # Generate new access token
        user_id = str(user['_id'])
        access_token = AuthMiddleware.generate_access_token(user_id, user['role'])

        return success_response(
            {'access_token': access_token},
            message='Token refreshed successfully'
        )

    except Exception as e:
        print(f"Error refreshing token: {e}")
        return error_response('Token refresh failed', status_code=500)


@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout():
    """User logout"""
    try:
        # Log logout
        audit_service.log_authentication(
            user_id=g.user_id,
            action='logout',
            success=True
        )

        # In a production app, you might want to blacklist the token
        # For now, just log the action

        return success_response(message='Logout successful')

    except Exception as e:
        print(f"Error during logout: {e}")
        return error_response('Logout failed', status_code=500)


@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user():
    """Get current user info"""
    try:
        user = g.current_user
        safe_user = UserModel.create_safe_view(serialize_document(user))

        return success_response(safe_user)

    except Exception as e:
        print(f"Error fetching user info: {e}")
        return error_response('Failed to fetch user info', status_code=500)


@auth_bp.route('/me', methods=['PUT'])
@token_required
def update_current_user():
    """Update current user info"""
    try:
        data = request.get_json()

        # Fields that can be updated
        updateable_fields = ['full_name', 'department']
        update_data = {k: v for k, v in data.items() if k in updateable_fields}

        if not update_data:
            return error_response('No valid fields to update', status_code=400)

        # Update user
        from bson import ObjectId
        result = db.users.update_one(
            {'_id': ObjectId(g.user_id)},
            {'$set': update_data}
        )

        if result.modified_count == 0:
            return error_response('No changes made')

        # Log action
        audit_service.log_action(
            event_type='user',
            action='update_profile',
            resource_type='user',
            resource_id=g.user_id,
            changes=update_data
        )

        return success_response(message='Profile updated successfully')

    except Exception as e:
        print(f"Error updating user: {e}")
        return error_response('Failed to update profile', status_code=500)
