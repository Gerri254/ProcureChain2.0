# ProcureChain Design Document

## Project Overview

**ProcureChain** is a web-based procurement monitoring platform designed to enhance transparency and accountability in public procurement for Kenyan county governments. The system leverages Gemini AI for intelligent document parsing and anomaly detection, providing real-time monitoring and public oversight capabilities.

### Key Objectives
- Enhance transparency in county government procurement processes
- Enable real-time monitoring and anomaly detection using AI
- Provide public access to procurement data through an intuitive dashboard
- Detect and flag suspicious procurement patterns automatically

---

## Technology Stack

### Frontend
- **Next.js 14+** with TypeScript - Full-stack React framework with server-side rendering
- **Tailwind CSS** - Responsive UI design
- **Chart.js / D3.js** - Data visualization for dashboards
- **Axios** - HTTP client for API communication

### Backend
- **Flask** - Python web framework for RESTful API endpoints
- **Python** - NLP processing and Gemini AI integration
- **Flask-CORS** - Cross-origin resource sharing
- **PyMongo** - MongoDB driver for Python

### AI & Analytics
- **Gemini AI** - Primary engine for:
  - Document parsing and information extraction
  - Anomaly detection and pattern recognition
  - Natural language understanding of procurement documents
  - Risk scoring and predictive analysis

### Data Management
- **MongoDB** - Primary database for all data storage
  - Procurement records (structured collections)
  - Document metadata and files
  - User data and sessions
  - Audit logs
  - Analytics and caching

### Infrastructure
- **Docker** - Containerization for Flask backend
- **Cloud Platform** (Azure/AWS/Heroku) - Deployment with security and scalability
- **Vercel** - Next.js frontend hosting
- **MongoDB Atlas** - Managed database service

---

## System Architecture

### Layered Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                      │
│  - Public Dashboard (Next.js)                            │
│  - Admin Interface (Role-based access)                   │
│  - Server-Side Rendering (SSR)                           │
│  - Mobile-responsive design                              │
└─────────────────────────────────────────────────────────┘
                          ↓
                     HTTP/REST API
                          ↓
┌─────────────────────────────────────────────────────────┐
│              FLASK BACKEND API LAYER                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Gemini AI Integration Module              │  │
│  │  - Document parsing & extraction                  │  │
│  │  - Anomaly detection engine                       │  │
│  │  - Risk scoring algorithms                        │  │
│  │  - Pattern recognition                            │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │              NLP Processing                       │  │
│  │  - Named Entity Recognition                       │  │
│  │  - Keyword extraction                             │  │
│  │  - Document classification                        │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Audit & Feedback System                 │  │
│  │  - Comprehensive audit logging                    │  │
│  │  - Public feedback mechanism                      │  │
│  │  - Stakeholder engagement tools                   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                DATA PERSISTENCE LAYER                    │
│                     MongoDB Database                     │
│  - Procurement records (collections)                     │
│  - Document metadata & files                             │
│  - User data & sessions                                  │
│  - Audit logs & analytics                                │
└─────────────────────────────────────────────────────────┘
```

---

## Core Features

### 1. Intelligent Document Processing
**Powered by Gemini AI**

- **Automatic Document Upload**: Accept PDF, Word, and scanned images
- **Information Extraction**:
  - Vendor/supplier details
  - Bid amounts and pricing
  - Contract terms and conditions
  - Evaluation scores
  - Timeline and milestones
- **Document Classification**: Automatically categorize tenders, RFQs, contracts, etc.
- **Entity Recognition**: Identify key stakeholders, companies, and officials

**Technical Implementation:**
```python
# Gemini AI Integration Pattern
from google.generativeai import GenerativeModel

model = GenerativeModel('gemini-1.5-pro')

def parse_procurement_document(document_path):
    """
    Extract structured data from procurement documents
    """
    prompt = """
    Analyze this procurement document and extract:
    1. Vendor names and registration numbers
    2. Bid amounts and currency
    3. Contract duration and terms
    4. Evaluation criteria and scores
    5. Key dates and deadlines
    
    Return as structured JSON.
    """
    
    response = model.generate_content([
        prompt,
        {"mime_type": "application/pdf", "data": document_data}
    ])
    
    return parse_json_response(response.text)
```

### 2. Anomaly Detection System

**AI-Powered Pattern Recognition**

Gemini AI analyzes procurement data to identify:
- **Price Anomalies**: Unusual bid amounts compared to market rates
- **Vendor Patterns**: Repeated awards to single suppliers
- **Frequency Anomalies**: Procurement outside normal patterns
- **Document Inconsistencies**: Mismatched information across documents
- **Compliance Issues**: Violations of procurement regulations

**Risk Scoring Algorithm:**
```
Risk Score = Weighted Sum of:
  - Price deviation score (30%)
  - Vendor concentration score (25%)
  - Timeline irregularity score (20%)
  - Document completeness score (15%)
  - Historical pattern score (10%)
```

**Technical Implementation:**
```python
def detect_anomalies(procurement_record):
    """
    Use Gemini AI to identify suspicious patterns
    """
    prompt = f"""
    Analyze this procurement record for anomalies:
    {json.dumps(procurement_record)}
    
    Consider:
    - Historical pricing data
    - Vendor award patterns
    - Timeline compliance
    - Market benchmarks
    
    Provide:
    1. Risk score (0-100)
    2. Anomaly flags
    3. Detailed reasoning
    """
    
    response = model.generate_content(prompt)
    return parse_risk_assessment(response.text)
