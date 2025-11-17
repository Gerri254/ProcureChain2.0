# ProcureChain Frontend

A modern, minimalist Next.js 16 frontend for the ProcureChain procurement transparency platform.

## Features

### Public Features
- **Landing Page**: Compelling hero section showcasing platform features
- **Public Procurements**: Browse all published procurement opportunities
- **Procurement Details**: View detailed information about each procurement
- **Vendor Directory**: Explore registered vendors and their performance metrics

### Authenticated Features
- **Dashboard**: Overview with statistics and recent activity
- **Anomaly Detection**: View AI-detected anomalies and alerts
- **Complete Procurement Management**: Full CRUD operations
- **AI-Powered Insights**: View Gemini AI analysis and summaries

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Authentication**: JWT with context API
- **API Client**: Custom fetch wrapper

## Getting Started

### Prerequisites

- Node.js 20+
- Backend API running (see backend/README.md)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.local.example .env.local
```

3. Configure environment variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/                    # Next.js app directory
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── layout/           # Layout components
├── contexts/             # React contexts
├── lib/                  # Utilities and API client
├── types/                # TypeScript definitions
└── public/               # Static assets
```

## Pages

- `/` - Landing page
- `/procurements` - Public procurement list
- `/procurements/[id]` - Procurement details
- `/vendors` - Vendor directory
- `/login` - User login
- `/register` - User registration
- `/dashboard` - User dashboard (protected)
- `/anomalies` - Anomaly detection (protected)

## Design Philosophy

- **Minimalist**: Clean interface with focus on content
- **Performant**: Optimized with Next.js 16 App Router
- **Accessible**: Semantic HTML and keyboard navigation
- **Responsive**: Mobile-first design approach

## Contributing

Computer Science Final Year Project
**Lead**: Thuku Evanson Muchamo
**Supervisor**: Ms. Daisy Ondwari
**Institution**: Kabarak University
