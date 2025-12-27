"""Test authentication flow with profile data"""
import sys
import requests
import json

BASE_URL = "http://localhost:5000"

def test_register():
    """Test user registration"""
    print("\n=== Testing Registration ===")

    data = {
        "email": "testuser@example.com",
        "password": "password123",
        "full_name": "Test User",
        "user_type": "learner"
    }

    response = requests.post(f"{BASE_URL}/api/auth/register", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

    if response.status_code == 201:
        result = response.json()
        print("\n✓ Registration successful!")
        print(f"User ID: {result['data']['user']['_id']}")
        print(f"User Type: {result['data']['user'].get('user_type')}")
        print(f"Has Bio: {'bio' in result['data']['user']}")
        print(f"Has GitHub: {'github_url' in result['data']['user']}")
        return result['data']['access_token']
    else:
        print("\n✗ Registration failed!")
        return None

def test_login(email, password):
    """Test user login"""
    print("\n=== Testing Login ===")

    data = {
        "email": email,
        "password": password
    }

    response = requests.post(f"{BASE_URL}/api/auth/login", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

    if response.status_code == 200:
        result = response.json()
        print("\n✓ Login successful!")
        print(f"User ID: {result['data']['user']['_id']}")
        print(f"User Type: {result['data']['user'].get('user_type')}")
        print(f"Has Bio: {'bio' in result['data']['user']}")
        print(f"Has GitHub: {'github_url' in result['data']['user']}")
        print(f"Bio value: {result['data']['user'].get('bio')}")
        print(f"GitHub value: {result['data']['user'].get('github_url')}")
        return result['data']['access_token']
    else:
        print("\n✗ Login failed!")
        return None

def test_get_me(token):
    """Test /me endpoint"""
    print("\n=== Testing /me Endpoint ===")

    headers = {
        "Authorization": f"Bearer {token}"
    }

    response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

    if response.status_code == 200:
        result = response.json()
        print("\n✓ /me successful!")
        print(f"User ID: {result['data']['_id']}")
        print(f"User Type: {result['data'].get('user_type')}")
        print(f"Has Bio: {'bio' in result['data']}")
        print(f"Has GitHub: {'github_url' in result['data']}")
        print(f"Bio value: {result['data'].get('bio')}")
        print(f"GitHub value: {result['data'].get('github_url')}")
    else:
        print("\n✗ /me failed!")

def cleanup_test_user():
    """Delete test user from database"""
    print("\n=== Cleaning up test user ===")
    try:
        from config.database import db
        result = db.users.delete_one({"email": "testuser@example.com"})
        print(f"Deleted {result.deleted_count} user(s)")

        # Also delete profile
        from bson import ObjectId
        db.user_profiles.delete_many({"email": "testuser@example.com"})
        print("Deleted associated profile")
    except Exception as e:
        print(f"Cleanup error: {e}")

if __name__ == "__main__":
    try:
        # Clean up first
        cleanup_test_user()

        # Test registration
        token = test_register()

        if token:
            # Test /me endpoint
            test_get_me(token)

        # Test login with seeded user
        print("\n" + "="*50)
        print("Testing with seeded user (Sarah Chen)")
        print("="*50)
        token = test_login("sarah.chen@example.com", "password123")

        if token:
            test_get_me(token)

    except requests.exceptions.ConnectionError:
        print("\n✗ Error: Could not connect to backend at", BASE_URL)
        print("Make sure the Flask server is running!")
        sys.exit(1)
    except Exception as e:
        print(f"\n✗ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