```

### 3. Public Transparency Dashboard

**Real-time Procurement Insights**

- **Procurement Overview**: Total spending, active tenders, completed contracts
- **Vendor Analytics**: Top suppliers, contract distribution, performance metrics
- **Anomaly Alerts**: Flagged transactions with risk scores
- **Search & Filter**: Advanced search across all procurement records
- **Visual Analytics**: Charts, graphs, and trend analysis
- **Mobile-First Design**: Accessible on all devices

**Dashboard Components:**
- Spending heatmap by category
- Timeline view of procurement activities
- Risk distribution charts
- Vendor network visualization
- Public feedback interface

### 4. Comprehensive Audit Trail

**Secure Event Logging**

Every system action is logged with:
- Timestamp (ISO 8601 format)
- User identification (role-based)
- Action type (create, update, view, flag)
- Data changes (before/after states)
- IP address and session info

**Audit Log Structure:**
```json
{
  "event_id": "uuid",
  "timestamp": "2025-11-16T10:30:00Z",
  "user": {
    "id": "user_123",
    "role": "procurement_officer",
    "department": "finance"
  },
  "action": "document_upload",
  "resource": {
    "type": "tender",
    "id": "tender_456",
    "name": "Road Construction RFQ"
  },
  "changes": {
    "status": ["draft", "published"],
    "amount": [0, 5000000]
  },
  "metadata": {
    "ip_address": "192.168.1.100",
    "session_id": "session_789"
  }
}
```

---

## Flask Backend API Structure

### Application Setup
```python
# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import google.generativeai as genai
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js frontend

# MongoDB connection
mongo_client = MongoClient(os.environ.get('MONGODB_URI'))
db = mongo_client['procurechain']

# Gemini AI configuration
genai.configure(api_key=os.environ.get('GEMINI_API_KEY'))

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'ProcureChain API'})

if __name__ == '__main__':
    app.run(debug=True)
```

### File Upload Endpoint
```python
# routes/documents.py
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from gridfs import GridFS
from bson import ObjectId
import io

documents_bp = Blueprint('documents', __name__)
fs = GridFS(db)

@documents_bp.route('/upload', methods=['POST'])
def upload_document():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    filename = secure_filename(file.filename)
    
    # Store in GridFS
    file_id = fs.put(
        file.read(),
        filename=filename,
        content_type=file.content_type
    )
    
    # Process with Gemini AI
    analysis = analyze_with_gemini(file_id)
    
    # Save to procurement_records collection
    record = {
        'file_id': file_id,
        'filename': filename,
        'analysis': analysis,
        'status': 'pending',
        'uploaded_at': datetime.utcnow()
    }
    
    result = db.procurement_records.insert_one(record)
    
    return jsonify({
        'success': True,
        'document_id': str(result.inserted_id),
        'analysis': analysis
    }), 201
```

### Anomaly Detection Endpoint
```python
# routes/analysis.py
from flask import Blueprint, jsonify, request
from services.gemini_service import detect_anomalies

analysis_bp = Blueprint('analysis', __name__)

@analysis_bp.route('/anomaly/<document_id>', methods=['POST'])
def analyze_anomalies(document_id):
    # Get procurement record
    record = db.procurement_records.find_one({'_id': ObjectId(document_id)})
    
    if not record:
        return jsonify({'error': 'Document not found'}), 404
    
    # Get historical data for comparison
    historical_data = list(db.procurement_records.find({
        'category': record.get('category'),
        'status': 'completed'
    }).limit(100))
    
    # Run Gemini AI anomaly detection
    anomaly_result = detect_anomalies(record, historical_data)
    
    # Store anomaly flags if any
    if anomaly_result['risk_score'] > 50:
        db.anomaly_flags.insert_one({
            'procurement_id': ObjectId(document_id),
            'risk_score': anomaly_result['risk_score'],
            'flags': anomaly_result['flags'],
            'reasoning': anomaly_result['reasoning'],
            'created_at': datetime.utcnow()
        })
    
    return jsonify(anomaly_result), 200
```

### Procurement Records Endpoint
```python
# routes/procurement.py
from flask import Blueprint, jsonify, request

procurement_bp = Blueprint('procurement', __name__)

@procurement_bp.route('/public', methods=['GET'])
def get_public_records():
    # Get query parameters
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 20))
    skip = (page - 1) * limit
    
    # Query MongoDB
    records = list(db.procurement_records.find(
        {'status': 'published'},
        {'_id': 1, 'title': 1, 'estimated_value': 1, 'published_date': 1}
    ).sort('published_date', -1).skip(skip).limit(limit))
    
    # Convert ObjectId to string
    for record in records:
        record['_id'] = str(record['_id'])
    
    total = db.procurement_records.count_documents({'status': 'published'})
    
    return jsonify({
        'records': records,
        'total': total,
        'page': page,
        'pages': (total + limit - 1) // limit
    }), 200
```

### Authentication Middleware
```python
# middleware/auth.py
from functools import wraps
from flask import request, jsonify
import jwt

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            token = token.split(' ')[1]  # Remove 'Bearer ' prefix
            data = jwt.decode(token, os.environ.get('JWT_SECRET'), algorithms=['HS256'])
            request.user = data
        except:
            return jsonify({'error': 'Token is invalid'}), 401
        
        return f(*args, **kwargs)
    
    return decorated

