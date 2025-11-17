# Database Seeding Script

Comprehensive seed script for populating the ProcureChain database with realistic test data.

## Features

The seed script creates:

- **Users**: Admin, government officials, auditors, and public users
- **Vendors**: Realistic vendor profiles with performance scores
- **Procurements**: Tenders in various stages (draft, published, awarded, etc.)
- **Anomalies**: AI-detected anomalies with different severity levels
- **Audit Logs**: Sample activity logs

## Usage

### Basic Usage

```bash
# Navigate to backend directory
cd backend

# Run with default settings
python scripts/seed_data.py
```

### Clear and Reseed

```bash
# Clear all existing data and seed fresh data
python scripts/seed_data.py --clear
```

### Custom Quantities

```bash
# Specify custom quantities for each entity type
python scripts/seed_data.py --users 20 --vendors 25 --procurements 50 --anomalies 20 --logs 100
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `--clear` | False | Clear existing database before seeding |
| `--users` | 10 | Number of users to create |
| `--vendors` | 15 | Number of vendors to create |
| `--procurements` | 30 | Number of procurements to create |
| `--anomalies` | 15 | Number of anomalies to create |
| `--logs` | 50 | Number of audit logs to create |

## Test Accounts

After seeding, you can login with these accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@procurechain.local | Admin@123 |
| Procurement Officer | official@procurechain.local | Official@123 |
| Auditor | auditor@procurechain.local | Auditor@123 |
| Public | public@procurechain.local | Public@123 |

## Data Generated

### Users
- 1 Admin user
- 1 Procurement officer
- 1 Auditor
- 1 Public user
- Additional random users as specified

### Vendors
- Realistic Kenyan company names
- Registration numbers in format: REG/YEAR/NUMBER
- Contact information (email, phone, address)
- Categories: goods, services, works, consultancy, supplies
- Tax compliance status (mostly compliant)
- Performance scores (60-100)
- Contract history

### Procurements
- Realistic tender titles by category
- Various statuses with appropriate distribution:
  - Draft: 5%
  - Published: 40%
  - Evaluation: 25%
  - Awarded: 15%
  - Completed: 10%
  - Cancelled: 5%
- Tender numbers in format: PROC/YEAR/TXXXX
- Realistic dates based on status
- Estimated values: KES 500,000 - 50,000,000
- Department assignments
- AI metadata (summary, requirements, risk level)

### Anomalies
- Only created for awarded/completed procurements
- Types: price, vendor, timeline, document, pattern
- Severities: low, medium, high, critical
- Risk scores matching severity levels
- Various statuses: flagged, under_review, resolved, false_positive
- Detailed descriptions

### Audit Logs
- User actions (login, logout, create, update, view)
- Resource types and IDs
- IP addresses and user agents
- Timestamps spread over past 60 days

## Sample Data

### Departments
- Ministry of Health
- Ministry of Education
- Ministry of Transport
- Ministry of Energy
- Ministry of Agriculture
- County Government - Nairobi
- County Government - Mombasa
- National Treasury

### Vendor Names
- East Africa Supplies Ltd
- Kenya Construction Group
- Nairobi Tech Solutions
- Premier Services Kenya
- Mombasa Logistics Co.
- And more...

### Procurement Categories

**Goods**: Office furniture, medical equipment, computers, textbooks, lab equipment

**Services**: IT support, security services, cleaning, consultancy, waste management

**Works**: School construction, road rehabilitation, health centers, bridges, water supply

**Consultancy**: Legal advisory, financial audit, strategic planning, IT assessment, environmental impact

**Supplies**: Medical supplies, stationery, cleaning supplies, food supplies, fuel

## Examples

### Quick Test Environment
```bash
# Small dataset for quick testing
python scripts/seed_data.py --clear --users 5 --vendors 5 --procurements 10
```

### Full Production-Like Dataset
```bash
# Large dataset similar to production
python scripts/seed_data.py --clear --users 50 --vendors 30 --procurements 100 --anomalies 30 --logs 200
```

### Development Environment
```bash
# Balanced dataset for development
python scripts/seed_data.py --clear --users 15 --vendors 20 --procurements 40 --anomalies 15 --logs 75
```

## Output

The script provides detailed progress output:

```
============================================================
🌱 PROCURECHAIN DATABASE SEEDER
============================================================

🗑️  Clearing existing data...
   Deleted X documents from users
   Deleted X documents from vendors
   ...
✓ Database cleared

👥 Creating 10 users...
   ✓ Created user: admin@procurechain.local (admin)
   ✓ Created user: official@procurechain.local (government_official)
   ...
✓ Created 10 users

🏢 Creating 15 vendors...
   ✓ Created vendor: East Africa Supplies Ltd (REG/2023/1001)
   ...
✓ Created 15 vendors

📋 Creating 30 procurements...
   ✓ Created procurement: PROC/2024/T1001 (published)
   ...
✓ Created 30 procurements

⚠️  Creating 15 anomalies...
   ✓ Created anomaly: price (high) for procurement 507f1f77...
   ...
✓ Created 15 anomalies

📝 Creating 50 audit logs...
✓ Created 50 audit logs

============================================================
📊 DATABASE SEEDING COMPLETE
============================================================
Users created:        10
Vendors created:      15
Procurements created: 30
Anomalies created:    15

📍 Test Accounts:
------------------------------------------------------------
Admin:     admin@procurechain.local / Admin@123
Official:  official@procurechain.local / Official@123
Auditor:   auditor@procurechain.local / Auditor@123
Public:    public@procurechain.local / Public@123
------------------------------------------------------------

✓ Database is ready for testing!
============================================================
```

## Prerequisites

- MongoDB running and accessible
- Backend environment configured (`.env` file)
- Python dependencies installed (`pip install -r requirements.txt`)

## Notes

- The script uses the same database configuration as the main application
- Existing data is only cleared if `--clear` flag is used
- All dates are generated relative to the current time
- Passwords for test accounts are intentionally simple for testing
- **Change passwords in production!**

## Troubleshooting

### Connection Error
```
Error: Could not connect to MongoDB
Solution: Ensure MongoDB is running and MONGODB_URI in .env is correct
```

### Import Error
```
Error: No module named 'config'
Solution: Run the script from the backend directory: python scripts/seed_data.py
```

### Permission Error
```
Error: Permission denied
Solution: Make script executable: chmod +x scripts/seed_data.py
```

## Integration with Frontend

After seeding, you can:

1. Start the backend: `python app.py`
2. Start the frontend: `cd ../frontend && npm run dev`
3. Login with any test account
4. Browse seeded procurements, vendors, and anomalies
5. Test all features with realistic data

## Safety

- Only use in development/testing environments
- Never run with `--clear` on production databases
- Test accounts use simple passwords - change in production
- Review generated data before using in demos

---

**Happy Testing! 🚀**
