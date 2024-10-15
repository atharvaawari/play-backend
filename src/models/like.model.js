import mongoose, {Schema} from "mongoose";

const likeSchema = new Schema(
  {
    video: Schema.Types.ObjectId,
    ref: "Video"    
  },
  {
    comment: Schema.Types.ObjectId,
    ref:"Comment"
  },
  {
    tweet: Schema.Types.ObjectId,
    ref:"Tweet"
  },
  {
    playlist: Schema.Types.ObjectId,
    ref:"Playlist"
  },
  {
    likeBy:Schema.Types.ObjectId,
    ref:"User"
  },
  {timestamps: true}
);

export const Like = mongoose.model("Like", likeSchema);