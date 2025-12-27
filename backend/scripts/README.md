# Backend Scripts

This directory contains utility scripts for database seeding and maintenance.

## User Seeding

The `seed_users.py` script populates the database with sample users for testing all three user types: learners, employers, and educators.

### Usage

```bash
# Make sure you're in the backend directory
cd backend

# Run the user seeding script
python scripts/seed_users.py
```

### What Gets Created

The script creates **8 sample users** across three user types:

**Learners (5 users):**
- Sarah Chen (Mid-level, Full-stack, San Francisco) - Open to work ✓
- Michael Rodriguez (Senior, Frontend, Austin)
- Emily Johnson (Mid-level, Backend, Seattle) - Open to work ✓
- David Kim (Junior, Full-stack, New York) - Open to work ✓
- Jessica Martinez (Senior, Data Engineer, Boston)

**Employers (2 companies):**
- TechCorp HR Team (San Francisco) - 100-500 employees
- InnovateAI Recruiting (New York) - AI startup, 10-50 employees

**Educators (1 instructor):**
- Jane Instructor (CodeAcademy) - 10 years teaching experience

### Login Credentials

**All accounts use the same password for testing:**
```
Password: password123
```

**Example logins:**
- Learner: `sarah.chen@example.com` / `password123`
- Employer: `hr@techcorp.com` / `password123`
- Educator: `instructor@codeacademy.com` / `password123`

### User Profiles Include

**Learners:**
- Bio, location, experience level
- Portfolio, GitHub, LinkedIn links
- "Looking for job" status
- Complete profiles ready for talent search

**Employers:**
- Company name, size, industry
- Company website
- Ready to post jobs and search talent

**Educators:**
- Organization, specialization
- Years of teaching experience
- Admin access to manage challenges

### Output

The script will display:
- ✓ Successfully created users
- ⊗ Skipped users (if already exist)
- ✗ Any failures
- 📋 Complete list of test credentials

### Example Output

```
🌱 Seeding users into database...

✓ Created: Sarah Chen (learner) - sarah.chen@example.com
  → Profile updated with 7 fields
✓ Created: Michael Rodriguez (learner) - michael.rodriguez@example.com
  → Profile updated with 7 fields
...

============================================================
✓ Successfully created: 8 users
⊗ Skipped (already exist): 0 users
✗ Failed: 0 users
============================================================

📋 Test Account Credentials:
All accounts use password: password123

LEARNERS:
  • sarah.chen@example.com
  • michael.rodriguez@example.com
  ...
```

---

## Challenge Seeding

The `seed_challenges.py` script populates the database with sample coding challenges for the SkillChain platform.

### Usage

```bash
# Make sure you're in the backend directory
cd backend

# Run the seeding script
python scripts/seed_challenges.py
```

### What Gets Created

The script creates 10+ sample challenges across different skills and difficulty levels:

**React Challenges:**
- Build a Counter Component (Beginner)
- Todo List with State Management (Intermediate)

**Python Challenges:**
- List Comprehension Basics (Beginner)
- Dictionary Data Processing (Intermediate)

**JavaScript Challenges:**
- Array Manipulation Basics (Beginner)
- Async/Await Data Fetching (Intermediate)

**TypeScript Challenges:**
- Type-Safe User Interface (Beginner)

**SQL Challenges:**
- Basic SQL Queries (Beginner)

**Node.js Challenges:**
- Express REST API Endpoint (Intermediate)

### Challenge Structure

Each challenge includes:
- **Title and description**: What the challenge is about
- **Skill and difficulty level**: For proper categorization
- **Prompt**: Detailed instructions for the user
- **Starter code**: Template code to begin with
- **Test cases**: Expected inputs and outputs
- **Time limits**: Recommended and maximum time
- **Expected concepts**: What skills are being tested

### Output

The script will display:
- ✓ Successfully created challenges
- ✗ Any failures
- 📊 Statistics by skill and difficulty level

### Example Output

```
🌱 Seeding challenges into database...

✓ Created: Build a Counter Component (react - beginner)
✓ Created: Todo List with State Management (react - intermediate)
✓ Created: List Comprehension Basics (python - beginner)
...

============================================================
✓ Successfully created: 10 challenges
✗ Failed: 0 challenges
============================================================

📊 Challenge Statistics:
Total challenges: 10

By skill:
  - react: 2
  - python: 2
  - javascript: 2
  - typescript: 1
  - sql: 1
  - nodejs: 2

By difficulty:
  - beginner: 6
  - intermediate: 4
```

### Requirements

- MongoDB connection must be configured in `.env`
- Backend dependencies must be installed (`pip install -r requirements.txt`)

### Re-running the Script

The script can be run multiple times. It will create new challenge records each time. To avoid duplicates, you may want to clear the challenges collection first:

```python
# In Python shell or script
from config.database import db
db.challenges.delete_many({})
```

## Future Scripts

Additional scripts will be added for:
- User seeding
- Assessment data migration
- Database cleanup utilities
- Analytics data generation