# Usage
@app.route('/admin/dashboard', methods=['GET'])
@token_required
def admin_dashboard():
    return jsonify({'user': request.user})
```

---

## Next.js Frontend Features

### Server-Side Rendering (SSR)
- **Public Dashboard**: Pre-rendered for SEO and fast initial load
- **Dynamic Routes**: `/procurement/[id]` for individual tender pages
- **Metadata API**: Automatic SEO optimization

### API Integration
```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function uploadDocument(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_URL}/documents/upload`, {
    method: 'POST',
    body: formData,
  });
  
  return response.json();
}

export async function getProcurementRecords(page = 1) {
  const response = await fetch(`${API_URL}/procurement/public?page=${page}`);
  return response.json();
}
```

### Client Components for Interactivity
```typescript
// components/DocumentUpload.tsx
'use client'

import { useState } from 'react';
import { uploadDocument } from '@/lib/api';

export default function DocumentUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    
    setLoading(true);
    try {
      const result = await uploadDocument(file);
      alert('Document uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="file" 
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        accept=".pdf,.docx"
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Uploading...' : 'Upload'}
      </button>
    </form>
  );
}
```

---

## MongoDB Integration with Flask

### Connection Management
```python
# config/database.py
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import os

class Database:
    _instance = None
    _client = None
    _db = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Database, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        try:
            self._client = MongoClient(
                os.environ.get('MONGODB_URI'),
                maxPoolSize=10,
                minPoolSize=5,
                serverSelectionTimeoutMS=5000
            )
            # Test connection
            self._client.admin.command('ping')
            self._db = self._client['procurechain']
            print("MongoDB connection successful")
        except ConnectionFailure as e:
            print(f"MongoDB connection failed: {e}")
            raise
    
    @property
    def db(self):
        return self._db
    
    @property
    def client(self):
        return self._client

# Usage
db_instance = Database()
db = db_instance.db
```

### Database Helper Functions
```python
# utils/db_helpers.py
from config.database import db
from bson import ObjectId
from datetime import datetime

def get_procurement_collection():
    return db['procurement_records']

def get_vendors_collection():
    return db['vendors']

def serialize_document(doc):
    """Convert MongoDB document to JSON-serializable format"""
    if doc is None:
        return None
    
    if isinstance(doc, list):
        return [serialize_document(d) for d in doc]
    
    if '_id' in doc:
        doc['_id'] = str(doc['_id'])
    
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            doc[key] = str(value)
        elif isinstance(value, datetime):
            doc[key] = value.isoformat()
    
    return doc
```

### Example CRUD Operations
```python
# services/procurement_service.py
from utils.db_helpers import get_procurement_collection, serialize_document
from bson import ObjectId
from datetime import datetime

def create_procurement(data):
    """Create new procurement record"""
    collection = get_procurement_collection()
    
    record = {
        **data,
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    }
    
    result = collection.insert_one(record)
    return str(result.inserted_id)

def get_procurement_by_id(procurement_id):
    """Get procurement record by ID"""
    collection = get_procurement_collection()
    
    record = collection.find_one({'_id': ObjectId(procurement_id)})
    return serialize_document(record)

def update_procurement(procurement_id, data):
    """Update procurement record"""
    collection = get_procurement_collection()
    
    result = collection.update_one(
        {'_id': ObjectId(procurement_id)},
        {
            '$set': {
                **data,
                'updated_at': datetime.utcnow()
            }
        }
    )
    
    return result.modified_count > 0

def delete_procurement(procurement_id):
    """Delete procurement record"""
    collection = get_procurement_collection()
    result = collection.delete_one({'_id': ObjectId(procurement_id)})
    return result.deleted_count > 0
```

---

## Data Flow

### Document Upload to Analysis Pipeline (Next.js + Flask + MongoDB)

```
1. User Uploads Document (Next.js Client)
   ↓
2. POST Request to Flask API
   - File format validation
   - Size validation
   - Security checks
   ↓
3. Store in MongoDB GridFS
   - Save file chunks
   - Create metadata document
   ↓
4. Gemini AI Processing (Synchronous)
   - Text extraction
   - Structure analysis
   - Entity recognition
   - Data extraction
   ↓
5. Data Structuring
   - Parse Gemini response
   - Validate extracted data
   - Update MongoDB document
   ↓
6. Anomaly Detection (Immediate)
   - Aggregate historical data from MongoDB
   - Compare with current submission
   - Apply risk scoring via Gemini AI
   - Store flags in anomaly_flags collection
   ↓
7. Return Response to Client
   - Send success status
   - Include extracted data
   - Return risk assessment
   - Client updates dashboard
```

---

## MongoDB Aggregation Pipelines for Analytics

### Procurement Statistics
```javascript
// Get procurement summary by status
const statusSummary = await db.collection('procurement_records').aggregate([
  {
    $group: {
      _id: '$status',
      count: { $sum: 1 },
      total_value: { $sum: '$estimated_value' }
    }
  },
  {
    $sort: { total_value: -1 }
  }
]).toArray();
```

