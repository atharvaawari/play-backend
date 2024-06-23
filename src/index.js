// require('dotenv').config({path: './env'})
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
    path: "./env"
})

connectDB()
.then( ()=>{
    app.listen(process.env.PORT || 3001, ()=>{
        console.log(`server is running on port: ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log("error in DBconnection!! ", error )
})