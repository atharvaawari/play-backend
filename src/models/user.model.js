import mongoose, { Schema } from "mongoose";
import  jwt  from "jsonwebtoken";
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
        fullname: {
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
        password: {
            type: String,
            required: [true, 'password is required']
        },
        refreshToken: {
            type: String
        },

    }, { timestamps: true }
)


//used pre middleware for when i modiefied the pass or add it will verfied using bcrypt lib
userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) return next()

    this.password = bcrypt.hash(this.password, 10)
    next()
})


export const User = mongoose.model("User", userSchema)