### Top Vendors
```javascript
// Get vendors with most contracts
const topVendors = await db.collection('vendors').aggregate([
  {
    $unwind: '$contract_history'
  },
  {
    $group: {
      _id: '$_id',
      vendor_name: { $first: '$name' },
      total_contracts: { $sum: 1 },
      total_value: { $sum: '$contract_history.amount' }
    }
  },
  {
    $sort: { total_contracts: -1 }
  },
  {
    $limit: 10
  }
]).toArray();
```

### Anomaly Risk Distribution
```javascript
// Analyze anomaly patterns
const riskDistribution = await db.collection('anomaly_flags').aggregate([
  {
    $bucket: {
      groupBy: '$risk_score',
      boundaries: [0, 25, 50, 75, 100],
      default: 'Other',
      output: {
        count: { $sum: 1 },
        avg_score: { $avg: '$risk_score' },
        flags: { $push: '$flag_type' }
      }
    }
  }
]).toArray();
```

### Monthly Spending Trends
```javascript
// Get spending trends over time
const spendingTrends = await db.collection('procurement_records').aggregate([
  {
    $match: {
      status: 'awarded',
      published_date: { 
        $gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
      }
    }
  },
  {
    $group: {
      _id: {
        year: { $year: '$published_date' },
        month: { $month: '$published_date' }
      },
      total_spending: { $sum: '$estimated_value' },
      contract_count: { $sum: 1 }
    }
  },
  {
    $sort: { '_id.year': 1, '_id.month': 1 }
  }
]).toArray();
```

### Vendor Performance Analysis
```javascript
// Analyze vendor win rates and patterns
const vendorAnalysis = await db.collection('procurement_records').aggregate([
  {
    $lookup: {
      from: 'vendors',
      localField: 'awarded_vendor_id',
      foreignField: '_id',
      as: 'vendor_info'
    }
  },
  {
    $unwind: '$vendor_info'
  },
  {
    $group: {
      _id: '$vendor_info._id',
      vendor_name: { $first: '$vendor_info.name' },
      contracts_won: { $sum: 1 },
      total_value: { $sum: '$estimated_value' },
      categories: { $addToSet: '$category' }
    }
  },
  {
    $project: {
      vendor_name: 1,
      contracts_won: 1,
      total_value: 1,
      category_count: { $size: '$categories' },
      avg_contract_value: { $divide: ['$total_value', '$contracts_won'] }
    }
  }
]).toArray();
```

---

## Gemini AI Integration Details

### API Configuration

```python
# Configuration
import google.generativeai as genai

genai.configure(api_key=os.environ.get('GEMINI_API_KEY'))

# Model selection based on task
MODELS = {
    'document_parsing': 'gemini-1.5-pro',      # For complex documents
    'quick_analysis': 'gemini-1.5-flash',      # For fast responses
    'multimodal': 'gemini-1.5-pro'             # For images/PDFs
}
```

### Use Cases

#### 1. Tender Document Analysis
```python
def analyze_tender(tender_pdf):
    model = GenerativeModel('gemini-1.5-pro')
    
    prompt = """
    Extract and analyze this tender document:
    
    Required Information:
    - Project title and description
    - Budget allocation
    - Eligibility criteria
    - Submission deadline
    - Evaluation methodology
    - Required documents
    
    Also identify:
    - Potential compliance issues
    - Missing information
    - Unclear specifications
    """
    
    response = model.generate_content([prompt, tender_pdf])
    return structured_response(response)
```

#### 2. Contract Comparison
```python
def compare_contracts(contract_a, contract_b):
    prompt = f"""
    Compare these two procurement contracts:
    
    Contract A: {contract_a}
    Contract B: {contract_b}
    
    Analyze:
    - Price differences and justification
    - Terms variations
    - Timeline discrepancies
    - Scope changes
    
    Flag any suspicious differences.
    """
    
    return model.generate_content(prompt)
```

#### 3. Historical Pattern Analysis
```python
def analyze_vendor_patterns(vendor_history):
    prompt = f"""
    Analyze this vendor's procurement history:
    {json.dumps(vendor_history)}
    
    Identify:
    - Contract win rate
    - Price consistency
    - Performance trends
    - Relationship patterns with procurement officers
    - Red flags or concerns
    
    Provide risk assessment.
    """
    
    return model.generate_content(prompt)
```

---

## Database Schema (MongoDB)

### Core Collections

#### Procurement Records Collection
```javascript
// Collection: procurement_records
{
    _id: ObjectId,
    tender_number: String,      // Indexed, unique
    title: String,
    description: String,
    category: String,
    estimated_value: Number,
    currency: String,           // Default: 'KES'
    status: String,             // draft, published, awarded, cancelled
    published_date: ISODate,
    deadline: ISODate,
    documents: [{
        file_id: ObjectId,
        file_name: String,
        file_type: String,
        uploaded_at: ISODate
    }],
    created_at: ISODate,
    updated_at: ISODate
}

// Indexes
db.procurement_records.createIndex({ tender_number: 1 }, { unique: true })
db.procurement_records.createIndex({ status: 1 })
db.procurement_records.createIndex({ published_date: -1 })
db.procurement_records.createIndex({ category: 1 })
```

#### Vendors Collection
```javascript
// Collection: vendors
{
    _id: ObjectId,
    name: String,
    registration_number: String,    // Indexed, unique
    tax_compliance_status: String,
    contact: {
        email: String,
        phone: String,
        address: String
    },
    contract_history: [{
        procurement_id: ObjectId,
        amount: Number,
        date_awarded: ISODate,
        status: String
    }],
    created_at: ISODate,
    updated_at: ISODate
}

// Indexes
db.vendors.createIndex({ registration_number: 1 }, { unique: true })
db.vendors.createIndex({ name: 1 })
```

