import express from 'express';
import { existsSync } from 'fs';
import 'dotenv/config';
import {connectDB} from './config/db.js'
import { clerkMiddleware } from '@clerk/express'
import invoiceRouter from './routes/invoiceRouter.js'
import businessProfileRouter from './routes/businessProfileRouter.js'
import aiInvoiceRouter from './routes/aiInvoiceRouter.js'
import path from 'path';
import { fileURLToPath } from 'url';

process.on('unhandledRejection', (err) => console.error('Unhandled rejection:', err));
process.on('uncaughtException', (err) => console.error('Uncaught exception:', err));

const app=express();
const port=process.env.PORT || 4000;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

//// manual CORS (avoids cors package incompatibility with Express 5)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (origin === clientUrl || clientUrl === '*' || !process.env.CLIENT_URL)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

//// middlewares
app.use(clerkMiddleware());
app.use(express.json({limit:"20mb"}));
app.use(express.urlencoded({limit: "20mb", extended:true}));

//// routes
app.get("/api/health", (req, res) => {
    res.json({ success: true, message: "AI Invoice Generator Backend is running" });
});
app.use("/api/invoices", invoiceRouter);
app.use('/api/businessProfile',businessProfileRouter);
app.use('/api/ai-invoice', aiInvoiceRouter);

////////db (handle errors gracefully)
connectDB().catch(err => console.error('MongoDB connection failed:', err.message));

////////static files (production) — only if Frontend/dist/ exists
const frontendDist = path.join(__dirname, '..', 'Frontend', 'dist');
if (existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('/{*path}', (req, res) => {
      if (req.path.startsWith('/api')) return;
      res.sendFile(path.join(frontendDist, 'index.html'), () => {});
  });
}

//// global error handler
app.use((err, req, res, next) => {
    console.error('Request error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(port,()=>{
    console.log(`server started on http://localhost:${port}`);
});