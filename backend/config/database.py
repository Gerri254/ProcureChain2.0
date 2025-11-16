"""MongoDB database connection and management"""
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from gridfs import GridFS
import os
from config.settings import get_config


class Database:
    """Singleton database connection manager"""
    _instance = None
    _client = None
    _db = None
    _fs = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Database, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        """Initialize MongoDB connection"""
        config = get_config()

        try:
            print("Connecting to MongoDB...")
            self._client = MongoClient(
                config.MONGODB_URI,
                maxPoolSize=config.MONGODB_MAX_POOL_SIZE,
                minPoolSize=config.MONGODB_MIN_POOL_SIZE,
                serverSelectionTimeoutMS=5000
            )

            # Test connection
            self._client.admin.command('ping')

            # Get database
            self._db = self._client[config.MONGODB_DB]

            # Initialize GridFS
            self._fs = GridFS(self._db)

            print(f"✓ MongoDB connection successful to database: {config.MONGODB_DB}")

        except ConnectionFailure as e:
            print(f"✗ MongoDB connection failed: {e}")
            raise
        except ServerSelectionTimeoutError as e:
            print(f"✗ MongoDB server selection timeout: {e}")
            raise
        except Exception as e:
            print(f"✗ Unexpected database error: {e}")
            raise

    @property
    def db(self):
        """Get database instance"""
        if self._db is None:
            self._initialize()
        return self._db

    @property
    def client(self):
        """Get MongoDB client instance"""
        if self._client is None:
            self._initialize()
        return self._client

    @property
    def fs(self):
        """Get GridFS instance for file storage"""
        if self._fs is None:
            self._initialize()
        return self._fs

    def close(self):
        """Close database connection"""
        if self._client:
            self._client.close()
            print("MongoDB connection closed")

    def ping(self):
        """Ping database to check connection"""
        try:
            self._client.admin.command('ping')
            return True
        except Exception as e:
            print(f"Database ping failed: {e}")
            return False


# Create singleton instance
db_instance = Database()
db = db_instance.db
gridfs = db_instance.fs
