# Production Setup Guide - SkillChain

This guide explains how to set up SkillChain for production with real dynamic data (no seeded data).

## 🚨 Remove All Seeded Data

### Step 1: Clear Database Collections

Run this command in MongoDB shell or MongoDB Compass:

```javascript
// Connect to your database
use skillchain

// Remove all seeded data
db.users.deleteMany({})
db.user_profiles.deleteMany({})
db.challenges.deleteMany({})
db.skill_assessments.deleteMany({})
db.job_postings.deleteMany({})
db.audit_logs.deleteMany({})

// Verify all collections are empty
db.users.countDocuments()
db.user_profiles.countDocuments()
db.challenges.countDocuments()
db.skill_assessments.countDocuments()
db.job_postings.countDocuments()
```

### Step 2: Remove Seed Scripts (Optional)

The seed scripts are located in `backend/scripts/`:
- `seed_users.py` - Creates test users
- `seed_challenges.py` - Creates sample challenges

**You can delete these files or keep them for development/testing purposes.**

```bash
# Optional: Remove seed scripts
rm backend/scripts/seed_users.py
rm backend/scripts/seed_challenges.py
```

---

## 🎯 Production Data Flow

### 1. **User Registration** (Real Users Only)

Users sign up via the registration page at `/register`:

**Registration Endpoints:**
- `POST /api/auth/register` - Creates new user account
- Auto-creates user profile based on `user_type`:
  - `learner` → Creates learner profile
  - `employer` → Creates employer profile
  - `educator` → Creates educator/learner profile

**Example Registration:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123",
  "full_name": "John Doe",
  "user_type": "learner",
  "company_name": "Optional for employers"
}
```

### 2. **User Login**

Users login via `/login`:
- `POST /api/auth/login` - Returns JWT token + user data with profile
- Token stored in localStorage
- Auto-refreshes user data on app mount

### 3. **Create First Admin User** (Manual)

Since you removed seeded data, create your first admin manually:

**Option A: Direct MongoDB Insert**
```javascript
use skillchain

// Hash password using bcrypt (you'll need to generate this)
// Password: "admin123" hashed with bcrypt
db.users.insertOne({
  email: "admin@skillchain.com",
  password_hash: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5qdUxt7L3eG8i",
  full_name: "SkillChain Admin",
  role: "admin",
  user_type: "educator",
  status: "active",
  permissions: ["all"],
  created_at: new Date(),
  last_login: null
})
```

**Option B: Register via API then Update Role**
```javascript
// 1. Register normally via /register
// 2. Update role in MongoDB:
db.users.updateOne(
  { email: "youremail@example.com" },
  {
    $set: {
      role: "admin",
      permissions: ["all"]
    }
  }
)
```

### 4. **Challenges** (Created by Educators)

Educators create challenges via `/admin/challenges/create`:
- Only educators and admins can create challenges
- Challenges are created dynamically through the UI
- No seed data needed

**To populate initial challenges:**
1. Login as educator/admin
2. Navigate to `/admin/challenges`
3. Click "Create Challenge"
4. Fill out the form and submit

### 5. **Job Postings** (Created by Employers)

Employers create jobs via `/admin/job-postings/create`:
- Only employers can create job postings
- Jobs are created dynamically through the UI

**To populate initial jobs:**
1. Login as employer
2. Navigate to `/admin/job-postings`
3. Click "Post New Job"
4. Fill out the form and submit

---

## 🔐 User Types and Permissions

### Learner
- Take assessments
- Earn skill credentials
- Browse jobs
- Update profile
- View dashboard

### Employer
- Post job openings
- Browse talent
- Manage job postings
- View applications (when implemented)
- View dashboard

### Educator
- Create challenges
- Manage assessments
- View learner progress
- Create challenges
- View dashboard

### Admin (Special Role)
- All educator permissions
- User management
- System configuration

---

## 📝 Production Checklist

### Backend Setup

- [ ] Set environment variables:
  ```bash
  # .env file
  MONGO_URI=mongodb://localhost:27017/skillchain
  JWT_SECRET=your-secure-random-secret-key
  JWT_ALGORITHM=HS256
  ACCESS_TOKEN_EXPIRE_MINUTES=30
  REFRESH_TOKEN_EXPIRE_DAYS=7
  GEMINI_API_KEY=your-gemini-api-key
  ```

- [ ] Clear all seeded data from database
- [ ] Create first admin user manually
- [ ] Verify authentication endpoints work
- [ ] Test user registration flow

### Frontend Setup

- [ ] Update API base URL if needed (in `frontend/lib/api.ts`)
- [ ] Verify registration page works
- [ ] Test login/logout flow
- [ ] Verify all 3 dashboards load correctly

### Security

- [ ] Change default JWT secret
- [ ] Enable CORS properly for production domain
- [ ] Set secure cookie flags
- [ ] Enable HTTPS
- [ ] Add rate limiting (recommended)

---

## 🚀 Getting Started with Clean Database

### Step 1: Clear Database
```bash
# In MongoDB shell
use skillchain
db.dropDatabase()
```

### Step 2: Start Backend
```bash
cd backend
python app.py
```

### Step 3: Start Frontend
```bash
cd frontend
npm run dev
```

### Step 4: Create First Users

**Create Admin/Educator:**
1. Go to `http://localhost:3000/register`
2. Register as "Educator"
3. Manually update role to "admin" in MongoDB
4. Login and start creating challenges

