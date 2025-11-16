# ProcureChain Frontend

A comprehensive Next.js 16 frontend for the ProcureChain procurement transparency platform.

## 🚀 Features

- **Authentication System**: Complete login/register with JWT
- **Procurement Management**: Browse, create, view, and manage procurement records
- **Vendor Directory**: View vendor profiles and contract history
- **Analytics Dashboard**: Comprehensive charts and insights using Recharts
- **AI Integration**: View AI-analyzed procurement data, risk scores, and anomaly detection
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Notifications**: Toast notifications for user feedback
- **Protected Routes**: Role-based access control

## 📋 Prerequisites

- Node.js >= 20.9.0
- npm or yarn
- Backend API running on http://localhost:5000

## 🛠️ Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Configure environment variables**:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

3. **Run the development server**:
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
frontend/
├── app/
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   ├── procurement/        # Procurement pages
│   │   ├── [id]/          # Procurement detail
│   │   ├── new/           # Create procurement
│   │   └── page.tsx       # Procurement listing
│   ├── vendors/           # Vendor pages
│   │   ├── [id]/         # Vendor detail
│   │   └── page.tsx      # Vendor listing
│   ├── dashboard/         # Dashboard pages
│   │   ├── layout.tsx    # Dashboard layout with sidebar
│   │   └── page.tsx      # Dashboard main page
│   ├── analytics/         # Analytics with charts
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Homepage
│   └── globals.css       # Global styles
├── components/
│   ├── ui/               # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   └── LoadingSpinner.tsx
│   └── layout/           # Layout components
│       ├── Header.tsx
│       └── Footer.tsx
├── contexts/
│   └── AuthContext.tsx   # Authentication state management
├── lib/
│   ├── api.ts           # API client with axios
│   └── utils.ts         # Utility functions
├── types/
│   └── index.ts         # TypeScript type definitions
└── public/              # Static assets
```

## 🎨 Design System

The application uses a light theme with the following color scheme:

- **Primary**: Blue (#3b82f6)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Danger**: Red (#ef4444)
- **Background**: Light gray (#f9fafb)

All colors are defined in `app/globals.css` using CSS custom properties.

## 🔐 Authentication

### Default Credentials
- **Email**: admin@procurechain.com
- **Password**: admin123

### User Roles
- `admin`: Full access to all features
- `procurement_officer`: Can create and manage procurements
- `auditor`: Read-only access with audit capabilities
- `public`: View public procurement data only

## 📄 Pages Overview

### Public Pages
- `/` - Homepage with features and statistics
- `/login` - User authentication
- `/register` - New user registration
- `/procurement` - Browse all procurements
- `/procurement/[id]` - View procurement details
- `/vendors` - Browse all vendors
- `/vendors/[id]` - View vendor details

### Protected Pages (Requires Login)
- `/dashboard` - User dashboard with overview
- `/procurement/new` - Create new procurement (admin/procurement_officer only)
- `/analytics` - Analytics dashboard with charts

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start development server on port 3000

# Production
npm run build        # Build for production
npm run start        # Start production server

# Linting
npm run lint         # Run ESLint
```

## 🔌 API Integration

The frontend integrates with the Flask backend API:

### API Endpoints Used
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/procurement/public` - Get public procurements
- `GET /api/procurement/:id` - Get procurement details
- `POST /api/procurement` - Create procurement
- `GET /api/vendors` - Get vendors
- `GET /api/analytics/stats` - Get analytics data

All API calls include JWT token authentication automatically via axios interceptors.

## 🎯 Key Features

### 1. Procurement Management
- Search and filter procurements
- View detailed procurement information
- AI-analyzed risk scores and anomaly detection
- Document upload and management
- Status tracking (draft, published, awarded, etc.)

### 2. Vendor Management
- Vendor directory with search
- Performance scoring
- Contract history
- Blacklist status tracking

### 3. Analytics Dashboard
- Interactive charts using Recharts
- Category distribution
- Status distribution
- Monthly trends
- Risk level analysis

### 4. Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Protected routes
- Automatic token refresh
- Session management

## 🚨 Error Handling

The application includes comprehensive error handling:
- Form validation with user-friendly messages
- API error handling with toast notifications
- 404 pages for missing resources
- Authentication redirects
- Loading states for async operations

## 📱 Responsive Design

Fully responsive design that works on:
- Desktop (1920px+)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (< 768px)

## 🔧 Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Ensure backend is running on http://localhost:5000
   - Check `.env.local` configuration
   - Verify CORS settings in backend

2. **Build Errors**
   - Clear `.next` folder: `rm -rf .next`
   - Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
   - Ensure Node.js version >= 20.9.0

3. **Authentication Issues**
   - Clear browser local storage
   - Check JWT token expiration
   - Verify backend authentication endpoints

## 📚 Technologies Used

- **Framework**: Next.js 16.0.3
- **React**: 19.2.0
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS 4
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Animations**: Framer Motion
- **Date Utilities**: date-fns

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Follow the component naming conventions
4. Add proper error handling
5. Test on multiple screen sizes

## 📝 License

This project is part of the ProcureChain procurement transparency platform.

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the backend API documentation
3. Ensure all environment variables are set correctly

---

**Built with ❤️ for transparent procurement**