#### Anomaly Flags Collection
```javascript
// Collection: anomaly_flags
{
    _id: ObjectId,
    procurement_id: ObjectId,       // Reference to procurement_records
    flag_type: String,              // price_anomaly, vendor_pattern, etc.
    risk_score: Number,             // 0-100
    description: String,
    ai_reasoning: String,           // Gemini AI explanation
    details: {
        detected_pattern: String,
        expected_value: Mixed,
        actual_value: Mixed,
        deviation_percentage: Number
    },
    status: String,                 // pending, investigating, resolved, false_positive
    flagged_at: ISODate,
    resolved_at: ISODate,
    resolved_by: ObjectId,          // Reference to users
    resolution_notes: String
}

// Indexes
db.anomaly_flags.createIndex({ procurement_id: 1 })
db.anomaly_flags.createIndex({ status: 1 })
db.anomaly_flags.createIndex({ risk_score: -1 })
db.anomaly_flags.createIndex({ flagged_at: -1 })
```

#### Audit Logs Collection
```javascript
// Collection: audit_logs
{
    _id: ObjectId,
    event_type: String,
    user_id: ObjectId,              // Reference to users
    user_role: String,
    resource: {
        type: String,               // procurement, vendor, document, etc.
        id: ObjectId,
        name: String
    },
    action: String,                 // create, update, delete, view, flag
    changes: {
        before: Object,
        after: Object
    },
    metadata: {
        ip_address: String,
        user_agent: String,
        session_id: String
    },
    created_at: ISODate
}

// Indexes
db.audit_logs.createIndex({ created_at: -1 })
db.audit_logs.createIndex({ user_id: 1 })
db.audit_logs.createIndex({ event_type: 1 })
db.audit_logs.createIndex({ "resource.type": 1, "resource.id": 1 })

// TTL Index - Auto-delete logs older than 2 years
db.audit_logs.createIndex({ created_at: 1 }, { expireAfterSeconds: 63072000 })
```

#### Users Collection
```javascript
// Collection: users
{
    _id: ObjectId,
    email: String,                  // Indexed, unique
    password_hash: String,
    full_name: String,
    role: String,                   // admin, procurement_officer, auditor, public
    department: String,
    permissions: [String],
    status: String,                 // active, inactive, suspended
    last_login: ISODate,
    created_at: ISODate,
    updated_at: ISODate
}

// Indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ role: 1 })
```

#### Documents Collection (GridFS)
```javascript
// Collection: documents.files (GridFS)
{
    _id: ObjectId,
    length: Number,
    chunkSize: Number,
    uploadDate: ISODate,
    filename: String,
    metadata: {
        procurement_id: ObjectId,
        document_type: String,      // tender, contract, evaluation, etc.
        uploaded_by: ObjectId,
        gemini_analysis: {
            processed: Boolean,
            extracted_data: Object,
            processing_date: ISODate
        },
        mime_type: String,
        file_size: Number
    }
}

// Collection: documents.chunks (GridFS)
{
    _id: ObjectId,
    files_id: ObjectId,
    n: Number,
    data: BinData
}
```

#### Sessions Collection
```javascript
// Collection: sessions
{
    _id: ObjectId,
    session_id: String,             // Indexed, unique
    user_id: ObjectId,
    ip_address: String,
    user_agent: String,
    data: Object,                   // Session data
    expires_at: ISODate,
    created_at: ISODate
}

// Indexes
db.sessions.createIndex({ session_id: 1 }, { unique: true })
db.sessions.createIndex({ user_id: 1 })
// TTL Index - Auto-delete expired sessions
db.sessions.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 })
```

#### Analytics Cache Collection
```javascript
// Collection: analytics_cache
{
    _id: ObjectId,
    cache_key: String,              // Indexed, unique
    data: Object,
    expires_at: ISODate,
    created_at: ISODate
}

// Indexes
db.analytics_cache.createIndex({ cache_key: 1 }, { unique: true })
// TTL Index - Auto-delete expired cache
db.analytics_cache.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 })
```

---

## Project Structure

### Flask Backend

```
backend/
├── app.py                          # Main Flask application
├── config/
│   ├── __init__.py
│   ├── database.py                 # MongoDB connection
│   └── settings.py                 # Environment config
├── routes/
│   ├── __init__.py
│   ├── procurement.py              # Procurement endpoints
│   ├── documents.py                # Document upload/retrieval
│   ├── analysis.py                 # Gemini AI analysis
│   ├── vendors.py                  # Vendor management
│   └── auth.py                     # Authentication
├── services/
│   ├── __init__.py
│   ├── gemini_service.py           # Gemini AI integration
│   ├── procurement_service.py      # Business logic
│   ├── document_service.py         # Document processing
│   └── anomaly_service.py          # Anomaly detection
├── models/
│   ├── __init__.py
│   ├── procurement.py              # Data models
│   ├── vendor.py
│   └── user.py
├── utils/
│   ├── __init__.py
│   ├── db_helpers.py               # Database utilities
│   ├── validators.py               # Input validation
│   └── serializers.py              # JSON serialization
├── middleware/
│   ├── __init__.py
│   ├── auth.py                     # JWT authentication
│   └── rate_limit.py               # Rate limiting
├── tests/
│   ├── test_procurement.py
│   ├── test_gemini.py
│   └── test_api.py
├── requirements.txt
├── .env
└── README.md
```

