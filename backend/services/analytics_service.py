"""
Analytics Service

Provides comprehensive analytics and reporting for procurement data including:
- Spending trends over time
- Category distribution
- Vendor performance metrics
- Anomaly statistics
- Department-wise analysis
"""

from datetime import datetime, timedelta
from typing import Dict, List, Any
from bson import ObjectId
from config.database import db
from collections import defaultdict


class AnalyticsService:
    def __init__(self):
        self.procurements = db.procurements
        self.vendors = db.vendors
        self.anomalies = db.anomalies
        self.users = db.users

    def get_spending_trends(self, days: int = 365) -> List[Dict[str, Any]]:
        """
        Get procurement spending trends over time
        Returns monthly aggregated data for charts
        """
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)

        pipeline = [
            {
                '$match': {
                    'created_at': {'$gte': start_date, '$lte': end_date},
                    'status': {'$in': ['published', 'awarded', 'completed']}
                }
            },
            {
                '$group': {
                    '_id': {
                        'year': {'$year': '$created_at'},
                        'month': {'$month': '$created_at'}
                    },
                    'total_value': {'$sum': '$estimated_value'},
                    'awarded_value': {'$sum': '$awarded_amount'},
                    'count': {'$sum': 1}
                }
            },
            {
                '$sort': {'_id.year': 1, '_id.month': 1}
            }
        ]

        results = list(self.procurements.aggregate(pipeline))

        # Format for frontend
        trends = []
        for result in results:
            month_name = datetime(result['_id']['year'], result['_id']['month'], 1).strftime('%b %Y')
            trends.append({
                'month': month_name,
                'year': result['_id']['year'],
                'month_num': result['_id']['month'],
                'total_value': result['total_value'] or 0,
                'awarded_value': result['awarded_value'] or 0,
                'count': result['count']
            })

        return trends

    def get_category_distribution(self) -> List[Dict[str, Any]]:
        """
        Get procurement distribution by category
        Returns data for pie/donut charts
        """
        pipeline = [
            {
                '$group': {
                    '_id': '$category',
                    'count': {'$sum': 1},
                    'total_value': {'$sum': '$estimated_value'},
                    'avg_value': {'$avg': '$estimated_value'}
                }
            },
            {
                '$sort': {'total_value': -1}
            }
        ]

        results = list(self.procurements.aggregate(pipeline))

        return [{
            'category': result['_id'] or 'Unknown',
            'count': result['count'],
            'value': result['total_value'] or 0,
            'avg_value': result['avg_value'] or 0
        } for result in results]

    def get_vendor_performance(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get top vendor performance metrics
        Returns data for bar charts
        """
        pipeline = [
            {
                '$match': {
                    'performance_metrics': {'$exists': True}
                }
            },
            {
                '$project': {
                    'name': 1,
                    'total_contracts': '$performance_metrics.total_contracts',
                    'total_value': '$performance_metrics.total_value',
                    'completion_rate': '$performance_metrics.completion_rate',
                    'average_rating': '$performance_metrics.average_rating'
                }
            },
            {
                '$sort': {'total_value': -1}
            },
            {
                '$limit': limit
            }
        ]

        results = list(self.vendors.aggregate(pipeline))

        return [{
            'vendor_id': str(result['_id']),
            'name': result['name'],
            'contracts': result.get('total_contracts', 0),
            'value': result.get('total_value', 0),
            'completion_rate': result.get('completion_rate', 0) * 100,
            'rating': result.get('average_rating', 0)
        } for result in results]

    def get_anomaly_breakdown(self) -> Dict[str, Any]:
        """
        Get anomaly statistics by severity and type
        Returns data for stacked bar charts
        """
        # Severity breakdown
        severity_pipeline = [
            {
                '$group': {
                    '_id': '$severity',
                    'count': {'$sum': 1},
                    'avg_risk_score': {'$avg': '$risk_score'}
                }
            }
        ]

        severity_results = list(self.anomalies.aggregate(severity_pipeline))

        # Type breakdown
        type_pipeline = [
            {
                '$group': {
                    '_id': {
                        'type': '$anomaly_type',
                        'severity': '$severity'
                    },
                    'count': {'$sum': 1}
                }
            }
        ]

        type_results = list(self.anomalies.aggregate(type_pipeline))

        # Format for stacked bar chart
        types = defaultdict(lambda: {'low': 0, 'medium': 0, 'high': 0, 'critical': 0})
        for result in type_results:
            anomaly_type = result['_id'].get('type') or 'unknown'
            severity = result['_id'].get('severity') or 'low'
            types[anomaly_type][severity] = result['count']

        return {
            'by_severity': [{
                'severity': result['_id'] or 'Unknown',
                'count': result['count'],
                'avg_risk_score': round(result['avg_risk_score'] or 0, 2)
            } for result in severity_results],
            'by_type': [{
                'type': anom_type,
                **counts
            } for anom_type, counts in types.items()]
        }

    def get_key_metrics(self) -> Dict[str, Any]:
        """
        Get key performance indicators
        """
        # Total procurement value
        total_value_pipeline = [
            {
                '$group': {
                    '_id': None,
                    'total': {'$sum': '$estimated_value'},
                    'awarded': {'$sum': '$awarded_amount'}
                }
            }
        ]
        total_value = list(self.procurements.aggregate(total_value_pipeline))

        # This month's value
        start_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        month_value_pipeline = [
            {
                '$match': {
                    'created_at': {'$gte': start_of_month}
                }
            },
            {
                '$group': {
                    '_id': None,
                    'total': {'$sum': '$estimated_value'}
                }
            }
        ]
        month_value = list(self.procurements.aggregate(month_value_pipeline))

        # Average processing time
        processing_time_pipeline = [
            {
                '$match': {
                    'status': {'$in': ['awarded', 'completed']},
                    'published_date': {'$exists': True},
                    'awarded_date': {'$exists': True}
                }
            },
            {
                '$project': {
                    'processing_days': {
                        '$divide': [
                            {'$subtract': ['$awarded_date', '$published_date']},
                            1000 * 60 * 60 * 24
                        ]
                    }
                }
            },
            {
                '$group': {
                    '_id': None,
                    'avg_days': {'$avg': '$processing_days'}
                }
            }
        ]
        processing_time = list(self.procurements.aggregate(processing_time_pipeline))

        # Counts
        total_procurements = self.procurements.count_documents({})
        active_procurements = self.procurements.count_documents({'status': {'$in': ['published', 'evaluation']}})
        total_vendors = self.vendors.count_documents({})
        high_risk_anomalies = self.anomalies.count_documents({'risk_score': {'$gte': 70}, 'status': 'pending'})

        return {
            'total_value': total_value[0]['total'] if total_value else 0,
            'awarded_value': total_value[0]['awarded'] if total_value else 0,
            'month_value': month_value[0]['total'] if month_value else 0,
            'avg_processing_days': round(processing_time[0]['avg_days'] if processing_time else 0, 1),
            'total_procurements': total_procurements,
            'active_procurements': active_procurements,
            'total_vendors': total_vendors,
            'high_risk_anomalies': high_risk_anomalies
        }

    def get_department_analysis(self) -> List[Dict[str, Any]]:
        """
        Get spending analysis by department
        """
        pipeline = [
            {
                '$lookup': {
                    'from': 'users',
                    'localField': 'created_by',
                    'foreignField': '_id',
                    'as': 'creator'
                }
            },
            {
                '$unwind': {
                    'path': '$creator',
                    'preserveNullAndEmptyArrays': True
                }
            },
            {
                '$group': {
                    '_id': '$creator.department',
                    'count': {'$sum': 1},
                    'total_value': {'$sum': '$estimated_value'},
                    'avg_value': {'$avg': '$estimated_value'}
                }
            },
            {
                '$sort': {'total_value': -1}
            }
        ]

        results = list(self.procurements.aggregate(pipeline))

        return [{
            'department': result['_id'] or 'Unknown',
            'count': result['count'],
            'total_value': result['total_value'] or 0,
            'avg_value': result['avg_value'] or 0
        } for result in results]

    def get_status_distribution(self) -> List[Dict[str, Any]]:
        """
        Get procurement distribution by status
        """
        pipeline = [
            {
                '$group': {
                    '_id': '$status',
                    'count': {'$sum': 1}
                }
            }
        ]

        results = list(self.procurements.aggregate(pipeline))

        return [{
            'status': result['_id'] or 'Unknown',
            'count': result['count']
        } for result in results]

    def get_timeline_data(self, procurement_id: str) -> Dict[str, Any]:
        """
        Get detailed timeline for a procurement
        """
        procurement = self.procurements.find_one({'_id': ObjectId(procurement_id)})

        if not procurement:
            return None

        timeline = []

        # Created
        if procurement.get('created_at'):
            timeline.append({
                'stage': 'created',
                'label': 'Created',
                'date': procurement['created_at'].isoformat(),
                'status': 'completed'
            })

        # Published
        if procurement.get('published_date'):
            timeline.append({
                'stage': 'published',
                'label': 'Published',
                'date': procurement['published_date'].isoformat(),
                'status': 'completed'
            })

        # Deadline
        if procurement.get('deadline'):
            is_past = procurement['deadline'] < datetime.utcnow()
            timeline.append({
                'stage': 'deadline',
                'label': 'Submission Deadline',
                'date': procurement['deadline'].isoformat(),
                'status': 'completed' if is_past else 'upcoming'
            })

        # Evaluation (if status is evaluation or beyond)
        if procurement.get('status') in ['evaluation', 'awarded', 'completed']:
            timeline.append({
                'stage': 'evaluation',
                'label': 'Under Evaluation',
                'date': procurement.get('updated_at', procurement.get('created_at')).isoformat(),
                'status': 'completed'
            })

        # Awarded
        if procurement.get('awarded_date'):
            timeline.append({
                'stage': 'awarded',
                'label': 'Contract Awarded',
                'date': procurement['awarded_date'].isoformat(),
                'status': 'completed',
                'vendor_id': procurement.get('awarded_vendor_id')
            })

        # Completed
        if procurement.get('status') == 'completed':
            timeline.append({
                'stage': 'completed',
                'label': 'Completed',
                'date': procurement.get('updated_at').isoformat(),
                'status': 'completed'
            })

        return {
            'procurement_id': str(procurement['_id']),
            'tender_number': procurement.get('tender_number'),
            'title': procurement.get('title'),
            'current_status': procurement.get('status'),
            'timeline': timeline
        }


# Create service instance
analytics_service = AnalyticsService()
