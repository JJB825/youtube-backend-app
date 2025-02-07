import mongoose, { Schema } from "mongoose";
// used to paginate and load huge amount of comments of particular video
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    video: { type: Schema.Types.ObjectId, ref: "Video", required: true },
  },
  { timestamps: true }
);

// gives ability to how much data to send, from where to where, from group of data
commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model("Comment", commentSchema);