### Next.js Frontend

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── procurement/
│   │   │   ├── [id]/page.tsx
│   │   │   └── page.tsx
│   │   ├── vendors/page.tsx
│   │   ├── anomalies/page.tsx
│   │   └── analytics/page.tsx
│   ├── (public)/
│   │   ├── page.tsx                # Public homepage
│   │   └── transparency/page.tsx
│   └── layout.tsx
├── components/
│   ├── ui/                          # UI components
│   ├── dashboard/
│   │   ├── StatCard.tsx
│   │   ├── ProcurementTable.tsx
│   │   └── AnomalyChart.tsx
│   └── forms/
│       └── DocumentUpload.tsx
├── lib/
│   ├── api.ts                       # API client (calls Flask)
│   ├── auth.ts                      # Auth helpers
│   └── utils.ts
├── types/
│   ├── procurement.ts
│   ├── vendor.ts
│   └── anomaly.ts
├── public/
│   └── assets/
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Security Considerations

### Data Protection
- **Encryption at Rest**: AES-256 encryption for database
- **Encryption in Transit**: TLS 1.3 for all communications
- **API Security**: JWT tokens with refresh mechanism
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Sanitize all user inputs

### Access Control
- **Role-Based Access Control (RBAC)**:
  - Public Viewer: Read-only access to published data
  - Procurement Officer: Document upload, workflow management
  - Auditor: Full read access, comment capabilities
  - Administrator: Full system access

### Compliance
- **Kenya Data Protection Act (2019)**: User consent, data minimization
- **Public Procurement and Disposal Act**: Regulatory alignment
- **GDPR Principles**: Privacy by design

---

## API Endpoints (Flask Backend)

### Public Endpoints
```
GET  /api/procurement/public          # List public procurement records
GET  /api/procurement/public/<id>     # Get specific record
GET  /api/analytics/public            # Public statistics
POST /api/feedback                    # Submit public feedback
GET  /api/vendors/public              # List registered vendors
```

### Protected Endpoints (Require JWT Token)
```
POST   /api/documents/upload          # Upload procurement document
GET    /api/documents/<id>            # Get document details
GET    /api/documents/<id>/parse      # Get parsed document data
POST   /api/analysis/anomaly/<id>     # Trigger anomaly detection
GET    /api/anomalies                 # List flagged anomalies
PATCH  /api/anomalies/<id>/resolve    # Resolve anomaly flag
GET    /api/audit-logs                # Retrieve audit logs
PUT    /api/procurement/<id>          # Update procurement record
DELETE /api/procurement/<id>          # Delete procurement record
```

### Authentication Endpoints
```
POST /api/auth/login                  # User login
POST /api/auth/register               # User registration
POST /api/auth/refresh                # Refresh JWT token
POST /api/auth/logout                 # User logout
```

### Gemini AI Integration Endpoint
```
POST /api/ai/analyze

Request Body:
{
  "document_id": "mongodb_objectid",
  "analysis_type": "full|quick|anomaly",
  "context": {
    "historical_data": true,
    "vendor_analysis": true
  }
}

Response:
{
  "success": true,
  "analysis": {
    "extracted_data": {...},
    "risk_score": 45,
    "anomalies": [],
    "recommendations": []
  }
}
```

### Example Flask Route Implementation
```python
# routes/procurement.py
from flask import Blueprint, request, jsonify
from middleware.auth import token_required
from services.procurement_service import get_procurement_by_id, update_procurement

procurement_bp = Blueprint('procurement', __name__)

@procurement_bp.route('/<procurement_id>', methods=['GET'])
def get_procurement(procurement_id):
    record = get_procurement_by_id(procurement_id)
    
    if not record:
        return jsonify({'error': 'Procurement not found'}), 404
    
    return jsonify(record), 200

@procurement_bp.route('/<procurement_id>', methods=['PUT'])
@token_required
def update_procurement_endpoint(procurement_id):
    data = request.get_json()
    
    success = update_procurement(procurement_id, data)
    
    if not success:
        return jsonify({'error': 'Update failed'}), 400
    
    return jsonify({'success': True, 'message': 'Procurement updated'}), 200
```

---

## Performance Optimization

### Caching Strategy
- **MongoDB Caching Collections**: 
  - Create dedicated `cache` collection for frequently accessed data
  - Dashboard statistics (TTL: 5 minutes)
  - Analytics results (TTL: 1 hour)
  - Gemini AI responses for common documents (TTL: 24 hours)
- **Next.js Built-in Caching**:
  - Static page generation for public content
  - Incremental static regeneration (ISR)
  - Image optimization

### Database Optimization
- **Indexes**: On frequently queried fields (tender_number, vendor_id, status, dates)
- **Compound Indexes**: For complex queries (status + date, category + status)
- **Text Indexes**: For full-text search on titles and descriptions
- **Aggregation Pipeline**: Optimize complex analytics queries
- **Connection Pooling**: Maintain optimal MongoDB connection pool (5-10 connections)

### Gemini AI Optimization
- **Response Caching**: Store Gemini AI analysis results in MongoDB to avoid redundant API calls
- **Request Batching**: Process multiple documents in sequence during off-peak hours
- **Rate Limiting**: Implement request throttling to stay within API limits
- **Prompt Optimization**: Use concise prompts to reduce token consumption

