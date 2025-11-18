"""
Bid Service

Manages vendor bid submission, evaluation, and awarding
"""

from typing import Dict, List, Any, Optional
from bson import ObjectId
from datetime import datetime
from config.database import db
from models.bid import BidModel


class BidService:
    """Service for managing procurement bids"""

    def __init__(self):
        self.collection = db.bids
        self.procurements = db.procurements
        self.vendors = db.vendors
        self.users = db.users

    def submit_bid(
        self,
        procurement_id: str,
        vendor_id: str,
        bid_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Submit a bid for a procurement

        Args:
            procurement_id: The procurement ID
            vendor_id: The vendor submitting the bid
            bid_data: Bid details

        Returns:
            Created bid document

        Raises:
            ValueError: If validation fails
        """
        # Validate procurement exists and is open for bidding
        procurement = self.procurements.find_one({'_id': ObjectId(procurement_id)})
        if not procurement:
            raise ValueError('Procurement not found')

        if procurement['status'] not in ['published', 'open']:
            raise ValueError('Procurement is not open for bidding')

        # Check if deadline has passed
        if procurement.get('submission_deadline'):
            if datetime.utcnow() > procurement['submission_deadline']:
                raise ValueError('Bid submission deadline has passed')

        # Validate vendor exists
        vendor = self.vendors.find_one({'_id': ObjectId(vendor_id)})
        if not vendor:
            raise ValueError('Vendor not found')

        # Check if vendor already submitted a bid
        existing_bid = self.collection.find_one({
            'procurement_id': ObjectId(procurement_id),
            'vendor_id': ObjectId(vendor_id)
        })
        if existing_bid:
            raise ValueError('Vendor has already submitted a bid for this procurement')

        # Validate bid data
        is_valid, error = BidModel.validate_bid(bid_data)
        if not is_valid:
            raise ValueError(error)

        # Create bid schema
        bid_schema = BidModel.create_schema(procurement_id, vendor_id, bid_data)

        # Insert bid
        result = self.collection.insert_one(bid_schema)
        bid_schema['_id'] = result.inserted_id

        # Update procurement bid count
        self.procurements.update_one(
            {'_id': ObjectId(procurement_id)},
            {
                '$inc': {'bid_count': 1},
                '$set': {'updated_at': datetime.utcnow()}
            }
        )

        return self._format_bid(bid_schema)

    def get_procurement_bids(
        self,
        procurement_id: str,
        include_disqualified: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Get all bids for a procurement

        Args:
            procurement_id: The procurement ID
            include_disqualified: Include disqualified bids

        Returns:
            List of bid documents
        """
        query = {'procurement_id': ObjectId(procurement_id)}

        if not include_disqualified:
            query['status'] = {'$ne': 'disqualified'}

        bids = list(self.collection.find(query).sort('submitted_at', 1))

        # Populate vendor information
        for bid in bids:
            vendor = self.vendors.find_one({'_id': bid['vendor_id']})
            if vendor:
                bid['vendor_name'] = vendor.get('company_name', 'Unknown')
                bid['vendor_email'] = vendor.get('email')

        return [self._format_bid(bid) for bid in bids]

    def get_vendor_bids(self, vendor_id: str) -> List[Dict[str, Any]]:
        """
        Get all bids submitted by a vendor

        Args:
            vendor_id: The vendor ID

        Returns:
            List of bid documents with procurement details
        """
        bids = list(
            self.collection.find({'vendor_id': ObjectId(vendor_id)})
            .sort('submitted_at', -1)
        )

        # Populate procurement information
        for bid in bids:
            procurement = self.procurements.find_one({'_id': bid['procurement_id']})
            if procurement:
                bid['procurement_title'] = procurement.get('title', 'Unknown')
                bid['procurement_ref'] = procurement.get('reference_number')

        return [self._format_bid(bid) for bid in bids]

    def get_bid_by_id(self, bid_id: str) -> Optional[Dict[str, Any]]:
        """Get a single bid by ID"""
        bid = self.collection.find_one({'_id': ObjectId(bid_id)})
        if not bid:
            return None

        # Populate related data
        vendor = self.vendors.find_one({'_id': bid['vendor_id']})
        if vendor:
            bid['vendor_name'] = vendor.get('company_name', 'Unknown')

        procurement = self.procurements.find_one({'_id': bid['procurement_id']})
        if procurement:
            bid['procurement_title'] = procurement.get('title', 'Unknown')

        return self._format_bid(bid)

    def evaluate_bid(
        self,
        bid_id: str,
        evaluator_id: str,
        evaluation_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Add an evaluation to a bid

        Args:
            bid_id: The bid ID
            evaluator_id: User ID of the evaluator
            evaluation_data: Evaluation scores and comments

        Returns:
            Updated bid document

        Raises:
            ValueError: If validation fails
        """
        # Validate bid exists
        bid = self.collection.find_one({'_id': ObjectId(bid_id)})
        if not bid:
            raise ValueError('Bid not found')

        if bid['status'] not in ['submitted', 'under_evaluation']:
            raise ValueError('Bid cannot be evaluated in current status')

        # Validate evaluator exists
        evaluator = self.users.find_one({'_id': ObjectId(evaluator_id)})
        if not evaluator:
            raise ValueError('Evaluator not found')

        # Validate evaluation data
        is_valid, error = BidModel.validate_evaluation(evaluation_data)
        if not is_valid:
            raise ValueError(error)

        # Check if evaluator already evaluated this bid
        existing_evaluation = next(
            (e for e in bid.get('evaluations', [])
             if str(e['evaluator_id']) == evaluator_id),
            None
        )

        if existing_evaluation:
            raise ValueError('Evaluator has already evaluated this bid')

        # Create evaluation schema
        evaluation_data['evaluator_name'] = evaluator.get('full_name', 'Unknown')
        evaluation_schema = BidModel.evaluation_schema(evaluator_id, evaluation_data)

        # Update bid with evaluation
        result = self.collection.find_one_and_update(
            {'_id': ObjectId(bid_id)},
            {
                '$push': {'evaluations': evaluation_schema},
                '$set': {
                    'status': 'under_evaluation',
                    'updated_at': datetime.utcnow()
                }
            },
            return_document=True
        )

        return self._format_bid(result)

    def calculate_final_scores(self, procurement_id: str) -> List[Dict[str, Any]]:
        """
        Calculate final scores and rankings for all bids

        Args:
            procurement_id: The procurement ID

        Returns:
            List of bids with calculated scores and rankings
        """
        # Get all bids with evaluations
        bids = list(
            self.collection.find({
                'procurement_id': ObjectId(procurement_id),
                'status': {'$in': ['submitted', 'under_evaluation']}
            })
        )

        bid_scores = []

        for bid in bids:
            evaluations = bid.get('evaluations', [])

            if not evaluations:
                continue

            # Calculate average scores
            avg_technical = sum(e['technical_score'] for e in evaluations) / len(evaluations)
            avg_financial = sum(e['financial_score'] for e in evaluations) / len(evaluations)
            total_score = avg_technical + avg_financial

            bid_scores.append({
                'bid_id': bid['_id'],
                'total_score': total_score,
                'avg_technical': avg_technical,
                'avg_financial': avg_financial
            })

        # Sort by total score (descending)
        bid_scores.sort(key=lambda x: x['total_score'], reverse=True)

        # Update bids with scores and rankings
        updated_bids = []
        for rank, score_data in enumerate(bid_scores, start=1):
            result = self.collection.find_one_and_update(
                {'_id': score_data['bid_id']},
                {
                    '$set': {
                        'total_score': score_data['total_score'],
                        'rank': rank,
                        'status': 'qualified',
                        'evaluated_at': datetime.utcnow(),
                        'updated_at': datetime.utcnow()
                    }
                },
                return_document=True
            )
            updated_bids.append(self._format_bid(result))

        return updated_bids

    def award_bid(
        self,
        bid_id: str,
        award_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Award a bid to the winning vendor

        Args:
            bid_id: The bid ID
            award_data: Award details (awarded_amount, etc.)

        Returns:
            Updated bid document

        Raises:
            ValueError: If bid cannot be awarded
        """
        # Validate bid exists
        bid = self.collection.find_one({'_id': ObjectId(bid_id)})
        if not bid:
            raise ValueError('Bid not found')

        if bid['status'] != 'qualified':
            raise ValueError('Only qualified bids can be awarded')

        # Update bid status
        result = self.collection.find_one_and_update(
            {'_id': ObjectId(bid_id)},
            {
                '$set': {
                    'status': 'awarded',
                    'awarded_at': datetime.utcnow(),
                    'awarded_amount': award_data.get('awarded_amount', bid['bid_amount']),
                    'award_notes': award_data.get('notes'),
                    'updated_at': datetime.utcnow()
                }
            },
            return_document=True
        )

        # Update procurement status
        self.procurements.update_one(
            {'_id': bid['procurement_id']},
            {
                '$set': {
                    'status': 'awarded',
                    'awarded_vendor_id': bid['vendor_id'],
                    'awarded_amount': award_data.get('awarded_amount', bid['bid_amount']),
                    'awarded_at': datetime.utcnow(),
                    'updated_at': datetime.utcnow()
                }
            }
        )

        # Mark other bids as rejected
        self.collection.update_many(
            {
                'procurement_id': bid['procurement_id'],
                '_id': {'$ne': ObjectId(bid_id)},
                'status': {'$in': ['submitted', 'under_evaluation', 'qualified']}
            },
            {
                '$set': {
                    'status': 'rejected',
                    'updated_at': datetime.utcnow()
                }
            }
        )

        return self._format_bid(result)

    def disqualify_bid(
        self,
        bid_id: str,
        reason: str
    ) -> Dict[str, Any]:
        """
        Disqualify a bid

        Args:
            bid_id: The bid ID
            reason: Disqualification reason

        Returns:
            Updated bid document

        Raises:
            ValueError: If bid not found
        """
        if not reason or len(reason.strip()) < 10:
            raise ValueError('Disqualification reason must be at least 10 characters')

        result = self.collection.find_one_and_update(
            {'_id': ObjectId(bid_id)},
            {
                '$set': {
                    'status': 'disqualified',
                    'disqualification_reason': reason.strip(),
                    'updated_at': datetime.utcnow()
                }
            },
            return_document=True
        )

        if not result:
            raise ValueError('Bid not found')

        return self._format_bid(result)

    def get_bid_statistics(self, procurement_id: str) -> Dict[str, Any]:
        """
        Get bid statistics for a procurement

        Args:
            procurement_id: The procurement ID

        Returns:
            Statistics including bid count, average amount, etc.
        """
        pipeline = [
            {'$match': {'procurement_id': ObjectId(procurement_id)}},
            {
                '$group': {
                    '_id': None,
                    'total_bids': {'$sum': 1},
                    'qualified_bids': {
                        '$sum': {'$cond': [{'$eq': ['$status', 'qualified']}, 1, 0]}
                    },
                    'disqualified_bids': {
                        '$sum': {'$cond': [{'$eq': ['$status', 'disqualified']}, 1, 0]}
                    },
                    'average_bid_amount': {'$avg': '$bid_amount'},
                    'lowest_bid': {'$min': '$bid_amount'},
                    'highest_bid': {'$max': '$bid_amount'},
                }
            }
        ]

        result = list(self.collection.aggregate(pipeline))

        if not result:
            return {
                'total_bids': 0,
                'qualified_bids': 0,
                'disqualified_bids': 0,
                'average_bid_amount': 0,
                'lowest_bid': 0,
                'highest_bid': 0,
            }

        stats = result[0]
        stats.pop('_id', None)
        return stats

    def _format_bid(self, bid: Dict[str, Any]) -> Dict[str, Any]:
        """Format bid for API response"""
        if not bid:
            return None

        formatted = {
            '_id': str(bid['_id']),
            'procurement_id': str(bid['procurement_id']),
            'vendor_id': str(bid['vendor_id']),
            'vendor_name': bid.get('vendor_name'),
            'vendor_email': bid.get('vendor_email'),
            'procurement_title': bid.get('procurement_title'),
            'procurement_ref': bid.get('procurement_ref'),
            'bid_amount': bid['bid_amount'],
            'currency': bid.get('currency', 'KES'),
            'bid_validity_days': bid.get('bid_validity_days', 90),
            'delivery_timeline': bid.get('delivery_timeline'),
            'remarks': bid.get('remarks'),
            'status': bid['status'],
            'disqualification_reason': bid.get('disqualification_reason'),
            'total_score': bid.get('total_score'),
            'rank': bid.get('rank'),
            'submitted_at': bid['submitted_at'].isoformat(),
            'evaluated_at': bid['evaluated_at'].isoformat() if bid.get('evaluated_at') else None,
            'awarded_at': bid['awarded_at'].isoformat() if bid.get('awarded_at') else None,
            'awarded_amount': bid.get('awarded_amount'),
            'award_notes': bid.get('award_notes'),
            'created_at': bid['created_at'].isoformat(),
            'updated_at': bid['updated_at'].isoformat(),
        }

        # Add proposal information
        if bid.get('technical_proposal'):
            formatted['technical_proposal'] = {
                'file_id': str(bid['technical_proposal']['file_id']) if bid['technical_proposal'].get('file_id') else None,
                'file_name': bid['technical_proposal'].get('file_name'),
                'score': bid['technical_proposal'].get('score'),
                'comments': bid['technical_proposal'].get('comments'),
            }

        if bid.get('financial_proposal'):
            formatted['financial_proposal'] = {
                'file_id': str(bid['financial_proposal']['file_id']) if bid['financial_proposal'].get('file_id') else None,
                'file_name': bid['financial_proposal'].get('file_name'),
                'score': bid['financial_proposal'].get('score'),
                'comments': bid['financial_proposal'].get('comments'),
            }

        if bid.get('bid_bond'):
            formatted['bid_bond'] = {
                'file_id': str(bid['bid_bond']['file_id']) if bid['bid_bond'].get('file_id') else None,
                'file_name': bid['bid_bond'].get('file_name'),
                'amount': bid['bid_bond'].get('amount'),
            }

        # Add evaluations
        if bid.get('evaluations'):
            formatted['evaluations'] = [
                {
                    'evaluator_id': str(e['evaluator_id']),
                    'evaluator_name': e.get('evaluator_name'),
                    'technical_score': e['technical_score'],
                    'financial_score': e['financial_score'],
                    'total_score': e['total_score'],
                    'comments': e.get('comments'),
                    'evaluated_at': e['evaluated_at'].isoformat(),
                }
                for e in bid['evaluations']
            ]
        else:
            formatted['evaluations'] = []

        return formatted


# Create service instance
bid_service = BidService()
