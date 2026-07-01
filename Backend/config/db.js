import mongoose from 'mongoose';
export const connectDB=async ()=>{
    await mongoose.connect(process.env.MONGODB_URL)
    .then(()=>{
        console.log("db connected");
    })
}


///namannagpal84_db_user       R7ZkmbwoK6QEOPUw