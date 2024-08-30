import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";    //jwt.io
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
        userName: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,     //it is good for to enable searching feild  (Expensive as performance)
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String,    //use for cloudnary
            required: true,
        },
        coverImage: {
            type: String,    //use for cloudnary
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {              //encrypt using bcrypt lib
            type: String,
            required: [true, 'password is required']
        },
        refreshToken: {    
            type: String
        },

    }, { timestamps: true }
)


//used pre middleware for when i modiefied the password or add it will verfied using core bcrypt lib
//bcrypt library helps us to hash passwords
// pre is a hook of moongoose exexute just before completing event like ("save", etc.) 
//As we need context of password feild from the Schema class we dont get the context of this inside arrow function 
//Also we are using a middleware so we get next and have to execute it to pass for another oprations
//we use isModified inbuilt function for only run for when password got change

//Encrypt the password here
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

//adding custome methods for check password while login or while accessing authenticate data
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

//adding one more methods to generate AceessToken
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this.id,
            email: this.email,
            userName: this.userName,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this.id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User", userSchema)