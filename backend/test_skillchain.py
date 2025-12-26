"""Test script for SkillChain backend setup"""
import sys

def test_imports():
    """Test that all new modules can be imported"""
    print("Testing imports...")

    try:
        from models.skill_assessment import SkillAssessmentModel
        print("✓ SkillAssessmentModel imported successfully")
    except Exception as e:
        print(f"✗ Failed to import SkillAssessmentModel: {e}")
        return False

    try:
        from models.user_profile import UserProfileModel
        print("✓ UserProfileModel imported successfully")
    except Exception as e:
        print(f"✗ Failed to import UserProfileModel: {e}")
        return False

    try:
        from models.challenge import ChallengeModel
        print("✓ ChallengeModel imported successfully")
    except Exception as e:
        print(f"✗ Failed to import ChallengeModel: {e}")
        return False

    try:
        from services.skill_assessment_service import skill_assessment_service
        print("✓ SkillAssessmentService imported successfully")
    except Exception as e:
        print(f"✗ Failed to import SkillAssessmentService: {e}")
        return False

    try:
        from routes.skill_assessments import skill_assessment_bp
        print("✓ SkillAssessment routes imported successfully")
    except Exception as e:
        print(f"✗ Failed to import skill_assessment routes: {e}")
        return False

    return True


def test_model_creation():
    """Test model schema creation"""
    print("\nTesting model schema creation...")

    from models.skill_assessment import SkillAssessmentModel
    from models.user_profile import UserProfileModel
    from models.challenge import ChallengeModel

    try:
        # Test SkillAssessment schema
        assessment_data = {
            'skill': 'react',
            'difficulty_level': 'intermediate',
            'challenge_id': 'test-challenge-123',
            'user_id': 'test-user-123',
            'code_submitted': 'function Component() { return <div>Hello</div>; }'
        }
        assessment = SkillAssessmentModel.create_schema(assessment_data)
        print(f"✓ Assessment schema created: {assessment.get('skill')} - {assessment.get('status')}")

        # Test UserProfile schema
        learner_data = {
            'user_id': 'test-user-123',
            'full_name': 'Test User',
            'email': 'test@skillchain.com'
        }
        learner = UserProfileModel.create_learner_schema(learner_data)
        print(f"✓ Learner profile schema created: {learner.get('user_type')}")

        # Test Challenge schema
        challenge_data = {
            'title': 'Build a Counter',
            'skill': 'react',
            'difficulty_level': 'beginner',
            'prompt': 'Create a counter component with increment/decrement buttons'
        }
        challenge = ChallengeModel.create_schema(challenge_data)
        print(f"✓ Challenge schema created: {challenge.get('title')}")

        return True

    except Exception as e:
        print(f"✗ Failed to create schemas: {e}")
        return False


def test_app_creation():
    """Test Flask app creation with new routes"""
    print("\nTesting Flask app creation...")

    try:
        from app import create_app
        app = create_app()

        print("✓ Flask app created successfully")

        # Check if blueprint is registered
        blueprints = [bp.name for bp in app.blueprints.values()]
        if 'skill_assessments' in blueprints:
            print("✓ SkillAssessment blueprint registered")
        else:
            print("✗ SkillAssessment blueprint NOT registered")
            print(f"   Available blueprints: {blueprints}")
            return False

        return True

    except Exception as e:
        print(f"✗ Failed to create Flask app: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all tests"""
    print("=" * 60)
    print("SKILLCHAIN BACKEND SETUP TEST")
    print("=" * 60)

    results = []

    results.append(("Imports", test_imports()))
    results.append(("Model Creation", test_model_creation()))
    results.append(("App Creation", test_app_creation()))

    print("\n" + "=" * 60)
    print("TEST RESULTS")
    print("=" * 60)

    all_passed = True
    for test_name, passed in results:
        status = "✓ PASSED" if passed else "✗ FAILED"
        print(f"{test_name}: {status}")
        if not passed:
            all_passed = False

    print("=" * 60)

    if all_passed:
        print("🎉 ALL TESTS PASSED! SkillChain backend is ready.")
        print("\nNext steps:")
        print("1. Start the backend: python app.py")
        print("2. Test the API endpoints with curl or Postman")
        print("3. Move to Week 2: User profile routes")
    else:
        print("❌ SOME TESTS FAILED. Please fix the errors above.")
        sys.exit(1)


if __name__ == '__main__':
    main()