---

## Testing Strategy

### Backend Unit Tests (Python/pytest)
```python
# tests/test_procurement_service.py
import pytest
from services.procurement_service import create_procurement, get_procurement_by_id
from bson import ObjectId

def test_create_procurement():
    data = {
        'title': 'Test Tender',
        'estimated_value': 1000000,
        'category': 'infrastructure'
    }
    
    procurement_id = create_procurement(data)
    assert procurement_id is not None
    assert ObjectId.is_valid(procurement_id)

def test_get_procurement_by_id():
    # Create test procurement
    test_id = create_procurement({'title': 'Test'})
    
    # Retrieve it
    record = get_procurement_by_id(test_id)
    assert record is not None
    assert record['title'] == 'Test'
```

### API Integration Tests (Flask test client)
```python
# tests/test_api.py
import pytest
from app import app
import json

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_get_public_procurement(client):
    response = client.get('/api/procurement/public')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'records' in data

def test_upload_document_requires_auth(client):
    response = client.post('/api/documents/upload')
    assert response.status_code == 401  # Unauthorized

def test_gemini_analysis(client):
    # Mock Gemini API response
    with patch('services.gemini_service.analyze_document') as mock_gemini:
        mock_gemini.return_value = {'risk_score': 25}
        
        response = client.post('/api/ai/analyze', 
            json={'document_id': 'test_id'})
        assert response.status_code == 200
```

### Frontend Tests (Jest + React Testing Library)
```typescript
// __tests__/components/DocumentUpload.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import DocumentUpload from '@/components/DocumentUpload';

describe('DocumentUpload Component', () => {
  it('renders upload button', () => {
    render(<DocumentUpload />);
    expect(screen.getByText(/upload/i)).toBeInTheDocument();
  });
  
  it('handles file selection', () => {
    render(<DocumentUpload />);
    const input = screen.getByLabelText(/file/i);
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    
    fireEvent.change(input, { target: { files: [file] } });
    expect(input.files[0]).toBe(file);
  });
});
```
    expect(data).toHaveProperty('records');
  });
});
```

### Integration Tests
- **End-to-end document processing**: Upload → Gemini AI → MongoDB → API response
- **API workflows**: Test complete request/response cycles
- **Authentication flows**: Login/logout/session management

```python
# tests/test_integration.py
import pytest
from app import app
from config.database import db
import json

def test_complete_document_workflow(client):
    # 1. Upload document
    with open('tests/fixtures/sample_tender.pdf', 'rb') as f:
        response = client.post('/api/documents/upload',
            data={'file': f},
            headers={'Authorization': 'Bearer test_token'})
    
    assert response.status_code == 201
    data = json.loads(response.data)
    document_id = data['document_id']
    
    # 2. Verify document in MongoDB
    doc = db.procurement_records.find_one({'_id': ObjectId(document_id)})
    assert doc is not None
    
    # 3. Run analysis
    response = client.post(f'/api/analysis/anomaly/{document_id}',
        headers={'Authorization': 'Bearer test_token'})
    assert response.status_code == 200
    
    # 4. Check for anomaly flags
    analysis = json.loads(response.data)
    assert 'risk_score' in analysis
```
});
```

### E2E Tests
- **Playwright**: Browser automation testing
- **User Flows**: Complete user journeys
- **Cross-browser testing**: Chrome, Firefox, Safari

```typescript
// Example: E2E test
import { test, expect } from '@playwright/test';

test('upload and view procurement document', async ({ page }) => {
  await page.goto('http://localhost:3000/dashboard');
  await page.click('button:has-text("Upload Document")');
  await page.setInputFiles('input[type="file"]', 'test-tender.pdf');
  await page.click('button:has-text("Analyze")');
  
  await expect(page.locator('.success-message')).toBeVisible();
});
```

### Performance Tests
- **Load testing**: 1000+ concurrent users with Artillery or k6
- **Gemini AI rate limits**: Handle API throttling
- **MongoDB query optimization**: Ensure indexes work effectively
- **Next.js build optimization**: Check bundle sizes

---

## Environment Variables

```bash
# .env.local

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/procurechain
MONGODB_DB=procurechain

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Authentication
NEXTAUTH_SECRET=your_secret_key_here
NEXTAUTH_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=10485760  # 10MB in bytes
ALLOWED_FILE_TYPES=.pdf,.docx,.doc

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=900000  # 15 minutes in ms

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Vercel (Production)
VERCEL_URL=https://procurechain.vercel.app
```

---

## Local Development Setup

### Prerequisites
- **Python 3.9+** (for Flask backend)
- **Node.js 18+** (for Next.js frontend)
- **MongoDB Atlas** account (or local MongoDB)
- **Gemini AI API** key

### Installation Steps

#### Backend Setup (Flask)
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env with your credentials

# Run Flask development server
python app.py
# Backend runs on http://localhost:5000
```

#### Frontend Setup (Next.js)
```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run Next.js development server
npm run dev
# Frontend runs on http://localhost:3000
```

### Python Dependencies (requirements.txt)

```txt
# Flask Framework
Flask==3.0.0
Flask-CORS==4.0.0

# MongoDB
pymongo==4.6.0
gridfs==0.1.0

