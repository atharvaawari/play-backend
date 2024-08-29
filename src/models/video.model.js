import mongoose, {Schema, Types} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";  //


const VideoSchema = new Schema(
    {
        videoFile:{    //cloudnary
            type:String,
            required:true,
        },
        thumbnail:{       //cloudnary
            type:String,
            required:true,
        },
        title:{
            type:String,
            required:true,
        },
        discription:{
            type:String,
            required:true,
        },
        duration:{
            type:Number, //Data of video from cloudnary
            required:true,
        },
        views:{
            type:Number,
            default: 0
        },
        ispublished:{
            type:Boolean,
            default: true,
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User",
        }
        
    },
     {timestamps: true}
)
    
VideoSchema.plugin(mongooseAggregatePaginate)  
//this mongooseAggregatePaginate library allow me to write aggregation querries 
 
export const Video = mongoose.model("Video", VideoSchema)