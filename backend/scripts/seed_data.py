#!/usr/bin/env python3
"""
ProcureChain Database Seeding Script

This script populates the database with comprehensive test data including:
- Users (admin, officials, auditors, public)
- Vendors with performance history
- Procurements in various stages
- Anomalies (both real and test cases)
- Audit logs

Usage:
    python scripts/seed_data.py [--clear] [--users N] [--vendors N] [--procurements N]
"""

import sys
import os
from datetime import datetime, timedelta
import random
from typing import List, Dict, Any

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from config.database import db
from models.user import UserModel
from models.vendor import VendorModel
from models.procurement import ProcurementModel
from models.anomaly import AnomalyModel
import argparse

# Seed data configurations
DEPARTMENTS = [
    "Ministry of Health",
    "Ministry of Education",
    "Ministry of Transport",
    "Ministry of Energy",
    "Ministry of Agriculture",
    "County Government - Nairobi",
    "County Government - Mombasa",
    "National Treasury",
]

VENDOR_NAMES = [
    "East Africa Supplies Ltd",
    "Kenya Construction Group",
    "Nairobi Tech Solutions",
    "Premier Services Kenya",
    "Mombasa Logistics Co.",
    "Savanna Equipment Ltd",
    "Capital Consultants",
    "Harambee Contractors",
    "Lakeside Enterprises",
    "Mount Kenya Suppliers",
    "Rift Valley Services",
    "Coastal Trading Company",
    "Highland Tech Group",
    "Safari Solutions Ltd",
    "Unity Construction",
]

PROCUREMENT_TITLES = {
    'goods': [
        "Supply of Office Furniture",
        "Procurement of Medical Equipment",
        "Purchase of Computer Hardware",
        "Supply of School Textbooks",
        "Acquisition of Laboratory Equipment",
    ],
    'services': [
        "IT Support and Maintenance Services",
        "Security Services for Government Buildings",
        "Cleaning and Janitorial Services",
        "Consultancy for System Integration",
        "Waste Management Services",
    ],
    'works': [
        "Construction of Secondary School",
        "Road Rehabilitation Project",
        "Construction of Health Center",
        "Bridge Construction and Maintenance",
        "Water Supply System Installation",
    ],
    'consultancy': [
        "Legal Advisory Services",
        "Financial Audit Services",
        "Strategic Planning Consultancy",
        "IT Infrastructure Assessment",
        "Environmental Impact Assessment",
    ],
    'supplies': [
        "Supply of Medical Supplies",
        "Office Stationery Supplies",
        "Cleaning Supplies and Equipment",
        "Food Supplies for Schools",
        "Fuel and Lubricants Supply",
    ],
}

ANOMALY_SCENARIOS = [
    {
        'type': 'price',
        'severity': 'high',
        'description': 'Procurement price 45% above market average for similar items',
    },
    {
        'type': 'vendor',
        'severity': 'critical',
        'description': 'Vendor has history of contract violations and poor performance scores',
    },
    {
        'type': 'timeline',
        'severity': 'medium',
        'description': 'Unusually short tender period of 3 days detected',
    },
    {
        'type': 'document',
        'severity': 'high',
        'description': 'Missing required compliance documentation in tender submission',
    },
    {
        'type': 'pattern',
        'severity': 'critical',
        'description': 'Single vendor awarded 8 contracts in 2 months, possible favoritism',
    },
]