# Gemini AI
google-generativeai==0.3.0

# Authentication & Security
PyJWT==2.8.0
bcrypt==4.1.0
python-dotenv==1.0.0

# File Processing
Pillow==10.1.0
python-magic==0.4.27

# Utilities
python-dateutil==2.8.2
validators==0.22.0

# Testing
pytest==7.4.3
pytest-flask==1.3.0
```

### Database Setup

```python
# scripts/setup_db.py
from pymongo import MongoClient, ASCENDING, DESCENDING
import os
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv('MONGODB_URI'))
db = client['procurechain']

def setup_database():
    print("Setting up database indexes...")
    
    # Procurement records indexes
    db.procurement_records.create_index([('tender_number', ASCENDING)], unique=True)
    db.procurement_records.create_index([('status', ASCENDING)])
    db.procurement_records.create_index([('published_date', DESCENDING)])
    db.procurement_records.create_index([('category', ASCENDING)])
    
    # Vendors indexes
    db.vendors.create_index([('registration_number', ASCENDING)], unique=True)
    db.vendors.create_index([('name', ASCENDING)])
    
    # Anomaly flags indexes
    db.anomaly_flags.create_index([('procurement_id', ASCENDING)])
    db.anomaly_flags.create_index([('risk_score', DESCENDING)])
    db.anomaly_flags.create_index([('created_at', DESCENDING)])
    
    # Audit logs with TTL (2 years)
    db.audit_logs.create_index([('created_at', DESCENDING)])
    db.audit_logs.create_index(
        [('created_at', ASCENDING)], 
        expireAfterSeconds=63072000
    )
    
    # Text search indexes
    db.procurement_records.create_index([
        ('title', 'text'),
        ('description', 'text')
    ])
    
    print("Database setup complete!")
    client.close()

if __name__ == '__main__':
    setup_database()
```

Run the setup script:
```bash
python scripts/setup_db.py
```

---

## Future Enhancements

### Phase 2 Features
- **Predictive Analytics**: Forecast procurement trends
- **Automated Alerts**: Email/SMS notifications for anomalies
- **Mobile App**: Native iOS/Android applications
- **API for Third Parties**: Enable external auditors/NGOs to access data

### Phase 3 Features
- **Voice Interface**: Query procurement data via voice commands
- **Multi-Language Support**: Swahili, English translations
- **Advanced Visualizations**: Network graphs, relationship mapping
- **Integration with National Systems**: Connect to IFMIS

---

## Monitoring & Maintenance

### System Monitoring
- **Vercel Analytics**: Built-in performance monitoring (for Vercel deployment)
- **MongoDB Atlas Monitoring**: Database performance and alerts
- **Error Tracking**: Sentry for exception monitoring
- **Uptime Monitoring**: UptimeRobot or similar
- **Custom Logging**: MongoDB audit_logs collection

### Metrics to Track
- Flask API response times and throughput
- Gemini AI API success rate and latency
- MongoDB query performance
- User engagement metrics
- Anomaly detection accuracy
- File upload success rates
- Authentication success/failure rates

### Maintenance Schedule
- **Daily**: Automated MongoDB backups (Atlas automated backups)
- **Weekly**: Security updates, performance review
- **Monthly**: Dependency updates, security audits
- **Quarterly**: Comprehensive system review, feature updates

### MongoDB Maintenance
```python
# scripts/maintenance.py
from config.database import db

# Automated index maintenance
db.procurement_records.reindex()

# Check database stats
stats = db.command('dbStats')
print(f"Database size: {stats['dataSize'] / (1024**2):.2f} MB")

# Monitor slow queries
db.command('profile', 1, slowms=100)
slow_queries = db.system.profile.find().sort('ts', -1).limit(5)

for query in slow_queries:
    print(f"Slow query: {query['ns']} - {query['millis']}ms")
```

---

## Cost Estimation

### Gemini AI API Costs
- **Gemini 1.5 Pro**: $7 per million input tokens
- **Gemini 1.5 Flash**: $0.35 per million input tokens
- **Estimated Monthly Cost** (1000 documents): $50-$200

### Infrastructure Costs
- **Frontend Hosting** (Vercel for Next.js): $0-$20/month
  - Hobby: Free
  - Pro: $20/month
- **Backend Hosting** (Flask):
  - **Heroku**: $7-$25/month (Eco/Basic dynos)
  - **AWS EC2**: $10-$30/month (t3.micro - t3.small)
  - **DigitalOcean**: $6-$12/month (Basic droplet)
- **MongoDB Atlas**: $57-$200/month (M10 cluster recommended)
  - Or **Free Tier** for development/testing (512MB storage)
- **File Storage** (GridFS included in MongoDB, or AWS S3): $0-$20/month
- **Monitoring Tools**: $0-$50/month (many have free tiers)

**Total Estimated Monthly Cost**: 
- **Development**: $0 (using all free tiers)
- **Production**: $73-$490

---

## Contact & Support

**Project Lead**: Thuku Evanson Muchamo  
**Institution**: Kabarak University  
**Department**: Computer Science  
**Supervisor**: Ms. Daisy Ondwari

---

## License & Compliance

This system is developed in compliance with:
- Kenya Data Protection Act, 2019
- Public Procurement and Disposal Act, 2015
- Access to Information Act, 2016

**Project Status**: Research & Development Phase  
**Timeline**: May - August 2025
