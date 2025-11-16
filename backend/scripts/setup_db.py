"""MongoDB database setup script - creates indexes and initial collections"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from pymongo import ASCENDING, DESCENDING, TEXT
from config.database import db, db_instance
from datetime import datetime


def create_indexes():
    """Create all necessary indexes for the database"""
    print("\n" + "="*60)
    print("MongoDB Database Setup - Creating Indexes")
    print("="*60 + "\n")

    try:
        # Procurement Records Collection
        print("Setting up procurement_records collection...")
        db.procurement_records.create_index(
            [('tender_number', ASCENDING)],
            unique=True,
            sparse=True,
            name='tender_number_unique'
        )
        db.procurement_records.create_index(
            [('status', ASCENDING)],
            name='status_idx'
        )
        db.procurement_records.create_index(
            [('published_date', DESCENDING)],
            name='published_date_desc'
        )
        db.procurement_records.create_index(
            [('category', ASCENDING)],
            name='category_idx'
        )
        db.procurement_records.create_index(
            [('title', TEXT), ('description', TEXT)],
            name='text_search'
        )
        db.procurement_records.create_index(
            [('created_at', DESCENDING)],
            name='created_at_desc'
        )
        print("✓ procurement_records indexes created\n")

        # Vendors Collection
        print("Setting up vendors collection...")
        db.vendors.create_index(
            [('registration_number', ASCENDING)],
            unique=True,
            name='registration_number_unique'
        )
        db.vendors.create_index(
            [('name', ASCENDING)],
            name='name_idx'
        )
        db.vendors.create_index(
            [('name', TEXT)],
            name='name_text_search'
        )
        db.vendors.create_index(
            [('performance_metrics.total_value', DESCENDING)],
            name='total_value_desc'
        )
        print("✓ vendors indexes created\n")

        # Anomaly Flags Collection
        print("Setting up anomaly_flags collection...")
        db.anomaly_flags.create_index(
            [('procurement_id', ASCENDING)],
            name='procurement_id_idx'
        )
        db.anomaly_flags.create_index(
            [('status', ASCENDING)],
            name='status_idx'
        )
        db.anomaly_flags.create_index(
            [('risk_score', DESCENDING)],
            name='risk_score_desc'
        )
        db.anomaly_flags.create_index(
            [('flagged_at', DESCENDING)],
            name='flagged_at_desc'
        )
        db.anomaly_flags.create_index(
            [('severity', ASCENDING)],
            name='severity_idx'
        )
        print("✓ anomaly_flags indexes created\n")

        # Audit Logs Collection
        print("Setting up audit_logs collection...")
        db.audit_logs.create_index(
            [('created_at', DESCENDING)],
            name='created_at_desc'
        )
        db.audit_logs.create_index(
            [('user_id', ASCENDING)],
            name='user_id_idx'
        )
        db.audit_logs.create_index(
            [('event_type', ASCENDING)],
            name='event_type_idx'
        )
        db.audit_logs.create_index(
            [('resource.type', ASCENDING), ('resource.id', ASCENDING)],
            name='resource_idx'
        )

        # TTL Index - Auto-delete logs older than 2 years (63072000 seconds)
        db.audit_logs.create_index(
            [('created_at', ASCENDING)],
            expireAfterSeconds=63072000,
            name='ttl_2years'
        )
        print("✓ audit_logs indexes created (with TTL)\n")

        # Users Collection
        print("Setting up users collection...")
        db.users.create_index(
            [('email', ASCENDING)],
            unique=True,
            name='email_unique'
        )
        db.users.create_index(
            [('role', ASCENDING)],
            name='role_idx'
        )
        db.users.create_index(
            [('status', ASCENDING)],
            name='status_idx'
        )
        print("✓ users indexes created\n")

        # Sessions Collection (for future session management)
        print("Setting up sessions collection...")
        db.sessions.create_index(
            [('session_id', ASCENDING)],
            unique=True,
            sparse=True,
            name='session_id_unique'
        )
        db.sessions.create_index(
            [('user_id', ASCENDING)],
            name='user_id_idx'
        )

        # TTL Index - Auto-delete expired sessions
        db.sessions.create_index(
            [('expires_at', ASCENDING)],
            expireAfterSeconds=0,
            name='ttl_sessions'
        )
        print("✓ sessions indexes created (with TTL)\n")

        # Analytics Cache Collection
        print("Setting up analytics_cache collection...")
        db.analytics_cache.create_index(
            [('cache_key', ASCENDING)],
            unique=True,
            name='cache_key_unique'
        )

        # TTL Index - Auto-delete expired cache
        db.analytics_cache.create_index(
            [('expires_at', ASCENDING)],
            expireAfterSeconds=0,
            name='ttl_cache'
        )
        print("✓ analytics_cache indexes created (with TTL)\n")

        # Rate Limits Collection (for rate limiting)
        print("Setting up rate_limits collection...")
        db.rate_limits.create_index(
            [('identifier', ASCENDING), ('timestamp', ASCENDING)],
            name='identifier_timestamp_idx'
        )

        # TTL Index - Auto-delete old rate limit entries after 1 hour
        db.rate_limits.create_index(
            [('timestamp', ASCENDING)],
            expireAfterSeconds=3600,
            name='ttl_rate_limits'
        )
        print("✓ rate_limits indexes created (with TTL)\n")

        # GridFS indexes are created automatically by MongoDB
        print("✓ GridFS collections (documents.files, documents.chunks) have automatic indexes\n")

        print("="*60)
        print("✓ All indexes created successfully!")
        print("="*60 + "\n")

        return True

    except Exception as e:
        print(f"✗ Error creating indexes: {e}")
        return False


def create_initial_admin():
    """Create initial admin user if none exists"""
    print("\n" + "="*60)
    print("Creating Initial Admin User")
    print("="*60 + "\n")

    try:
        # Check if any admin exists
        admin_exists = db.users.find_one({'role': 'admin'})

        if admin_exists:
            print("✓ Admin user already exists. Skipping...\n")
            return True

        # Create default admin
        from models.user import UserModel

        admin_data = {
            'email': 'admin@procurechain.local',
            'password': 'Admin@123',  # Change this in production!
            'full_name': 'System Administrator',
            'role': 'admin',
            'department': 'IT',
            'status': 'active'
        }

        admin_record = UserModel.create_schema(admin_data)
        result = db.users.insert_one(admin_record)

        print("✓ Initial admin user created successfully!")
        print(f"   Email: {admin_data['email']}")
        print(f"   Password: {admin_data['password']}")
        print("   ⚠️  IMPORTANT: Change this password immediately in production!\n")

        return True

    except Exception as e:
        print(f"✗ Error creating admin user: {e}\n")
        return False


def verify_setup():
    """Verify database setup"""
    print("\n" + "="*60)
    print("Verifying Database Setup")
    print("="*60 + "\n")

    try:
        # List all collections
        collections = db.list_collection_names()
        print(f"Total collections: {len(collections)}")
        print(f"Collections: {', '.join(collections)}\n")

        # Check indexes for key collections
        key_collections = [
            'procurement_records',
            'vendors',
            'anomaly_flags',
            'audit_logs',
            'users'
        ]

        for collection_name in key_collections:
            if collection_name in collections:
                indexes = db[collection_name].index_information()
                print(f"✓ {collection_name}: {len(indexes)} indexes")
            else:
                print(f"⚠️  {collection_name}: Collection not found")

        print("\n" + "="*60)
        print("✓ Database verification complete!")
        print("="*60 + "\n")

        return True

    except Exception as e:
        print(f"✗ Error verifying setup: {e}\n")
        return False


def main():
    """Main setup function"""
    print("\n" + "="*60)
    print("ProcureChain MongoDB Database Setup")
    print("="*60)
    print(f"Database: {db.name}")
    print(f"Connection: {db_instance.client.address}")
    print("="*60 + "\n")

    # Test connection
    if not db_instance.ping():
        print("✗ Failed to connect to MongoDB. Please check your connection settings.\n")
        return False

    print("✓ MongoDB connection successful!\n")

    # Create indexes
    if not create_indexes():
        return False

    # Create initial admin user
    if not create_initial_admin():
        print("⚠️  Warning: Failed to create initial admin user\n")

    # Verify setup
    if not verify_setup():
        return False

    print("\n" + "="*60)
    print("✓ Database setup completed successfully!")
    print("="*60 + "\n")

    return True


if __name__ == '__main__':
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n✗ Setup interrupted by user\n")
        sys.exit(1)
    except Exception as e:
        print(f"\n✗ Unexpected error: {e}\n")
        sys.exit(1)
