"""
Clear all data from SkillChain database.
Use this to remove all seeded data and start fresh with production data.

⚠️  WARNING: This will delete ALL data from the database!
"""
import sys
from config.database import db

def confirm_action():
    """Ask user to confirm deletion."""
    print("\n" + "="*60)
    print("⚠️  DATABASE CLEAR UTILITY")
    print("="*60)
    print("\nThis will DELETE ALL DATA from the following collections:")
    print("  • users")
    print("  • user_profiles")
    print("  • challenges")
    print("  • skill_assessments")
    print("  • job_postings")
    print("  • audit_logs")
    print("\n⚠️  THIS ACTION CANNOT BE UNDONE!")
    print("="*60)

    response = input("\nType 'DELETE ALL DATA' to confirm: ")
    return response == "DELETE ALL DATA"

def clear_collection(collection_name):
    """Clear a single collection."""
    try:
        result = db[collection_name].delete_many({})
        print(f"✓ Cleared {collection_name}: {result.deleted_count} documents deleted")
        return result.deleted_count
    except Exception as e:
        print(f"✗ Error clearing {collection_name}: {e}")
        return 0

def main():
    """Main function to clear all collections."""
    # Ask for confirmation
    if not confirm_action():
        print("\n❌ Operation cancelled. No data was deleted.")
        sys.exit(0)

    print("\n" + "="*60)
    print("CLEARING DATABASE...")
    print("="*60 + "\n")

    # Collections to clear
    collections = [
        'users',
        'user_profiles',
        'challenges',
        'skill_assessments',
        'job_postings',
        'audit_logs'
    ]

    total_deleted = 0

    # Clear each collection
    for collection in collections:
        deleted = clear_collection(collection)
        total_deleted += deleted

    # Verify all collections are empty
    print("\n" + "="*60)
    print("VERIFICATION")
    print("="*60 + "\n")

    for collection in collections:
        count = db[collection].count_documents({})
        status = "✓ EMPTY" if count == 0 else f"⚠️  CONTAINS {count} DOCUMENTS"
        print(f"{collection}: {status}")

    print("\n" + "="*60)
    print(f"✅ COMPLETE: {total_deleted} total documents deleted")
    print("="*60)
    print("\nDatabase is now empty and ready for production use.")
    print("\nNext steps:")
    print("1. Start your Flask backend")
    print("2. Register your first user via /register")
    print("3. Create admin user (see PRODUCTION_SETUP.md)")
    print("4. Start creating real content!")
    print("\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Operation cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