class DatabaseSeeder:
    def __init__(self):
        self.db = db
        self.created_users = []
        self.created_vendors = []
        self.created_procurements = []
        self.created_anomalies = []

    def clear_database(self):
        """Clear all collections"""
        print("🗑️  Clearing existing data...")

        collections = ['users', 'vendors', 'procurements', 'anomalies', 'audit_logs']
        for collection_name in collections:
            count = self.db[collection_name].delete_many({})
            print(f"   Deleted {count.deleted_count} documents from {collection_name}")

        print("✓ Database cleared\n")

    def create_users(self, count: int = 10):
        """Create test users with various roles"""
        print(f"👥 Creating {count} users...")

        users_data = [
            {
                'email': 'admin@procurechain.local',
                'password': 'Admin@123',
                'full_name': 'System Administrator',
                'role': 'admin',
                'department': 'IT Department',
                'phone': '+254712345678',
            },
            {
                'email': 'official@procurechain.local',
                'password': 'Official@123',
                'full_name': 'John Kamau',
                'role': 'procurement_officer',
                'department': random.choice(DEPARTMENTS),
                'phone': '+254723456789',
            },
            {
                'email': 'auditor@procurechain.local',
                'password': 'Auditor@123',
                'full_name': 'Mary Wanjiku',
                'role': 'auditor',
                'department': 'Audit Department',
                'phone': '+254734567890',
            },
            {
                'email': 'public@procurechain.local',
                'password': 'Public@123',
                'full_name': 'Peter Omondi',
                'role': 'public',
                'phone': '+254745678901',
            },
        ]

        # Add more random users
        for i in range(count - 4):
            role = random.choice(['procurement_officer', 'auditor', 'public'])
            users_data.append({
                'email': f'user{i+1}@procurechain.local',
                'password': 'User@123',
                'full_name': f'User {i+1}',
                'role': role,
                'department': random.choice(DEPARTMENTS) if role != 'public' else None,
                'phone': f'+25470000{i+1:04d}',
            })

        for user_data in users_data:
            user_schema = UserModel.create_schema(user_data)
            result = self.db.users.insert_one(user_schema)
            self.created_users.append(result.inserted_id)
            print(f"   ✓ Created user: {user_data['email']} ({user_data['role']})")

        print(f"✓ Created {len(self.created_users)} users\n")

    def create_vendors(self, count: int = 15):
        """Create test vendors"""
        print(f"🏢 Creating {count} vendors...")

        categories_list = [
            ['goods', 'supplies'],
            ['services', 'consultancy'],
            ['works'],
            ['goods', 'services', 'supplies'],
            ['consultancy'],
        ]

        for i in range(count):
            vendor_name = VENDOR_NAMES[i % len(VENDOR_NAMES)]
            if i >= len(VENDOR_NAMES):
                vendor_name = f"{vendor_name} Branch {i - len(VENDOR_NAMES) + 1}"

            vendor_data = {
                'name': vendor_name,
                'registration_number': f'REG/{2020 + (i % 5)}/{1000 + i:04d}',
                'email': f'contact@{vendor_name.lower().replace(" ", "")}.co.ke',
                'phone': f'+25472000{i:04d}',
                'address': f'{random.choice(["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"])}, {random.randint(1, 999)} {random.choice(["Kenyatta", "Moi", "Uhuru", "Haile Selassie"])} Avenue',
                'business_category': ', '.join(random.choice(categories_list)),
                'tax_compliance_status': random.choice(['compliant', 'compliant', 'compliant', 'non_compliant', 'pending']),
            }

            vendor_schema = VendorModel.create_schema(vendor_data)
            # Add performance metrics
            vendor_schema['performance_metrics'] = {
                'total_contracts': random.randint(0, 20),
                'total_value': random.randint(1000000, 50000000),
                'completion_rate': random.uniform(0.7, 1.0),
                'average_rating': random.uniform(3.5, 5.0),
            }
            result = self.db.vendors.insert_one(vendor_schema)
            self.created_vendors.append(result.inserted_id)
            print(f"   ✓ Created vendor: {vendor_data['name']} ({vendor_data['registration_number']})")

        print(f"✓ Created {len(self.created_vendors)} vendors\n")

    def create_procurements(self, count: int = 30):
        """Create test procurements"""
        print(f"📋 Creating {count} procurements...")

        statuses = ['draft', 'published', 'evaluation', 'awarded', 'completed', 'cancelled']
        status_weights = [5, 40, 25, 15, 10, 5]  # More published/evaluation

        for i in range(count):
            category = random.choice(list(PROCUREMENT_TITLES.keys()))
            title = random.choice(PROCUREMENT_TITLES[category])
            status = random.choices(statuses, weights=status_weights)[0]

            # Generate dates based on status
            created_date = datetime.utcnow() - timedelta(days=random.randint(1, 180))
            published_date = None
            closing_date = None
            awarded_date = None

            if status in ['published', 'evaluation', 'awarded', 'completed']:
                published_date = created_date + timedelta(days=random.randint(1, 7))
                closing_date = published_date + timedelta(days=random.randint(14, 30))

            if status in ['awarded', 'completed']:
                awarded_date = closing_date + timedelta(days=random.randint(7, 21))

            estimated_value = random.randint(500000, 50000000)
            awarded_value = None
            vendor_id = None

            if status in ['awarded', 'completed']:
                vendor_id = str(random.choice(self.created_vendors))
                # Awarded value can be +/- 10% of estimated
                variance = random.uniform(-0.1, 0.1)
                awarded_value = int(estimated_value * (1 + variance))

            procurement_data = {
                'tender_number': f'PROC/{created_date.year}/T{1000 + i:04d}',
                'title': f"{title} - {random.choice(DEPARTMENTS)}",
                'description': f"Procurement of {title.lower()} for government operations. This tender includes comprehensive requirements and specifications for delivery and implementation.",
                'category': category,
                'estimated_value': estimated_value,
                'currency': 'KES',
                'status': status,
                'published_date': published_date,
                'deadline': closing_date,
                'created_by': str(random.choice(self.created_users)),
                'awarded_vendor_id': vendor_id,
                'awarded_amount': awarded_value,
                'awarded_date': awarded_date,
            }

            # Add AI metadata for some procurements
            if random.random() > 0.3:
                procurement_data['ai_analyzed'] = True
                procurement_data['risk_score'] = random.randint(0, 100)

            procurement_schema = ProcurementModel.create_schema(procurement_data)
            result = self.db.procurements.insert_one(procurement_schema)
            self.created_procurements.append(result.inserted_id)
            print(f"   ✓ Created procurement: {procurement_data['tender_number']} ({status})")

        print(f"✓ Created {len(self.created_procurements)} procurements\n")

    def create_anomalies(self, count: int = 15):
        """Create test anomalies"""
        print(f"⚠️  Creating {count} anomalies...")

        # Only create anomalies for awarded/completed procurements
        eligible_procurements = [
            p for p in self.created_procurements
            if self.db.procurements.find_one({'_id': p, 'status': {'$in': ['awarded', 'completed']}})
        ]

        if not eligible_procurements:
            print("   No eligible procurements for anomalies")
            return

        for i in range(min(count, len(eligible_procurements))):
            procurement_id = random.choice(eligible_procurements)
            scenario = random.choice(ANOMALY_SCENARIOS)

            # Calculate risk score based on severity
            risk_scores = {
                'low': random.randint(10, 30),
                'medium': random.randint(31, 55),
                'high': random.randint(56, 80),
                'critical': random.randint(81, 100),
            }

            anomaly_data = {
                'type': scenario['type'],
                'severity': scenario['severity'],
                'description': scenario['description'],
                'reasoning': f"AI detected {scenario['type']} anomaly with {scenario['severity']} severity",
                'risk_score': risk_scores[scenario['severity']],
                'detected_pattern': scenario['type'],
            }

            anomaly_schema = AnomalyModel.create_schema(procurement_id, anomaly_data)

            # Update status for some anomalies
            status = random.choice(['pending', 'pending', 'investigating', 'resolved', 'false_positive'])
            anomaly_schema['status'] = status

            # Add resolution info if status is resolved
            if status == 'resolved':
                anomaly_schema['resolved_by'] = random.choice(self.created_users)
                anomaly_schema['resolved_at'] = datetime.utcnow() - timedelta(days=random.randint(0, 10))
                anomaly_schema['resolution_notes'] = 'Anomaly investigated and resolved. No actual issues found.'

            result = self.db.anomalies.insert_one(anomaly_schema)
            self.created_anomalies.append(result.inserted_id)
            print(f"   ✓ Created anomaly: {scenario['type']} ({scenario['severity']}) for procurement {str(procurement_id)[:8]}...")

        print(f"✓ Created {len(self.created_anomalies)} anomalies\n")

    def create_audit_logs(self, count: int = 50):
        """Create sample audit logs"""
        print(f"📝 Creating {count} audit logs...")

        actions = [
            'user.login',
            'user.logout',
            'procurement.create',
            'procurement.update',
            'procurement.view',
            'vendor.create',
            'vendor.update',
            'anomaly.flag',
            'anomaly.resolve',
            'document.upload',
        ]

        for i in range(count):
            log_data = {
                'user_id': str(random.choice(self.created_users)),
                'action': random.choice(actions),
                'resource_type': random.choice(['procurement', 'vendor', 'user', 'anomaly']),
                'resource_id': str(random.choice(self.created_procurements + self.created_vendors)),
                'details': {'method': 'POST', 'endpoint': '/api/procurement'},
                'ip_address': f'192.168.{random.randint(1, 255)}.{random.randint(1, 255)}',
                'user_agent': 'Mozilla/5.0 (Test Agent)',
                'timestamp': datetime.utcnow() - timedelta(days=random.randint(0, 60)),
            }

            self.db.audit_logs.insert_one(log_data)

        print(f"✓ Created {count} audit logs\n")

    def print_summary(self):
        """Print seeding summary"""
        print("\n" + "="*60)
        print("📊 DATABASE SEEDING COMPLETE")
        print("="*60)
        print(f"Users created:        {len(self.created_users)}")
        print(f"Vendors created:      {len(self.created_vendors)}")
        print(f"Procurements created: {len(self.created_procurements)}")
        print(f"Anomalies created:    {len(self.created_anomalies)}")
        print("\n📍 Test Accounts:")
        print("-"*60)
        print("Admin:     admin@procurechain.local / Admin@123")
        print("Official:  official@procurechain.local / Official@123")
        print("Auditor:   auditor@procurechain.local / Auditor@123")
        print("Public:    public@procurechain.local / Public@123")
        print("-"*60)
        print("\n✓ Database is ready for testing!")
        print("="*60 + "\n")


def main():
    parser = argparse.ArgumentParser(description='Seed ProcureChain database with test data')
    parser.add_argument('--clear', action='store_true', help='Clear existing data before seeding')
    parser.add_argument('--users', type=int, default=10, help='Number of users to create')
    parser.add_argument('--vendors', type=int, default=15, help='Number of vendors to create')
    parser.add_argument('--procurements', type=int, default=30, help='Number of procurements to create')
    parser.add_argument('--anomalies', type=int, default=15, help='Number of anomalies to create')
    parser.add_argument('--logs', type=int, default=50, help='Number of audit logs to create')

    args = parser.parse_args()

    print("\n" + "="*60)
    print("🌱 PROCURECHAIN DATABASE SEEDER")
    print("="*60 + "\n")

    seeder = DatabaseSeeder()

    if args.clear:
        seeder.clear_database()

    try:
        seeder.create_users(args.users)
        seeder.create_vendors(args.vendors)
        seeder.create_procurements(args.procurements)
        seeder.create_anomalies(args.anomalies)
        seeder.create_audit_logs(args.logs)
        seeder.print_summary()

    except Exception as e:
        print(f"\n❌ Error during seeding: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
