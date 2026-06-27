import mongoose from 'mongoose';
export const connectDB=async ()=>{
    await mongoose.connect('mongodb+srv://namannagpal84_db_user:R7ZkmbwoK6QEOPUw@cluster0.dsstqiw.mongodb.net/');
}


///namannagpal84_db_user       R7ZkmbwoK6QEOPUw