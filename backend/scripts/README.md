# Backend Scripts

This directory contains utility scripts for SkillChain backend operations.

## 🚨 Production vs Development

### Production Mode (Recommended)
**Use real, dynamic user data only. No seeding required.**

All data is created through the UI:
- Users register via `/register`
- Educators create challenges via `/admin/challenges/create`
- Employers post jobs via `/admin/job-postings/create`
- Learners take assessments and earn credentials

See [PRODUCTION_SETUP.md](../../PRODUCTION_SETUP.md) in the root directory for full instructions.

---

## Available Scripts

### `clear_database.py` - Clear All Data
**⚠️  USE WITH CAUTION - Deletes all data!**

Removes all documents from all collections to prepare for production use.

```bash
cd backend
python scripts/clear_database.py
```

**What it does:**
- Deletes all users
- Deletes all profiles
- Deletes all challenges
- Deletes all assessments
- Deletes all job postings
- Deletes all audit logs

**When to use:**
- Transitioning from development to production
- Removing all seeded/test data
- Starting fresh with a clean database

---

### `seed_users.py` - Create Test Users (DEVELOPMENT ONLY)
**⚠️  NOT RECOMMENDED FOR PRODUCTION**

Creates sample users for development and testing.

```bash
cd backend
python scripts/seed_users.py
```

**Creates:**
- 5 Learners (sarah.chen@example.com, etc.)
- 2 Employers (hr@techcorp.com, etc.)
- 1 Educator (instructor@codeacademy.com)

All passwords: `password123`

**Login Credentials:**
- Learner: `sarah.chen@example.com` / `password123`
- Employer: `hr@techcorp.com` / `password123`
- Educator: `instructor@codeacademy.com` / `password123`

**When to use:**
- Local development
- Testing features
- Demo presentations

---

### `seed_challenges.py` - Create Sample Challenges (DEVELOPMENT ONLY)
**⚠️  NOT RECOMMENDED FOR PRODUCTION**

Creates sample coding challenges for testing.

```bash
cd backend
python scripts/seed_challenges.py
```

**Creates:**
- JavaScript challenges (beginner to advanced)
- Python challenges
- React challenges
- Database challenges
- System design challenges

**When to use:**
- Local development
- Testing assessment flow
- Demo presentations

---

## Recommended Workflow

### For Production

1. **Clear the database:**
   ```bash
   python scripts/clear_database.py
   ```

2. **Start the backend:**
   ```bash
   python app.py
   ```

3. **Register real users via the UI:**
   - Go to `http://localhost:3000/register`
   - Create educator accounts to manage challenges
   - Create employer accounts to post jobs
   - Let learners register organically

4. **Create first admin:**
   ```javascript
   // In MongoDB shell
   db.users.updateOne(
     { email: "your@email.com" },
     { $set: { role: "admin", permissions: ["all"] } }
   )
   ```

---

### For Development/Testing

1. **Seed test data:**
   ```bash
   python scripts/seed_users.py
   python scripts/seed_challenges.py
   ```

2. **Start the backend:**
   ```bash
   python app.py
   ```

3. **Login with test accounts:**
   - Learner: `sarah.chen@example.com` / `password123`
   - Employer: `hr@techcorp.com` / `password123`
   - Educator: `instructor@codeacademy.com` / `password123`

---

## Best Practices

### ✅ DO:
- Use `clear_database.py` when moving to production
- Create real content through the UI
- Use seed scripts only for development
- Keep seed scripts in version control for team development
- Document any new utility scripts

### ❌ DON'T:
- Run seed scripts in production
- Commit production database dumps
- Share seeded user credentials
- Use weak passwords in production
- Skip database backups before clearing

---

## Creating New Utility Scripts

When creating new scripts, follow these guidelines:

1. **Add documentation** at the top explaining what it does
2. **Add confirmation prompts** for destructive operations
3. **Handle errors gracefully** with try/except blocks
4. **Print clear status messages** for user feedback
5. **Update this README** to document the new script

---

## Security Notes

- **Never** use seeded credentials in production
- **Always** use environment variables for secrets
- **Regularly** update seed scripts if user model changes
- **Test** seed scripts in isolated environment first
- **Backup** database before running clear_database.py

---

## Troubleshooting

### "ModuleNotFoundError: No module named 'config'"
Run scripts from the `backend` directory:
```bash
cd backend
python scripts/script_name.py
```

### "Connection refused" or database errors
Ensure MongoDB is running:
```bash
# Check MongoDB status
sudo systemctl status mongod

# Start MongoDB if needed
sudo systemctl start mongod
```

### Seed script creates duplicate users
Clear database first:
```bash
python scripts/clear_database.py
```

---

For full production setup instructions, see:
- [PRODUCTION_SETUP.md](../../PRODUCTION_SETUP.md) in root directory
- [QUICK_START.md](../../QUICK_START.md) for initial setup