**Create Employer:**
1. Register as "Employer"
2. Login and start posting jobs

**Create Learner:**
1. Register as "Learner" (Developer)
2. Login and start taking assessments

---

## 📊 Data Verification

### Check User Count
```javascript
db.users.countDocuments()
```

### Check Profiles
```javascript
db.user_profiles.countDocuments()
```

### Check Challenges
```javascript
db.challenges.countDocuments()
```

### Check Job Postings
```javascript
db.job_postings.countDocuments()
```

### Check Assessments
```javascript
db.skill_assessments.countDocuments()
```

---

## 🔧 Troubleshooting

### Problem: No challenges available for learners
**Solution:** Login as educator/admin and create challenges via `/admin/challenges/create`

### Problem: No jobs available for learners
**Solution:** Login as employer and create jobs via `/admin/job-postings/create`

### Problem: Can't access admin features
**Solution:** Manually update user role in database:
```javascript
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin", permissions: ["all"] } }
)
```

### Problem: Dashboard shows no data
**Solution:**
1. Check if user has correct `user_type` field
2. Verify profile was auto-created during registration
3. Check browser console for API errors

---

## 📈 Recommended Initial Setup

For a production-ready application with some initial content:

1. **Create 1-2 Admin/Educator accounts**
   - Create 10-15 challenges across different difficulties
   - Cover major skill categories (JavaScript, Python, React, etc.)

2. **Create 1-2 Employer accounts**
   - Create 5-10 job postings
   - Use realistic job descriptions and requirements

3. **Let learners register organically**
   - They will take assessments
   - Earn skill credentials
   - Apply for jobs

---

## 🎓 Sample Challenge Ideas (Create via UI)

**Beginner:**
- "JavaScript Basics: Variables and Data Types"
- "Python Fundamentals: Lists and Loops"
- "HTML/CSS: Build a Landing Page"

**Intermediate:**
- "React: Build a Todo App"
- "Node.js: Create a REST API"
- "SQL: Database Queries"

**Advanced:**
- "Full Stack: E-commerce Platform"
- "System Design: Social Media Feed"
- "Algorithm: Optimize Search Function"

---

## 💡 Best Practices

1. **Never commit seed scripts with production credentials**
2. **Use environment variables for all secrets**
3. **Regularly backup MongoDB database**
4. **Monitor authentication logs via audit_logs collection**
5. **Implement rate limiting for registration/login**
6. **Use strong password requirements (already implemented)**
7. **Regularly update dependencies**
8. **Enable MongoDB authentication in production**

---

## 🔒 Production Security Checklist

- [ ] Change default JWT secret to strong random string
- [ ] Enable MongoDB authentication
- [ ] Use HTTPS for all API requests
- [ ] Set secure cookie flags (httpOnly, secure, sameSite)
- [ ] Implement CORS whitelist (not `*`)
- [ ] Add rate limiting middleware
- [ ] Validate all user inputs
- [ ] Sanitize database queries
- [ ] Enable audit logging
- [ ] Regular security updates
- [ ] Use environment variables (never hardcode secrets)

---

## 📞 Support

For questions or issues:
1. Check this guide first
2. Review error logs in backend console
3. Check browser console for frontend errors
4. Verify MongoDB connection
5. Ensure all environment variables are set

---

**SkillChain is now configured for production with real, dynamic user data!** 🎉
