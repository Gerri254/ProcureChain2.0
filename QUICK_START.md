# SkillChain Quick Start Guide

Get your SkillChain platform up and running in minutes!

## Prerequisites

- **MongoDB** running on `localhost:27017`
- **Python 3.9+** installed
- **Node.js 18+** installed
- **Git** installed

---

## Step 1: Backend Setup

### 1.1 Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 1.2 Environment Variables

The `.env` file is already configured:
```bash
MONGODB_URI=mongodb://localhost:27017/skillchain
JWT_SECRET_KEY=skillchain-dev-secret-key-change-in-production-12345
GEMINI_API_KEY=AIzaSyD1MGq96g3RMgNFqzSR6kMo7mRR7b3xgik
```

### 1.3 Seed the Database

**Seed Challenges (10+ coding challenges):**
```bash
python scripts/seed_challenges.py
```

**Seed Users (8 test accounts):**
```bash
python scripts/seed_users.py
```

### 1.4 Start the Backend Server

```bash
python app.py
```

Expected output:
```
✓ MongoDB connection successful to database: skillchain
✓ Database connection verified
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

---

## Step 2: Frontend Setup

### 2.1 Install Node Dependencies

```bash
cd frontend
npm install
```

### 2.2 Environment Variables

Create `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 2.3 Start the Frontend Server

```bash
npm run dev
```

Expected output:
```
▲ Next.js 16.0.3
- Local: http://localhost:3000
- Ready in 2.5s
```

---

## Step 3: Test the Platform

### 3.1 Visit the Homepage

Open your browser to:
```
http://localhost:3000
```

You should see the **SkillChain homepage** with:
- Hero section: "Verify Your Skills with AI-Powered Assessments"
- Features section
- Stats section
- CTA button: "Start Your First Assessment"

### 3.2 Login with Test Accounts

**All test accounts use password:** `password123`

**Learner Account (most features):**
```
Email: sarah.chen@example.com
Password: password123
```

**Employer Account (talent search, challenge management):**
```
Email: hr@techcorp.com
Password: password123
```

**Educator Account (admin, challenge management):**
```
Email: instructor@codeacademy.com
Password: password123
```

### 3.3 Test the Full Flow

**As a Learner (Sarah Chen):**

1. **Browse Challenges**
   - Navigate to "Assessments" → "Browse"
   - See 10+ challenges (React, Python, JavaScript, etc.)
   - Filter by skill, difficulty, search

2. **Start an Assessment**
   - Click "Start Challenge" on any challenge
   - OR go to "Assessments" → "Start New Assessment"
   - Select: React + Beginner
   - Click "Start Assessment"

3. **Take the Assessment**
   - Timer starts counting down (20:00)
   - Read challenge on the left
   - Write code on the right
   - Watch timer turn orange (<5 min), red (<1 min)
   - Click "Submit Code"
   - Confirm submission

4. **View Results**
   - Navigate to "Assessments" → "My Assessments"
   - See your assessment status (Processing → Verified/Failed)
   - View AI analysis:
     - Overall score
     - Correctness, quality, best practices, efficiency
     - Strengths, weaknesses, suggestions

5. **Check Your Skills**
   - Navigate to "Assessments" → "My Skills"
   - See verified credentials with scores
   - Check expiry dates

6. **View Leaderboard**
   - Navigate to "Assessments" → "Leaderboard"
   - See top 3 podium
   - Filter by skill and time period

**As an Employer (TechCorp HR):**

1. **Browse Talent**
   - Navigate to "Talent" → "Browse Talent"
   - See verified developers
   - Filter by:
     - Skills (React, Python, etc.)
     - Experience level
     - Minimum score
     - "Open to work" status

2. **View Candidate Profiles**
   - Click "View Full Profile" on any talent card
   - See verified skills with scores
   - View portfolio, GitHub, LinkedIn
   - Check activity timeline

3. **Manage Challenges**
   - Navigate to "Admin" → "Challenge Management"
   - See all challenges with statistics
   - Create new challenge (coming soon)
   - Edit/delete challenges

**As an Educator (Jane Instructor):**

1. **Manage Challenges**
   - Navigate to "Admin" → "Challenge Management"
   - View challenge statistics:
     - Times used
     - Average score
     - Pass rate
   - Filter by skill and difficulty

---

## API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/refresh` - Refresh access token

### Assessments
- `GET /api/assessments` - Browse challenges
- `POST /api/assessments` - Create new assessment
- `GET /api/assessments/my` - Get my assessments
- `POST /api/assessments/:id/submit` - Submit code
- `GET /api/assessments/my-skills` - Get my verified skills
- `GET /api/assessments/leaderboard` - Get leaderboard

### Challenges
- `GET /api/challenges` - List challenges
- `GET /api/challenges/:id` - Get single challenge
- `GET /api/challenges/random` - Get random challenge
- `POST /api/challenges` - Create challenge (admin)
- `PUT /api/challenges/:id` - Update challenge (admin)
- `DELETE /api/challenges/:id` - Delete challenge (admin)

### Profiles
- `GET /api/profiles/me` - Get my profile
- `PUT /api/profiles/me` - Update my profile
- `GET /api/profiles/:userId` - Get user profile (public)
- `POST /api/profiles/search-learners` - Search talent

---

## Troubleshooting

### Backend won't start
- Check MongoDB is running: `sudo systemctl status mongodb`
- Check `.env` file exists in `backend/` directory
- Verify Python dependencies: `pip install -r requirements.txt`

### Frontend won't start
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check `.env.local` exists in `frontend/` directory
- Clear Next.js cache: `rm -rf .next`

### "No challenges found"
- Run the seed script: `python scripts/seed_challenges.py`
- Check MongoDB connection in backend logs

### "User not found" on login
- Run the user seed script: `python scripts/seed_users.py`
- Verify password is exactly: `password123`

### Database connection errors
- Start MongoDB: `sudo systemctl start mongodb`
- Check connection string in `.env`: `MONGODB_URI=mongodb://localhost:27017/skillchain`

---

## Test Data Summary

**8 Users Created:**
- 5 Learners (3 open to work)
- 2 Employers
- 1 Educator

**10+ Challenges Created:**
- React (2): Counter, Todo List
- Python (2): List Comprehension, Dictionary Processing
- JavaScript (2): Array Methods, Async/Await
- TypeScript (1): Type-Safe Interfaces
- SQL (1): Basic Queries
- Node.js (1): Express REST API

**All Passwords:** `password123`

---

## Next Steps

1. ✅ Explore the platform as different user types
2. ✅ Take a full assessment and see AI analysis
3. ✅ Browse talent and view profiles
4. ✅ Test the leaderboard and filtering
5. 📅 Week 9: Job posting system (coming next!)

---

**Need Help?**
- Check `backend/scripts/README.md` for seeding details
- Review `PROGRESS.md` for completed features
- See API documentation in route files

Enjoy building with SkillChain! 🚀
