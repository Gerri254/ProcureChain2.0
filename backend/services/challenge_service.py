"""Challenge Service - manages coding challenges for skill assessments"""
from typing import Dict, List, Optional
from bson import ObjectId
from config.database import db
from models.challenge import ChallengeModel
from utils.helpers import get_object_id, serialize_doc


class ChallengeService:
    """Service for managing coding challenges"""

    def __init__(self):
        self.collection = db.challenges

    def create_challenge(self, data: Dict) -> Optional[str]:
        """
        Create a new coding challenge

        Args:
            data: Challenge data

        Returns:
            Challenge ID if successful, None otherwise
        """
        try:
            # Validate inputs
            if not ChallengeModel.validate_skill(data.get('skill', '')):
                print(f"Invalid skill: {data.get('skill')}")
                return None

            if not ChallengeModel.validate_difficulty(data.get('difficulty_level', '')):
                print(f"Invalid difficulty: {data.get('difficulty_level')}")
                return None

            # Create challenge schema
            challenge = ChallengeModel.create_schema(data)

            # Insert into database
            result = self.collection.insert_one(challenge)

            return str(result.inserted_id)

        except Exception as e:
            print(f"Error creating challenge: {e}")
            return None

    def get_challenge_by_id(self, challenge_id: str) -> Optional[Dict]:
        """
        Get challenge by ID

        Args:
            challenge_id: Challenge ID

        Returns:
            Challenge record or None
        """
        try:
            challenge = self.collection.find_one({'_id': get_object_id(challenge_id)})
            return serialize_doc(challenge) if challenge else None
        except Exception as e:
            print(f"Error fetching challenge: {e}")
            return None

    def get_challenges(
        self,
        skill: Optional[str] = None,
        difficulty_level: Optional[str] = None,
        challenge_type: Optional[str] = None,
        is_active: bool = True,
        page: int = 1,
        per_page: int = 20
    ) -> Dict:
        """
        Get challenges with filtering and pagination

        Args:
            skill: Filter by skill
            difficulty_level: Filter by difficulty
            challenge_type: Filter by type
            is_active: Filter by active status
            page: Page number
            per_page: Items per page

        Returns:
            Dict with challenges and pagination info
        """
        try:
            # Build query
            query = {'is_active': is_active, 'is_public': True}

            if skill:
                query['skill'] = skill
            if difficulty_level:
                query['difficulty_level'] = difficulty_level
            if challenge_type:
                query['challenge_type'] = challenge_type

            # Count total
            total = self.collection.count_documents(query)

            # Get paginated results
            skip = (page - 1) * per_page
            challenges = list(
                self.collection
                .find(query)
                .sort('created_at', -1)
                .skip(skip)
                .limit(per_page)
            )

            return {
                'total': total,
                'page': page,
                'per_page': per_page,
                'total_pages': (total + per_page - 1) // per_page,
                'challenges': [serialize_doc(c) for c in challenges]
            }

        except Exception as e:
            print(f"Error fetching challenges: {e}")
            return {'total': 0, 'challenges': []}

    def get_random_challenge(self, skill: str, difficulty_level: str) -> Optional[Dict]:
        """
        Get a random challenge for an assessment

        Args:
            skill: Programming language/skill
            difficulty_level: Difficulty level

        Returns:
            Random challenge or None
        """
        try:
            # Use MongoDB aggregation to get random
            pipeline = [
                {
                    '$match': {
                        'skill': skill,
                        'difficulty_level': difficulty_level,
                        'is_active': True,
                        'is_public': True
                    }
                },
                {'$sample': {'size': 1}}
            ]

            result = list(self.collection.aggregate(pipeline))

            if result:
                return serialize_doc(result[0])

            return None

        except Exception as e:
            print(f"Error getting random challenge: {e}")
            return None

    def update_challenge(self, challenge_id: str, data: Dict) -> bool:
        """
        Update challenge

        Args:
            challenge_id: Challenge ID
            data: Update data

        Returns:
            True if successful
        """
        try:
            # Validate if skill/difficulty being updated
            if 'skill' in data and not ChallengeModel.validate_skill(data['skill']):
                return False

            if 'difficulty_level' in data and not ChallengeModel.validate_difficulty(data['difficulty_level']):
                return False

            # Update timestamp
            from datetime import datetime
            data['updated_at'] = datetime.utcnow()

            result = self.collection.update_one(
                {'_id': get_object_id(challenge_id)},
                {'$set': data}
            )

            return result.modified_count > 0

        except Exception as e:
            print(f"Error updating challenge: {e}")
            return False

    def delete_challenge(self, challenge_id: str) -> bool:
        """
        Soft delete challenge (set is_active to False)

        Args:
            challenge_id: Challenge ID

        Returns:
            True if successful
        """
        try:
            from datetime import datetime

            result = self.collection.update_one(
                {'_id': get_object_id(challenge_id)},
                {
                    '$set': {
                        'is_active': False,
                        'updated_at': datetime.utcnow()
                    }
                }
            )

            return result.modified_count > 0

        except Exception as e:
            print(f"Error deleting challenge: {e}")
            return False

    def update_challenge_stats(self, challenge_id: str, score: int, completion_time_minutes: int) -> bool:
        """
        Update challenge usage statistics after completion

        Args:
            challenge_id: Challenge ID
            score: Assessment score
            completion_time_minutes: Time taken

        Returns:
            True if successful
        """
        try:
            challenge = self.get_challenge_by_id(challenge_id)
            if not challenge:
                return False

            # Calculate new stats
            new_stats = ChallengeModel.update_usage_stats(
                challenge,
                score,
                completion_time_minutes
            )

            # Update in database
            result = self.collection.update_one(
                {'_id': get_object_id(challenge_id)},
                {
                    '$set': {
                        'metadata.times_used': new_stats['times_used'],
                        'metadata.average_score': new_stats['average_score'],
                        'metadata.average_completion_time': new_stats['average_completion_time'],
                        'metadata.pass_rate': new_stats['pass_rate']
                    }
                }
            )

            return result.modified_count > 0

        except Exception as e:
            print(f"Error updating challenge stats: {e}")
            return False

    def get_public_challenge(self, challenge_id: str, include_answers: bool = False) -> Optional[Dict]:
        """
        Get public-safe view of challenge

        Args:
            challenge_id: Challenge ID
            include_answers: Include correct answers (for post-assessment review)

        Returns:
            Public challenge data or None
        """
        try:
            challenge = self.get_challenge_by_id(challenge_id)
            if not challenge:
                return None

            return ChallengeModel.create_public_view(challenge, include_answers)

        except Exception as e:
            print(f"Error getting public challenge: {e}")
            return None

    def search_challenges(self, search_term: str, page: int = 1, per_page: int = 20) -> Dict:
        """
        Search challenges by title or description

        Args:
            search_term: Search query
            page: Page number
            per_page: Items per page

        Returns:
            Dict with challenges and pagination
        """
        try:
            # Build text search query
            query = {
                'is_active': True,
                'is_public': True,
                '$or': [
                    {'title': {'$regex': search_term, '$options': 'i'}},
                    {'description': {'$regex': search_term, '$options': 'i'}},
                    {'skill': {'$regex': search_term, '$options': 'i'}}
                ]
            }

            total = self.collection.count_documents(query)

            skip = (page - 1) * per_page
            challenges = list(
                self.collection
                .find(query)
                .sort('metadata.times_used', -1)
                .skip(skip)
                .limit(per_page)
            )

            return {
                'total': total,
                'page': page,
                'per_page': per_page,
                'total_pages': (total + per_page - 1) // per_page,
                'challenges': [serialize_doc(c) for c in challenges]
            }

        except Exception as e:
            print(f"Error searching challenges: {e}")
            return {'total': 0, 'challenges': []}

    def get_challenge_stats(self) -> Dict:
        """
        Get overall challenge statistics

        Returns:
            Statistics dict
        """
        try:
            total_challenges = self.collection.count_documents({'is_active': True})

            # Count by skill
            pipeline = [
                {'$match': {'is_active': True}},
                {'$group': {'_id': '$skill', 'count': {'$sum': 1}}}
            ]
            by_skill = {item['_id']: item['count'] for item in self.collection.aggregate(pipeline)}

            # Count by difficulty
            pipeline = [
                {'$match': {'is_active': True}},
                {'$group': {'_id': '$difficulty_level', 'count': {'$sum': 1}}}
            ]
            by_difficulty = {item['_id']: item['count'] for item in self.collection.aggregate(pipeline)}

            # Most popular challenges
            popular = list(
                self.collection
                .find({'is_active': True})
                .sort('metadata.times_used', -1)
                .limit(5)
            )

            return {
                'total_challenges': total_challenges,
                'by_skill': by_skill,
                'by_difficulty': by_difficulty,
                'most_popular': [serialize_doc(c) for c in popular]
            }

        except Exception as e:
            print(f"Error getting challenge stats: {e}")
            return {}


# Singleton instance
challenge_service = ChallengeService()
