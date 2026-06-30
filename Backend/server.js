import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import {connectDB} from './config/db.js'
import { clerkMiddleware } from '@clerk/express'
const app=express();
const port=4000;
//// middlewares
app.use(clerkMiddleware());
app.use(cors());
app.use(express.json({limit:"20mb"}));
app.use(express.urlencoded({limit: "20mb", extended:true}));






/////////db

connectDB();




////////routes
app.get('/',(req,res)=>{res.send("API WORKING")
});
app.listen(port,()=>{
    console.log(`server started on http://localhost:${port}`);
});