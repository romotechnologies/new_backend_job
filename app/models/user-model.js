import { Schema, model } from "mongoose";
import validator from "validator";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      // required: [true, "Please enter your name"],
    },
    email: {
      type: String,
      // required: [true, "Please enter your email"],
      unique: true,
      validate: validator.isEmail,
    },
    password: {
      type: String,
      // required: [true, "Please enter your password"],
      minLength: [6, "password must be atleast 6 characters"],
      select: false,
    },
    role: {
      type: String,
    },
    jobrole:[
      {
        type: String,
      },
    ],
    profilepic: {
      public_id: {
        type: String,
        // required: true,
      },
      url: {
        type: String,
        // required: true,
      },
    },
    skills: [
      {
        type: String,
      },
    ],
    dob: {
      type: Date,
   
    },
    phoneno: {
      type: Number,
      // required: [true, "Please enter your phoneno"],
    },
    collegename: {
      type: String,
     
    },
    address: {
      type: String,
      // required: [true, "Please enter your phoneno"],
    },
    zipcode: {
      type: Number,
      // required: [true, "Please enter your zipcode"],
    },
    orgname:{
      type: String,
    },
    orgtype:{
      type: String,
    },
    orgwebsite:{
      type: String,
    },
    appliedJobPosts: [
      {
        type: Schema.Types.ObjectId,
        ref: "JobPost",
      },
    ],
    

    resetPasswordToken: String,
    resetPasswordExpire: String,
  },
  { timestamps: true }
);

export const User = model("User", UserSchema);
