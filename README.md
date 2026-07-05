# AI Powered Invoice Generator

Full-stack invoice management application with AI-assisted invoice generation.

This project has two main folders:
- `Backend/` - Express API, Clerk auth middleware, MongoDB models, AI generation route
- `Frontend/` - React app (Vite) with protected routes and invoice workflow UI

## Features

- AI invoice drafting from natural-language prompt (Gemini)
- Create, list, edit, preview, and delete invoices
- Business profile management with default tax and branding assets
- Auto status transition of unpaid invoices to overdue when due date passes
- Clerk-based authentication for protected routes and API access
- Print-friendly invoice preview

## Tech Stack

- Frontend: React 19, Vite 8, React Router 7, Tailwind CSS v4, Clerk React SDK
- Backend: Node.js, Express 5, Mongoose, Clerk Express SDK, Google GenAI SDK
- Database: MongoDB

## Project Structure

```text
aipoweredinvoicegenerator/
	Backend/
		config/
			db.js
		controllers/
			businessProfileController.js
			invoiceController.js
		models/
			businessProfileModel.js
			invoicemodel.js
		routes/
			aiInvoiceRouter.js
			businessProfileRouter.js
			invoiceRouter.js
		package.json
		server.js

	Frontend/
		src/
			api/
				index.js
			components/
			pages/
			GenerateBtn/
			App.jsx
			main.jsx
		package.json
		vite.config.js
```

## How Backend And Frontend Connect

- Frontend calls API paths under `/api/...`.
- In local development, Vite proxy forwards `/api` to `http://localhost:4000`.
- Backend exposes API routes under `/api/*` and serves `Frontend/dist` in production if build exists.
- Clerk session is used by both sides:
	- Frontend uses `ClerkProvider`
	- Backend reads auth using `getAuth(req)`

## Prerequisites

- Node.js 18+
- MongoDB connection string
- Clerk app (publishable + secret keys)
- Gemini API key

## Environment Variables

### Backend/.env

```env
PORT=4000
MONGODB_URL=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority

CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxx
CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxx

GEMINI_API_KEY=AIzaxxxxxxxxxxxxxxxxx
CLIENT_URL=http://localhost:5173
```

### Frontend/.env

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxx
# Optional (not required in local when using Vite proxy)
# VITE_API_URL=http://localhost:4000
```

## Installation

```bash
# from project root
cd Backend
npm install

cd ../Frontend
npm install
```

## Run Locally

Open two terminals.

Terminal 1 (backend):
```bash
cd Backend
npm run dev
```

Terminal 2 (frontend):
```bash
cd Frontend
npm run dev
```

App URL: `http://localhost:5173`
API URL: `http://localhost:4000`

## Build And Production

Build frontend:

```bash
cd Frontend
npm run build
```

Start backend in production mode:

```bash
cd Backend
npm start
```

If `Frontend/dist` exists, backend serves static files and supports SPA routing fallback for non-API paths.

## Backend Details

### Backend scripts

From `Backend/package.json`:
- `npm run dev` -> nodemon server
- `npm start` -> node server

### Backend route groups

- `GET /api/health`
- `GET /api/invoices`
- `GET /api/invoices/:id`
- `POST /api/invoices`
- `PUT /api/invoices/:id`
- `DELETE /api/invoices/:id`
- `GET /api/businessProfile/me`
- `POST /api/businessProfile`
- `PUT /api/businessProfile/:id`
- `POST /api/ai-invoice/generate`

### Backend auth behavior

- `clerkMiddleware()` is applied globally.
- Sensitive handlers validate `userId` from `getAuth(req)`.
- If no authenticated user: returns `401`.

### Invoice model summary

Main fields:
- `owner`, `invoiceNumber`, `issueDate`, `dueDate`
- `fromBusinessName`, `fromEmail`, `fromAddress`, `fromPhone`, `fromGst`
- `client` object: `name`, `email`, `address`, `phone`
- `items[]`: `id`, `description`, `qty`, `unitPrice`
- `currency`, `status` (`draft|unpaid|paid|overdue`)
- `taxPercent`, `subtotal`, `tax`, `total`
- optional brand assets and signature fields

Controller behaviors:
- Calculates totals server-side from `items` and `taxPercent`
- Ensures unique `invoiceNumber` with retry strategy
- Accepts lookup by Mongo `_id` or `invoiceNumber`
- Auto marks unpaid overdue invoices in list/get handlers

### Business profile model summary

Main fields:
- `owner`, `businessName`, `email`, `address`, `phone`, `gst`
- `logoUrl`, `stampUrl`, `signatureUrl`
- `signatureOwnerName`, `signatureOwnerTitle`
- `defaultTaxPercent`

### AI generation endpoint

`POST /api/ai-invoice/generate`

Request body:

```json
{
	"prompt": "Create invoice for ..."
}
```

Behavior:
- Requires authenticated user
- Tries multiple Gemini model candidates
- Extracts/parses JSON from model output
- Returns normalized invoice draft payload on success

## Frontend Details

### Frontend scripts

From `Frontend/package.json`:
- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`

### Frontend routes

Public:
- `/` -> landing page

Protected:
- `/dashboard`
- `/invoices`
- `/invoices/new`
- `/invoices/:id/edit`
- `/invoices/:id`
- `/business-profile`

Protected routes redirect unauthenticated users back to `/`.

### Frontend API client

`Frontend/src/api/index.js` centralizes API calls:
- `invoiceApi` (list/get/create/update/delete)
- `businessProfileApi` (get/create/update)
- `aiInvoiceApi.generate(prompt)`

Request defaults:
- Sends cookies (`credentials: include`)
- Uses JSON content type by default
- Throws JS error for non-OK responses

## Common API Response Shape

Most endpoints return:

```json
{
	"success": true,
	"message": "...",
	"data": {}
}
```

Error responses use:

```json
{
	"success": false,
	"message": "..."
}
```

## Troubleshooting

- Frontend fails on startup with key error:
	- Check `VITE_CLERK_PUBLISHABLE_KEY` in `Frontend/.env`.

- API returns unauthorized:
	- Confirm Clerk is configured correctly and user is signed in.

- Requests fail in local dev:
	- Confirm backend runs on port `4000`.
	- Confirm `CLIENT_URL` matches frontend origin.

- Mongo connection issues:
	- Verify `MONGODB_URL` and IP/network access rules.

- AI generation fails:
	- Verify `GEMINI_API_KEY` and account/model availability.

## Security Note

Do not commit secrets or credentials in source files, README examples, or logs.
