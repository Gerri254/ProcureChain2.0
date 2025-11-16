"""Vendor data models and business logic"""
from datetime import datetime
from typing import Dict, List
from bson import ObjectId


class VendorModel:
    """Model for vendor records"""

    VALID_TAX_STATUS = ['compliant', 'non-compliant', 'pending', 'exempt']

    @staticmethod
    def create_schema(data: Dict) -> Dict:
        """
        Create vendor record schema

        Args:
            data: Vendor data

        Returns:
            Validated vendor record
        """
        now = datetime.utcnow()

        return {
            'name': data.get('name'),
            'registration_number': data.get('registration_number'),
            'tax_compliance_status': data.get('tax_compliance_status', 'pending'),
            'contact': {
                'email': data.get('email', ''),
                'phone': data.get('phone', ''),
                'address': data.get('address', ''),
                'website': data.get('website', '')
            },
            'business_info': {
                'category': data.get('business_category', ''),
                'established_date': data.get('established_date'),
                'num_employees': data.get('num_employees', 0)
            },
            'contract_history': [],
            'performance_metrics': {
                'total_contracts': 0,
                'total_value': 0,
                'completion_rate': 0,
                'average_rating': 0
            },
            'metadata': {
                'verified': data.get('verified', False),
                'verification_date': data.get('verification_date'),
                'risk_score': data.get('risk_score', 0),
                'blacklisted': data.get('blacklisted', False)
            },
            'created_at': now,
            'updated_at': now
        }

    @staticmethod
    def add_contract_record(procurement_id: ObjectId, amount: float, date_awarded: datetime, status: str = 'active') -> Dict:
        """
        Create contract history record

        Args:
            procurement_id: Reference to procurement record
            amount: Contract amount
            date_awarded: Date contract was awarded
            status: Contract status

        Returns:
            Contract history record
        """
        return {
            'procurement_id': procurement_id,
            'amount': float(amount),
            'date_awarded': date_awarded,
            'status': status,
            'completion_date': None,
            'rating': None,
            'notes': ''
        }

    @staticmethod
    def update_performance_metrics(vendor: Dict) -> Dict:
        """
        Calculate and update vendor performance metrics

        Args:
            vendor: Vendor record with contract history

        Returns:
            Updated performance metrics
        """
        contract_history = vendor.get('contract_history', [])

        if not contract_history:
            return {
                'total_contracts': 0,
                'total_value': 0,
                'completion_rate': 0,
                'average_rating': 0
            }

        total_contracts = len(contract_history)
        total_value = sum(contract.get('amount', 0) for contract in contract_history)
        completed = len([c for c in contract_history if c.get('status') == 'completed'])
        completion_rate = (completed / total_contracts * 100) if total_contracts > 0 else 0

        # Calculate average rating
        ratings = [c.get('rating') for c in contract_history if c.get('rating') is not None]
        average_rating = sum(ratings) / len(ratings) if ratings else 0

        return {
            'total_contracts': total_contracts,
            'total_value': total_value,
            'completion_rate': round(completion_rate, 2),
            'average_rating': round(average_rating, 2)
        }

    @staticmethod
    def create_public_view(vendor: Dict) -> Dict:
        """
        Create public view of vendor record

        Args:
            vendor: Full vendor record

        Returns:
            Public-safe vendor record
        """
        public_fields = [
            '_id', 'name', 'registration_number', 'tax_compliance_status',
            'business_info', 'performance_metrics', 'created_at'
        ]

        # Exclude sensitive contact info
        public_record = {key: vendor.get(key) for key in public_fields if key in vendor}

        # Add limited contact info
        if 'contact' in vendor:
            public_record['contact'] = {
                'email': vendor['contact'].get('email', ''),
                'website': vendor['contact'].get('website', '')
            }

        return public_record
