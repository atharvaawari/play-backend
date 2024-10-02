import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";


const app = express();


app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))    
app.use(express.json({limit: '16kb'}));  
app.use(express.urlencoded({extended: true, limit:"16kb"}))  
app.use(express.static("public")) 
app.use(cookieParser())


//routes
import userRouter from './routes/user.routes.js';
import videoRouter from './routes/video.routes.js';


//routes-declaration
app.use('/api/users', userRouter);
app.use('/api/video', videoRouter);


export { app }



//Cross-Origin Resource Sharing (CORS) is a security feature implemented in web browsers to control how web applications running at one origin (domain) can interact with resources from another origin. This is done to prevent potentially malicious websites from making unauthorized requests to a different domain. example in url spetail char are there when serching for example on google
//limit: '16kb' is also to make limit for allowing json to express
// static("public") is use for convert url special char to understandable for server
// cookieParser is use to perform curd operations on cokkies

///_________________________


//midleware -> checking or logic implement before response to the request is a middleware
//ex--> chek if user is login like wise
//(error, req, res, next)
//the middleware has a "next" flag which passes the process to another api's if it is not consisting of next then it is indicating the operation end of process