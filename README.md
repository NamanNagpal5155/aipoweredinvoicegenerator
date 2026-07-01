# AI-Powered Invoice Generator

A full-stack invoice management application with AI-powered invoice generation using Google Gemini. Built with React, Express, MongoDB, and Clerk authentication.

## Features

- **AI Invoice Generation** — Describe your invoice in plain English and let Gemini AI create it instantly
- **Invoice Management** — Create, edit, preview, print, and manage invoices with full CRUD
- **Business Profile** — Save your business details, logo, stamp, and signature with drag-and-drop upload
- **Smart Status Tracking** — Auto-detects overdue invoices based on due dates
- **Currency Support** — INR (₹) and USD ($) with proper formatting throughout
- **Authentication** — Secure login via Clerk (email/password or social login)
- **Print-Ready Preview** — Clean, professional invoice layout optimized for printing
- **Dashboard Analytics** — At-a-glance metrics with count and amount breakdowns

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router, Tailwind CSS v4 |
| Backend | Express 5, Mongoose, Clerk Auth |
| Database | MongoDB Atlas |
| AI | Google Gemini (`@google/genai`) |
| Auth | Clerk (`@clerk/react`, `@clerk/express`) |
| Build | Vite |

## Project Structure

```
├── Backend/
│   ├── config/             # DB connection
│   ├── controllers/        # Route handlers
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express routers
│   ├── uploads/            # Uploaded files
│   └── server.js           # Express entry point
├── Frontend/
│   ├── src/
│   │   ├── api/            # API client
│   │   ├── components/     # Shared UI components
│   │   ├── pages/          # Route pages
│   │   ├── assets/         # Static assets
│   │   └── GenerateBtn/    # Animated button component
│   ├── index.html
│   └── vite.config.js
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Clerk account (free tier)
- Google Gemini API key (free tier)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd aipoweredinvoicegenerator

# Install backend dependencies
cd Backend && npm install

# Install frontend dependencies
cd ../Frontend && npm install
```

### 2. Configure environment variables

**Backend/.env**
```env
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
MONGODB_URL=mongodb+srv://...
GEMINI_API_KEY=AIza...
CLIENT_URL=http://localhost:5173
```

**Frontend/.env**
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### 3. Run locally

```bash
# Terminal 1 — Backend
cd Backend && npm run dev

# Terminal 2 — Frontend
cd Frontend && npm run dev
```

Open http://localhost:5173 — the Vite proxy forwards `/api` requests to the backend on port 4000.

### 4. Build for production

```bash
cd Frontend && npm run build
```

The backend serves `Frontend/dist/` as static files in production mode.

## Deployment

### One-click deploy (Render / Railway)

1. Push to GitHub
2. Create a new Web Service pointing to the repo
3. Set **Root Directory** to `Backend`
4. **Build command**: `cd ../Frontend && npm install && npm run build`
5. **Start command**: `node server.js`
6. Add all environment variables from `.env`

### Manual deployment (VPS)

```bash
git clone <repo>
cd Backend && npm install
cd ../Frontend && npm install && npm run build
cd ../Backend
node server.js
```

For production, use a process manager like PM2:

```bash
npm install -g pm2
pm2 start server.js --name invoice-api
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invoices` | List invoices (with search/status filters) |
| GET | `/api/invoices/:id` | Get invoice by ID |
| POST | `/api/invoices` | Create invoice |
| PUT | `/api/invoices/:id` | Update invoice |
| DELETE | `/api/invoices/:id` | Delete invoice |
| GET | `/api/businessProfile/me` | Get current user's profile |
| POST | `/api/businessProfile` | Create business profile |
| PUT | `/api/businessProfile/:id` | Update business profile |
| POST | `/api/ai-invoice/generate` | Generate invoice via AI |

## License

MIT
