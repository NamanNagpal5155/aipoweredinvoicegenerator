import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import {connectDB} from './config/db.js'
import { clerkMiddleware } from '@clerk/express'
import invoiceRouter from './routes/invoiceRouter.js'
import businessProfileRouter from './routes/businessProfileRouter.js'
import aiInvoiceRouter from './routes/aiInvoiceRouter.js'
import path from 'path';
import { fileURLToPath } from 'url';
const app=express();
const port=process.env.PORT || 4000;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

//// middlewares
app.use(clerkMiddleware());
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials:true
}));
app.use(express.json({limit:"20mb"}));
app.use(express.urlencoded({limit: "20mb", extended:true}));
app.use("/api/invoices", invoiceRouter);
app.use('/api/businessProfile',businessProfileRouter);
app.use('/api/ai-invoice', aiInvoiceRouter);

////////db
connectDB();

////////static files (production)
const frontendDist = path.join(__dirname, '..', 'Frontend', 'dist');
app.use(express.static(frontendDist));

////////catch-all for SPA routing (production)
app.get('/{*path}', (req, res) => {
    if (req.path.startsWith('/api')) return;
    res.sendFile(path.join(frontendDist, 'index.html'), err => {
        if (err) res.status(404).send('Not found');
    });
});

app.listen(port,()=>{
    console.log(`server started on http://localhost:${port}`);
});