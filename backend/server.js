import cookieParser from "cookie-parser";
import express, { urlencoded } from "express";
import dotenv from 'dotenv';
import userRoutes from './routes/user.js';
import bookingRoutes from './routes/booking.js';
import { connectMongodb } from "./connection/connectMongodb.js";
import cors from 'cors';
import { adminJs, adminRouter } from './admin/admin.js';

dotenv.config({path: './config/.env'});
const PORT = process.env.PORT;
const app = express();
connectMongodb();
app.use(adminJs.options.rootPath, adminRouter);
app.use(express.json())
app.use(urlencoded({extended: true}))
app.use(cookieParser())
app.use(cors({origin: process.env.FRONTEND_URL, credentials: true}));
app.use(express.static('./public'))

app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);

app.listen(PORT, ()=>{
    console.log(`server running on http://localhost:${PORT}`);
    console.log(`Admin Panel: http://localhost:${PORT}${adminJs.options.rootPath}`);
})