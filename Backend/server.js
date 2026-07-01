import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import {connectDB} from './config/db.js'
import { clerkMiddleware } from '@clerk/express'
import invoiceRouter from './routes/invoiceRouter.js'
import path from 'path';
const app=express();
const port=4000;
//// middlewares
app.use(clerkMiddleware());
app.use(cors());
app.use(express.json({limit:"20mb"}));
app.use(express.urlencoded({limit: "20mb", extended:true}));
app.use("/api/invoices", invoiceRouter);


app.listen((req,res)=>{
    console.log(`server is running on ${process.env.PORT}`)
})


/////////db

connectDB();




////////routes
app.use('/uploads',express.static(path.join(process.cwd(),"uploads")));
app.get('/',(req,res)=>{res.send("API WORKING")
});
app.listen(port,()=>{
    console.log(`server started on http://localhost:${port}`);
});