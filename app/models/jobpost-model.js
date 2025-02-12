import { Schema, model } from "mongoose";

const jobPostSchema = new Schema(
  {
    jobTitle: {
      type: String,
      required: [true, "Please enter your job title"],
    },
    jobDescription: {
      type: String,
      required: [true, "Please enter your job description"],
    },
    jobLocation: {
      type: String,
      required: [true, "Please enter your job location"],
    },
    jobPay: {
      type: String,
      required: [true, "Please enter your job pay"],
    },
    jobType: {
      type: String,
      required: [true, "Please enter your job type"],
    },
    recruiterId: Schema.Types.ObjectId,
   
  },
  { timestamps: true }
);

export const JobPost = model("JobPost", jobPostSchema);
