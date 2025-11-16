# ProcureChain Backend API

Flask-based REST API for the ProcureChain procurement transparency platform, featuring Gemini AI-powered document analysis and anomaly detection.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Setup](#database-setup)
- [Testing](#testing)
- [Deployment](#deployment)

## Features

✅ **Core Functionality**
- RESTful API with Flask
- MongoDB integration with GridFS for file storage
- JWT-based authentication and authorization
- Role-based access control (RBAC)
- Comprehensive audit logging

✅ **AI-Powered Features**
- Gemini AI document parsing and information extraction
- Automated anomaly detection with risk scoring
- Vendor pattern analysis
- Contract comparison and analysis

✅ **Security**
- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Secure file upload handling

## Tech Stack

- **Framework:** Flask 3.0.0
- **Database:** MongoDB (with PyMongo 4.6.0)
- **AI:** Google Gemini AI (google-generativeai 0.3.2)
- **Authentication:** PyJWT 2.8.0 + bcrypt 4.1.0
- **File Storage:** GridFS (MongoDB)
- **Python:** 3.9+

## Project Structure

```
backend/
├── app.py                      # Main Flask application
├── config/
│   ├── __init__.py
│   ├── database.py             # MongoDB connection
│   └── settings.py             # Environment configuration
├── routes/
│   ├── __init__.py
│   ├── procurement.py          # Procurement endpoints
│   ├── documents.py            # Document upload/retrieval
│   ├── analysis.py             # AI analysis endpoints
│   ├── vendors.py              # Vendor management
│   └── auth.py                 # Authentication
├── services/
│   ├── __init__.py
│   ├── gemini_service.py       # Gemini AI integration
│   ├── procurement_service.py  # Procurement business logic
│   ├── document_service.py     # Document management
│   ├── anomaly_service.py      # Anomaly detection
│   ├── vendor_service.py       # Vendor operations
│   └── audit_service.py        # Audit logging
├── models/
│   ├── __init__.py
│   ├── procurement.py          # Procurement data model
│   ├── vendor.py               # Vendor data model
│   ├── user.py                 # User data model
│   └── anomaly.py              # Anomaly data model
├── utils/
│   ├── __init__.py
│   ├── db_helpers.py           # Database utilities
│   ├── validators.py           # Input validation
│   └── response.py             # API response helpers
├── middleware/
│   ├── __init__.py
│   └── auth.py                 # Authentication middleware
├── scripts/
│   └── setup_db.py             # Database setup script
├── tests/                      # Test files
├── requirements.txt            # Python dependencies
├── .env.example                # Environment variables template
├── .gitignore
└── README.md
```

## Installation

### Prerequisites

- Python 3.9 or higher
- MongoDB (local installation or MongoDB Atlas account)
- Gemini API key (get from [Google AI Studio](https://makersuite.google.com/app/apikey))

### Setup Steps

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:
   ```env
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/
   # Or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/

   MONGODB_DB=procurechain

   # Gemini AI
   GEMINI_API_KEY=your-actual-gemini-api-key

   # JWT Secrets (generate secure random strings)
   SECRET_KEY=your-secure-secret-key
   JWT_SECRET=your-secure-jwt-secret
   ```

5. **Set up database**
   ```bash
   python scripts/setup_db.py
   ```

   This will:
   - Create all necessary MongoDB indexes
   - Set up TTL (Time To Live) indexes for automatic cleanup
   - Create an initial admin user:
     - Email: `admin@procurechain.local`
     - Password: `Admin@123` (⚠️ Change immediately!)

## Configuration

### Environment Variables

All configuration is done through environment variables. See [`.env.example`](.env.example) for all available options.

**Key Variables:**

| Variable | Description | Default |
|----------|-------------|---------|
| `FLASK_ENV` | Environment (development/production) | development |
| `DEBUG` | Enable debug mode | True |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/ |
| `GEMINI_API_KEY` | Gemini AI API key | Required |
| `JWT_SECRET` | Secret for JWT signing | Required |
| `MAX_FILE_SIZE` | Max file upload size (bytes) | 10485760 (10MB) |
| `CORS_ORIGINS` | Allowed CORS origins | http://localhost:3000 |

## Running the Application

### Development Mode

```bash
# Activate virtual environment
source venv/bin/activate

# Run Flask development server
python app.py
```

Server will start at `http://localhost:5000`

### Production Mode

```bash
# Set production environment
export FLASK_ENV=production
export DEBUG=False

# Use a production WSGI server (gunicorn)
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## API Documentation

### Base URL
```
http://localhost:5000
```

### Authentication

Most endpoints require a JWT token. Include it in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

### Endpoints Overview

#### Public Endpoints (No Auth Required)

- `GET /` - API info
- `GET /health` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/procurement/public` - Public procurement list
- `GET /api/procurement/public/<id>` - Public procurement details
- `GET /api/vendors/public` - Public vendor list

#### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/me` | Get current user info |
| PUT | `/api/auth/me` | Update current user |

#### Procurement Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/procurement` | List all procurements | Authenticated |
| GET | `/api/procurement/<id>` | Get procurement details | Authenticated |
| POST | `/api/procurement` | Create procurement | Admin, Officer |
| PUT | `/api/procurement/<id>` | Update procurement | Admin, Officer |
| DELETE | `/api/procurement/<id>` | Delete procurement | Admin |
| GET | `/api/procurement/statistics` | Get statistics | Authenticated |

#### Document Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/api/documents/upload` | Upload document | Admin, Officer |
| GET | `/api/documents/<id>` | Get document metadata | Authenticated |
| GET | `/api/documents/<id>/download` | Download document | Authenticated |
| DELETE | `/api/documents/<id>` | Delete document | Admin, Officer |
| GET | `/api/documents/procurement/<id>` | Get procurement documents | Authenticated |
| GET | `/api/documents/<id>/parse` | Get AI-parsed data | Authenticated |

#### Analysis Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/api/analysis/anomaly/<id>` | Analyze procurement | Admin, Officer, Auditor |
| GET | `/api/analysis/anomalies` | List all anomalies | Authenticated |
| GET | `/api/analysis/anomalies/<id>` | Get anomaly details | Authenticated |
| PATCH | `/api/analysis/anomalies/<id>/resolve` | Resolve anomaly | Admin, Auditor |
| GET | `/api/analysis/anomalies/high-risk` | Get high-risk anomalies | Authenticated |
| POST | `/api/analysis/vendor/<id>/patterns` | Analyze vendor patterns | Admin, Auditor |

#### Vendor Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/vendors` | List vendors | Authenticated |
| GET | `/api/vendors/<id>` | Get vendor details | Authenticated |
| POST | `/api/vendors` | Create vendor | Admin, Officer |
| PUT | `/api/vendors/<id>` | Update vendor | Admin, Officer |
| DELETE | `/api/vendors/<id>` | Delete vendor | Admin |
| GET | `/api/vendors/top` | Get top vendors | Authenticated |

### Example Requests

#### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "full_name": "John Doe"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

#### Upload Document
```bash
curl -X POST http://localhost:5000/api/documents/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@document.pdf" \
  -F "procurement_id=64abc123def456789"
```

#### Create Procurement
```bash
curl -X POST http://localhost:5000/api/procurement \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Road Construction Project",
    "category": "infrastructure",
    "estimated_value": 5000000,
    "currency": "KES",
    "description": "Construction of 10km rural road"
  }'
```

## Database Setup

### MongoDB Collections

The system uses the following collections:

1. **procurement_records** - Procurement tenders and contracts
2. **vendors** - Registered vendor information
3. **anomaly_flags** - Detected anomalies and risk flags
4. **audit_logs** - Comprehensive system audit trail (2-year TTL)
5. **users** - User accounts and authentication
6. **documents.files** - GridFS file metadata
7. **documents.chunks** - GridFS file chunks
8. **sessions** - User sessions (auto-expire)
9. **analytics_cache** - Cached analytics results (auto-expire)
10. **rate_limits** - Rate limiting data (1-hour TTL)

### Indexes

All necessary indexes are created automatically by running:

```bash
python scripts/setup_db.py
```

Key indexes include:
- Text search on procurement titles and descriptions
- Unique constraints on tender numbers and vendor registration numbers
- Compound indexes for efficient queries
- TTL indexes for automatic data cleanup

## Testing

### Running Tests

```bash
# Install test dependencies
pip install pytest pytest-flask

# Run all tests
pytest

# Run with coverage
pytest --cov=.

# Run specific test file
pytest tests/test_procurement_service.py
```

### Test Structure

```
tests/
├── test_procurement_service.py
├── test_vendor_service.py
├── test_gemini_service.py
├── test_api.py
└── test_integration.py
```

## Deployment

### Using Docker

Create a `Dockerfile`:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

Build and run:

```bash
docker build -t procurechain-backend .
docker run -p 5000:5000 --env-file .env procurechain-backend
```

### Environment-Specific Considerations

#### Production Checklist

- [ ] Set `FLASK_ENV=production`
- [ ] Set `DEBUG=False`
- [ ] Use strong, random `SECRET_KEY` and `JWT_SECRET`
- [ ] Configure MongoDB Atlas with proper security
- [ ] Set up proper CORS origins
- [ ] Use HTTPS in production
- [ ] Set up monitoring and logging
- [ ] Configure backups for MongoDB
- [ ] Change default admin password
- [ ] Set appropriate file size limits
- [ ] Configure rate limiting if needed

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "errors": { ... }  // Optional field-specific errors
}
```

## Security Features

1. **Authentication:** JWT-based with access and refresh tokens
2. **Password Hashing:** bcrypt with salt
3. **Input Validation:** Comprehensive validation and sanitization
4. **CORS:** Configurable allowed origins
5. **File Upload:** Type and size validation
6. **Audit Logging:** All actions logged with user context
7. **Role-Based Access:** Fine-grained permission control

## Troubleshooting

### Common Issues

**MongoDB Connection Failed**
```bash
# Check MongoDB is running
sudo systemctl status mongod

# For MongoDB Atlas, verify connection string
```

**Gemini API Errors**
```bash
# Verify API key is correct
# Check API quota/limits
# Ensure internet connectivity
```

**Import Errors**
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

## Support

For issues and questions:
- Review the [Design Document](../DESIGN_README.md)
- Check MongoDB connection settings
- Verify Gemini API key validity
- Ensure all environment variables are set

## License

This project is part of a university research project at Kabarak University.

**Project Lead:** Thuku Evanson Muchamo
**Supervisor:** Ms. Daisy Ondwari
**Institution:** Kabarak University - Department of Computer Science

---

**Status:** Development Phase
**Version:** 1.0.0
**Last Updated:** November 2025
