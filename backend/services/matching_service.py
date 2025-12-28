"""
Job-to-Talent Matching Algorithm Service
Matches learners with jobs based on verified skills, experience, and performance
"""
from datetime import datetime, timedelta
from typing import List, Dict, Any
from bson import ObjectId
from config.database import db


class MatchingService:
    """Service for matching learners with jobs and ranking applicants"""

    @staticmethod
    def calculate_match_score(learner_skills: List[Dict], job_posting: Dict, learner_profile: Dict = None) -> Dict[str, Any]:
        """
        Calculate match score between a learner and a job posting

        Returns:
            {
                'match_score': float (0-100),
                'matched_skills': list,
                'missing_skills': list,
                'breakdown': {
                    'skill_match': float,
                    'experience_match': float,
                    'freshness_score': float,
                    'performance_score': float
                }
            }
        """
        required_skills = job_posting.get('required_skills', [])

        if not required_skills:
            return {
                'match_score': 0,
                'matched_skills': [],
                'missing_skills': [],
                'breakdown': {}
            }

        # 1. Skill Match Score (60% weight)
        skill_match_score = MatchingService._calculate_skill_match(learner_skills, required_skills)

        # 2. Experience Level Match (20% weight)
        experience_score = MatchingService._calculate_experience_match(
            learner_profile,
            job_posting.get('experience_level', 'intermediate')
        )

        # 3. Skill Freshness (10% weight)
        freshness_score = MatchingService._calculate_freshness_score(learner_skills, required_skills)

        # 4. Assessment Performance (10% weight)
        performance_score = MatchingService._calculate_performance_score(learner_skills)

        # Calculate total match score
        total_score = (
            skill_match_score['percentage'] * 0.6 +
            experience_score * 0.2 +
            freshness_score * 0.1 +
            performance_score * 0.1
        )

        return {
            'match_score': round(total_score, 1),
            'matched_skills': skill_match_score['matched'],
            'missing_skills': skill_match_score['missing'],
            'breakdown': {
                'skill_match': round(skill_match_score['percentage'], 1),
                'experience_match': round(experience_score, 1),
                'freshness_score': round(freshness_score, 1),
                'performance_score': round(performance_score, 1)
            }
        }

    @staticmethod
    def _calculate_skill_match(learner_skills: List[Dict], required_skills: List[str]) -> Dict:
        """Calculate percentage of required skills that learner has"""
        if not required_skills:
            return {'percentage': 0, 'matched': [], 'missing': required_skills}

        # Get verified skill names (case-insensitive)
        verified_skill_names = {
            skill.get('skill_name', '').lower()
            for skill in learner_skills
            if skill.get('status') == 'active'
        }

        matched = []
        missing = []

        for required_skill in required_skills:
            if required_skill.lower() in verified_skill_names:
                matched.append(required_skill)
            else:
                missing.append(required_skill)

        percentage = (len(matched) / len(required_skills)) * 100 if required_skills else 0

        return {
            'percentage': percentage,
            'matched': matched,
            'missing': missing
        }

    @staticmethod
    def _calculate_experience_match(learner_profile: Dict, job_experience_level: str) -> float:
        """Match learner experience level with job requirements"""
        if not learner_profile:
            return 50.0  # Default middle score if no profile

        learner_level = learner_profile.get('experience_level', 'intermediate').lower()
        job_level = job_experience_level.lower()

        # Experience level mapping
        level_map = {
            'beginner': 1,
            'intermediate': 2,
            'advanced': 3
        }

        learner_rank = level_map.get(learner_level, 2)
        job_rank = level_map.get(job_level, 2)

        # Perfect match
        if learner_rank == job_rank:
            return 100.0

        # One level difference
        if abs(learner_rank - job_rank) == 1:
            return 70.0

        # Two levels difference
        return 40.0

    @staticmethod
    def _calculate_freshness_score(learner_skills: List[Dict], required_skills: List[str]) -> float:
        """Calculate freshness of verified skills (recent = better)"""
        if not learner_skills or not required_skills:
            return 0.0

        now = datetime.utcnow()
        required_lower = [skill.lower() for skill in required_skills]

        relevant_skills = [
            skill for skill in learner_skills
            if skill.get('skill_name', '').lower() in required_lower
            and skill.get('status') == 'active'
        ]

        if not relevant_skills:
            return 0.0

        freshness_scores = []
        for skill in relevant_skills:
            verified_at = skill.get('verified_at')
            if not verified_at:
                continue

            if isinstance(verified_at, str):
                verified_at = datetime.fromisoformat(verified_at.replace('Z', '+00:00'))

            days_old = (now - verified_at).days

            # Freshness scoring
            if days_old <= 30:
                freshness_scores.append(100.0)
            elif days_old <= 90:
                freshness_scores.append(75.0)
            else:
                freshness_scores.append(50.0)

        return sum(freshness_scores) / len(freshness_scores) if freshness_scores else 50.0

    @staticmethod
    def _calculate_performance_score(learner_skills: List[Dict]) -> float:
        """Calculate average performance across all assessments"""
        if not learner_skills:
            return 0.0

        scores = [
            skill.get('score', 0)
            for skill in learner_skills
            if skill.get('status') == 'active' and skill.get('score') is not None
        ]

        if not scores:
            return 0.0

        avg_score = sum(scores) / len(scores)
        return avg_score  # Already a percentage (0-100)

    @staticmethod
    def get_matched_jobs_for_learner(user_id: str, min_match_score: float = 60.0) -> List[Dict]:
        """
        Get all jobs matched to a learner, sorted by match score

        Args:
            user_id: Learner's user ID
            min_match_score: Minimum match percentage (default 60%)

        Returns:
            List of job postings with match scores
        """
        # Get learner's verified skills
        learner_skills = list(db.verified_skills.find({
            'user_id': user_id,
            'status': 'active'
        }))

        # Get learner's profile
        learner_profile = db.user_profiles.find_one({'user_id': user_id})

        # Get all active job postings
        jobs = list(db.job_postings.find({'status': 'active'}))

        matched_jobs = []

        for job in jobs:
            match_data = MatchingService.calculate_match_score(
                learner_skills,
                job,
                learner_profile
            )

            if match_data['match_score'] >= min_match_score:
                job['match_data'] = match_data
                job['_id'] = str(job['_id'])
                matched_jobs.append(job)

        # Sort by match score (highest first)
        matched_jobs.sort(key=lambda x: x['match_data']['match_score'], reverse=True)

        return matched_jobs

    @staticmethod
    def rank_applicants_for_job(job_id: str) -> List[Dict]:
        """
        Rank all applicants for a specific job by match score

        Args:
            job_id: Job posting ID

        Returns:
            List of applicants with match scores, sorted by best match
        """
        # Get job posting
        job = db.job_postings.find_one({'_id': ObjectId(job_id)})
        if not job:
            return []

        # Get all applications for this job
        applications = list(db.job_applications.find({'job_id': job_id}))

        ranked_applicants = []

        for application in applications:
            user_id = application.get('user_id')

            # Get applicant's skills
            learner_skills = list(db.verified_skills.find({
                'user_id': user_id,
                'status': 'active'
            }))

            # Get applicant's profile
            learner_profile = db.user_profiles.find_one({'user_id': user_id})

            match_data = MatchingService.calculate_match_score(
                learner_skills,
                job,
                learner_profile
            )

            application['match_data'] = match_data
            application['applicant_profile'] = learner_profile
            application['_id'] = str(application['_id'])
            ranked_applicants.append(application)

        # Sort by match score (highest first)
        ranked_applicants.sort(key=lambda x: x['match_data']['match_score'], reverse=True)

        return ranked_applicants


# Singleton instance
matching_service = MatchingService()
