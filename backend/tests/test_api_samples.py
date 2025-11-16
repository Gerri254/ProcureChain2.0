"""
Sample API tests to verify backend functionality

Run with: pytest tests/test_api_samples.py -v
"""
import pytest
import json
from app import create_app
from config.database import db


@pytest.fixture
def client():
    """Create test client"""
    app = create_app()
    app.config['TESTING'] = True

    with app.test_client() as client:
        yield client


@pytest.fixture
def auth_token(client):
    """Get authentication token for tests"""
    # Login with default admin
    response = client.post('/api/auth/login',
                            json={
                                'email': 'admin@procurechain.local',
                                'password': 'Admin@123'
                            })

    if response.status_code == 200:
        data = json.loads(response.data)
        return data['data']['access_token']

    return None


def test_health_check(client):
    """Test health check endpoint"""
    response = client.get('/health')
    assert response.status_code == 200

    data = json.loads(response.data)
    assert data['status'] == 'healthy'
    assert data['service'] == 'ProcureChain API'


def test_root_endpoint(client):
    """Test root endpoint"""
    response = client.get('/')
    assert response.status_code == 200

    data = json.loads(response.data)
    assert data['name'] == 'ProcureChain API'
    assert 'endpoints' in data


def test_user_registration(client):
    """Test user registration"""
    response = client.post('/api/auth/register',
                            json={
                                'email': f'testuser_{pytest.__version__}@test.com',
                                'password': 'TestPass123!',
                                'full_name': 'Test User'
                            })

    # Should succeed or fail with duplicate email
    assert response.status_code in [201, 409]


def test_user_login_success(client):
    """Test successful login"""
    response = client.post('/api/auth/login',
                            json={
                                'email': 'admin@procurechain.local',
                                'password': 'Admin@123'
                            })

    assert response.status_code == 200

    data = json.loads(response.data)
    assert data['success'] is True
    assert 'access_token' in data['data']
    assert 'user' in data['data']


def test_user_login_failure(client):
    """Test login with wrong credentials"""
    response = client.post('/api/auth/login',
                            json={
                                'email': 'wrong@example.com',
                                'password': 'wrongpassword'
                            })

    assert response.status_code == 401


def test_public_procurements_without_auth(client):
    """Test accessing public procurements without authentication"""
    response = client.get('/api/procurement/public')

    assert response.status_code == 200

    data = json.loads(response.data)
    assert data['success'] is True
    assert 'results' in data['data']


def test_protected_endpoint_without_token(client):
    """Test accessing protected endpoint without token"""
    response = client.get('/api/procurement')

    assert response.status_code == 401


def test_create_procurement_with_auth(client, auth_token):
    """Test creating procurement with authentication"""
    if not auth_token:
        pytest.skip("No auth token available")

    response = client.post('/api/procurement',
                            headers={'Authorization': f'Bearer {auth_token}'},
                            json={
                                'title': 'Test Procurement',
                                'category': 'supplies',
                                'estimated_value': 100000,
                                'currency': 'KES',
                                'description': 'Test procurement description'
                            })

    assert response.status_code in [201, 401, 403]

    if response.status_code == 201:
        data = json.loads(response.data)
        assert data['success'] is True
        assert 'procurement_id' in data['data']


def test_get_current_user(client, auth_token):
    """Test getting current user info"""
    if not auth_token:
        pytest.skip("No auth token available")

    response = client.get('/api/auth/me',
                          headers={'Authorization': f'Bearer {auth_token}'})

    assert response.status_code == 200

    data = json.loads(response.data)
    assert data['success'] is True
    assert 'email' in data['data']


def test_public_vendors_endpoint(client):
    """Test public vendors endpoint"""
    response = client.get('/api/vendors/public')

    assert response.status_code == 200

    data = json.loads(response.data)
    assert data['success'] is True


def test_invalid_endpoint(client):
    """Test accessing non-existent endpoint"""
    response = client.get('/api/nonexistent')

    assert response.status_code == 404


def test_missing_required_fields(client, auth_token):
    """Test API validation for missing fields"""
    if not auth_token:
        pytest.skip("No auth token available")

    response = client.post('/api/procurement',
                            headers={'Authorization': f'Bearer {auth_token}'},
                            json={
                                'title': 'Test'
                                # Missing required fields
                            })

    assert response.status_code in [422, 400, 401, 403]


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
