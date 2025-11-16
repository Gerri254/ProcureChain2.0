"""Database helper functions for MongoDB operations"""
from bson import ObjectId
from datetime import datetime
from typing import Any, Dict, List, Optional


def serialize_document(doc: Any) -> Any:
    """
    Convert MongoDB document to JSON-serializable format

    Args:
        doc: MongoDB document or list of documents

    Returns:
        JSON-serializable document
    """
    if doc is None:
        return None

    if isinstance(doc, list):
        return [serialize_document(d) for d in doc]

    if not isinstance(doc, dict):
        return doc

    serialized = {}
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            serialized[key] = str(value)
        elif isinstance(value, datetime):
            serialized[key] = value.isoformat()
        elif isinstance(value, dict):
            serialized[key] = serialize_document(value)
        elif isinstance(value, list):
            serialized[key] = [serialize_document(item) for item in value]
        else:
            serialized[key] = value

    return serialized


def is_valid_object_id(id_str: str) -> bool:
    """
    Check if string is a valid MongoDB ObjectId

    Args:
        id_str: String to validate

    Returns:
        True if valid ObjectId, False otherwise
    """
    try:
        ObjectId(id_str)
        return True
    except Exception:
        return False


def get_object_id(id_str: str) -> Optional[ObjectId]:
    """
    Convert string to ObjectId if valid

    Args:
        id_str: String to convert

    Returns:
        ObjectId if valid, None otherwise
    """
    if is_valid_object_id(id_str):
        return ObjectId(id_str)
    return None


def paginate_query(collection, query: Dict, page: int = 1, limit: int = 20, sort_by: str = None, sort_order: int = -1):
    """
    Paginate MongoDB query results

    Args:
        collection: MongoDB collection
        query: Query filter
        page: Page number (1-indexed)
        limit: Results per page
        sort_by: Field to sort by
        sort_order: 1 for ascending, -1 for descending

    Returns:
        Dictionary with results and pagination info
    """
    skip = (page - 1) * limit

    # Build query
    cursor = collection.find(query)

    # Apply sorting
    if sort_by:
        cursor = cursor.sort(sort_by, sort_order)

    # Get total count
    total = collection.count_documents(query)

    # Apply pagination
    results = list(cursor.skip(skip).limit(limit))

    # Serialize results
    serialized_results = serialize_document(results)

    return {
        'results': serialized_results,
        'total': total,
        'page': page,
        'limit': limit,
        'pages': (total + limit - 1) // limit if limit > 0 else 0,
        'has_next': page * limit < total,
        'has_prev': page > 1
    }


def build_update_dict(data: Dict, exclude_fields: List[str] = None) -> Dict:
    """
    Build MongoDB update dictionary, excluding specified fields

    Args:
        data: Data to update
        exclude_fields: Fields to exclude from update

    Returns:
        Update dictionary
    """
    if exclude_fields is None:
        exclude_fields = ['_id', 'created_at']

    update_data = {
        k: v for k, v in data.items()
        if k not in exclude_fields and v is not None
    }

    # Always update the updated_at timestamp
    update_data['updated_at'] = datetime.utcnow()

    return {'$set': update_data}


def create_text_search_query(search_term: str, fields: List[str] = None) -> Dict:
    """
    Create MongoDB text search query

    Args:
        search_term: Term to search for
        fields: Optional list of fields to search (uses text index if None)

    Returns:
        MongoDB query dictionary
    """
    if fields:
        # Search in specific fields using regex
        regex_pattern = {'$regex': search_term, '$options': 'i'}
        return {'$or': [{field: regex_pattern} for field in fields]}
    else:
        # Use text index
        return {'$text': {'$search': search_term}}


def aggregate_with_lookup(collection, pipeline: List[Dict]) -> List:
    """
    Execute aggregation pipeline and serialize results

    Args:
        collection: MongoDB collection
        pipeline: Aggregation pipeline

    Returns:
        Serialized aggregation results
    """
    results = list(collection.aggregate(pipeline))
    return serialize_document(results)
