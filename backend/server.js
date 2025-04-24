import cookieParser from "cookie-parser";
import express, { urlencoded } from "express";
import dotenv from 'dotenv';
import userRoutes from './routes/user.js';
import bookingRoutes from './routes/booking.js';
import { connectMongodb } from "./connection/connectMongodb.js";
import cors from 'cors';

dotenv.config({path: './config/.env'});
const PORT = process.env.PORT;
const app = express();
connectMongodb();
app.use(express.json())
app.use(urlencoded({extended: true}))
app.use(cookieParser())
app.use(cors({origin: process.env.FRONTEND_URL, credentials: true}));
app.use(express.static('./public'))

app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);

app.listen(PORT, ()=>{
    console.log(`server running on http://localhost:${PORT}`);
})