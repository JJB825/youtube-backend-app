import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    videoFile: { type: String, required: true }, // cloudinary url
    thumbNail: { type: String, required: true }, // cloudinary url
    title: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true }, // get information from url
    views: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    owner: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// enables writing of aggregation queries
videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);
