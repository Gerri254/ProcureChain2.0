"""Models package initialization"""

# New SkillChain models (core focus)
from .skill_assessment import SkillAssessmentModel
from .user_profile import UserProfileModel
from .challenge import ChallengeModel

__all__ = [
    'SkillAssessmentModel',
    'UserProfileModel',
    'ChallengeModel'
]
