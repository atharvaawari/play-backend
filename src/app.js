import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"


const app = express()


//Cross-Origin Resource Sharing (CORS) is a security feature implemented in web browsers to control how web applications running at one origin (domain) can interact with resources from another origin. This is done to prevent potentially malicious websites from making unauthorized requests to a different domain.
//limit: '16kb' is also to make limit for allowing json to express
// static("public") is use for convert url special char to understandable for server
// cookieParser is use to perform curd operations on cokkies

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))    
app.use(express.json({limit: '16kb'}));  
app.use(express.urlencoded({extended: true}))  
app.use(express.static("public")) 
app.use(cookieParser())




export { app }