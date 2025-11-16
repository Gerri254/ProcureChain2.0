# ProcureChain Backend - Quick Start Guide

Get the ProcureChain backend running in 5 minutes!

## Prerequisites

- Python 3.9+
- MongoDB (local or Atlas)
- Gemini API key

## Quick Setup

### 1. Install Dependencies

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
MONGODB_URI=mongodb://localhost:27017/
GEMINI_API_KEY=your-gemini-api-key-here
SECRET_KEY=your-random-secret-key
JWT_SECRET=your-random-jwt-secret
```

### 3. Setup Database

```bash
python scripts/setup_db.py
```

**Default Admin Account:**
- Email: `admin@procurechain.local`
- Password: `Admin@123`

### 4. Run the Server

```bash
python app.py
```

Server runs at: `http://localhost:5000`

## Test the API

### Check Health
```bash
curl http://localhost:5000/health
```

### Login as Admin
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@procurechain.local",
    "password": "Admin@123"
  }'
```

Save the `access_token` from the response.

### Create a Procurement
```bash
curl -X POST http://localhost:5000/api/procurement \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Procurement",
    "category": "supplies",
    "estimated_value": 100000,
    "description": "Test procurement item"
  }'
```

### View Public Procurements
```bash
curl http://localhost:5000/api/procurement/public
```

## Next Steps

1. **Change Admin Password** - Update the default admin password immediately
2. **Explore API** - Check [README.md](README.md) for full API documentation
3. **Upload Documents** - Test document upload and AI analysis
4. **Run Anomaly Detection** - Analyze procurements for anomalies

## Troubleshooting

**MongoDB Connection Error?**
- Ensure MongoDB is running: `sudo systemctl status mongod`
- Check connection string in `.env`

**Gemini API Error?**
- Verify API key is valid
- Check internet connectivity
- Ensure you have API quota available

**Import Errors?**
- Reinstall dependencies: `pip install -r requirements.txt`
- Check Python version: `python --version` (should be 3.9+)

## File Structure

```
backend/
├── app.py              # Start here - main application
├── config/             # Configuration
├── routes/             # API endpoints
├── services/           # Business logic
├── models/             # Data models
├── utils/              # Helper functions
├── middleware/         # Auth & middleware
├── scripts/            # Database setup
└── README.md           # Full documentation
```

## API Endpoints Quick Reference

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/health` | GET | Health check | No |
| `/api/auth/login` | POST | Login | No |
| `/api/auth/register` | POST | Register | No |
| `/api/procurement/public` | GET | Public procurements | No |
| `/api/procurement` | GET/POST | Manage procurements | Yes |
| `/api/documents/upload` | POST | Upload document | Yes |
| `/api/analysis/anomaly/<id>` | POST | Analyze procurement | Yes |
| `/api/vendors` | GET/POST | Manage vendors | Yes |

## Environment Variables

**Required:**
- `MONGODB_URI` - MongoDB connection string
- `GEMINI_API_KEY` - Gemini AI API key
- `SECRET_KEY` - Flask secret key
- `JWT_SECRET` - JWT signing secret

**Optional:**
- `FLASK_ENV` - development/production (default: development)
- `DEBUG` - True/False (default: True)
- `MAX_FILE_SIZE` - Max upload size in bytes (default: 10MB)
- `CORS_ORIGINS` - Comma-separated allowed origins

## Development Tips

1. **Auto-reload:** Flask auto-reloads in debug mode when you change files
2. **MongoDB GUI:** Use MongoDB Compass to visualize your data
3. **API Testing:** Use Postman or Thunder Client for API testing
4. **Logs:** Check console output for errors and debug info

## Production Deployment

```bash
# Install production server
pip install gunicorn

# Set production environment
export FLASK_ENV=production
export DEBUG=False

# Run with gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## Get Help

- Read full docs: [README.md](README.md)
- Check design doc: [../DESIGN_README.md](../DESIGN_README.md)
- Review code comments for detailed explanations

---

Happy coding! 🚀
