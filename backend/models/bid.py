"""
Bid Model

Manages vendor bids for procurements
"""

from datetime import datetime
from typing import Dict, Any, Optional
from bson import ObjectId


class BidModel:
    """Model for procurement bids"""

    @staticmethod
    def create_schema(procurement_id: str, vendor_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a bid schema for insertion

        Args:
            procurement_id: The procurement ID
            vendor_id: The vendor submitting the bid
            data: Bid details

        Returns:
            Complete bid document
        """
        now = datetime.utcnow()

        schema = {
            'procurement_id': ObjectId(procurement_id),
            'vendor_id': ObjectId(vendor_id),
            'bid_amount': data.get('bid_amount'),
            'currency': data.get('currency', 'KES'),
            'technical_proposal': {
                'file_id': ObjectId(data['technical_proposal_file_id']) if data.get('technical_proposal_file_id') else None,
                'file_name': data.get('technical_proposal_file_name'),
                'score': None,
                'comments': None,
            } if data.get('technical_proposal_file_id') else None,
            'financial_proposal': {
                'file_id': ObjectId(data['financial_proposal_file_id']) if data.get('financial_proposal_file_id') else None,
                'file_name': data.get('financial_proposal_file_name'),
                'score': None,
                'comments': None,
            } if data.get('financial_proposal_file_id') else None,
            'bid_bond': {
                'file_id': ObjectId(data['bid_bond_file_id']) if data.get('bid_bond_file_id') else None,
                'file_name': data.get('bid_bond_file_name'),
                'amount': data.get('bid_bond_amount'),
            } if data.get('bid_bond_file_id') else None,
            'bid_validity_days': data.get('bid_validity_days', 90),
            'delivery_timeline': data.get('delivery_timeline'),
            'remarks': data.get('remarks'),
            'status': 'submitted',  # submitted, under_evaluation, qualified, disqualified, awarded, rejected
            'disqualification_reason': None,
            'evaluations': [],  # List of evaluator scores
            'total_score': None,
            'rank': None,
            'submitted_at': now,
            'evaluated_at': None,
            'awarded_at': None,
            'created_at': now,
            'updated_at': now,
        }

        return schema

    @staticmethod
    def evaluation_schema(evaluator_id: str, scores: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create evaluation update schema

        Args:
            evaluator_id: User ID of evaluator
            scores: Score data

        Returns:
            Evaluation document
        """
        return {
            'evaluator_id': ObjectId(evaluator_id),
            'evaluator_name': scores.get('evaluator_name'),
            'technical_score': scores.get('technical_score', 0),
            'financial_score': scores.get('financial_score', 0),
            'total_score': scores.get('technical_score', 0) + scores.get('financial_score', 0),
            'comments': scores.get('comments'),
            'evaluated_at': datetime.utcnow(),
        }

    @staticmethod
    def validate_bid(data: Dict[str, Any]) -> tuple[bool, Optional[str]]:
        """
        Validate bid data

        Returns:
            (is_valid, error_message)
        """
        if not data.get('bid_amount'):
            return False, 'Bid amount is required'

        bid_amount = data.get('bid_amount')
        if not isinstance(bid_amount, (int, float)) or bid_amount <= 0:
            return False, 'Bid amount must be a positive number'

        if not data.get('delivery_timeline'):
            return False, 'Delivery timeline is required'

        return True, None

    @staticmethod
    def validate_evaluation(data: Dict[str, Any]) -> tuple[bool, Optional[str]]:
        """
        Validate evaluation data

        Returns:
            (is_valid, error_message)
        """
        technical_score = data.get('technical_score')
        financial_score = data.get('financial_score')

        if technical_score is None or financial_score is None:
            return False, 'Both technical and financial scores are required'

        if not (0 <= technical_score <= 100):
            return False, 'Technical score must be between 0 and 100'

        if not (0 <= financial_score <= 100):
            return False, 'Financial score must be between 0 and 100'

        return True, None
