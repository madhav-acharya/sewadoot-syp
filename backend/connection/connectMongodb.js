import mongoose from "mongoose";

export const connectMongodb = async () => 
{
    await mongoose.connect(process.env.MONGODB_URI, {dbname: process.env.DB_NAME})
    .then((res)=>{
        console.log(`Database named ${res.connection.name} is connected sucessfully`)
    })
    .catch((err)=>{
        console.log(`Something went wrong while connecting to the Database${err}`)
    })
}