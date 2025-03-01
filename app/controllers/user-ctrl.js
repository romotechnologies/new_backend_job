import { User } from "../models/user-model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../../utils/sendEmail.js";
import getDataUri from "../../utils/dataUri.js";
import cloudinary from "cloudinary";
import { JobPost } from "../models/jobpost-model.js";

const userCtrl = {};

userCtrl.register = async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    jobrole,
    skills,
    dob,
    phoneno,
    collegename,
    address,
    zipcode,
    orgname,
    orgtype,
    orgwebsite
  } = req.body;
  const file = req.file;

  console.log("inside user ctl register");
  try {
    let userAlready = await User.findOne({ email });
    console.log(userAlready);
    if (userAlready)
      return res.status(400).json({ message: "Email already exist" });
    const fileUri = getDataUri(file);
    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = await User.create({
      name,
      email,
      password: hash,
      profilepic: {
        public_id: mycloud.public_id,
        url: mycloud.secure_url,
      },
      role,
      jobrole,
      skills,
      dob,
      phoneno,
      collegename,
      address,
      zipcode,
      orgname,
      orgtype,
      orgwebsite
    });

    await user.save();
    const subject = `Welcome to Job portal ${name}`;
    const text = `Thank you for registering with us. We're excited to assist you in finding the perfect job opportunity. Let's work together to achieve your career goals!`;
    sendEmail(user.email, subject, text);
    const tokenData = {
      userId: user._id,
      role: user.role,
    };
    // console.log(tokenData);
    const token = jwt.sign(tokenData, process.env.SECREAT_KEY, {
      expiresIn: "7d",
    });
    return res.status(200).json({
      message: "Registration successfull " + user.name,
      token, // Send the token to be stored client-side
      user,
    });
    // res.status(201).json(user);
  } catch (err) {
    console.error("Error Details:", err);
    res.status(500).json({ error: err.message });
  }
};

userCtrl.login = async (req, res) => {
  const { email, password } = req.body;
  // console.log(email, password);
  try {
    const user = await User.findOne({ email }).select("+password");
    // console.log("user", user);
    if (!user) {
      return res.status(404).json({ message: "Invalid email" });
    }
    // console.log("below");
    const isValid = await bcrypt.compare(password, user.password);
    // console.log("below 2");
    // console.log(isValid);
    if (!isValid) {
      return res.status(404).json({ message: "Invalid password" });
    }
    const tokenData = {
      userId: user._id,
      role: user.role,
    };
    // console.log(tokenData);
    const token = jwt.sign(tokenData, process.env.SECREAT_KEY, {
      expiresIn: "7d",
    });
    return res.status(200).json({
      message: "Welcome back " + user.name,
      token, // Send the token to be stored client-side
      user,
    });
  } catch (err) {
    res.status(500).json({ error: "something went wrong" });
  }
};
userCtrl.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ message: "please provide email" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    // console.log(user);
    const tokenGeneration = crypto.randomBytes(20).toString("hex");
    // console.log(tokenGeneration);
    const hashOfgeneratedToken = crypto
      .createHash("sha256")
      .update(tokenGeneration)
      .digest("hex");
    // console.log("bl");

    // console.log(hashOfgeneratedToken);
    user.resetPasswordToken = hashOfgeneratedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save();
    const subject = "Reset link for SkillBoost.com";
    const text = `password reset here ${process.env.FRONTEND_URL}/reset-password/${tokenGeneration}`;
    sendEmail(user.email, subject, text);
    return res.status(200).json({
      message: "password link sent to your mail",
    });
  } catch (err) {
    console.error("Error Details:", err);
    res.status(500).json({ error: err.message });
  }
};

userCtrl.resetPassword = async (req, res) => {
  const { token } = req.params;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "token is invalid or has been expired" });
    }
    const newPassword = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const newHashPassword = await bcrypt.hash(newPassword, salt);
    user.password = newHashPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: "password reset successfulyy" });
  } catch (err) {
    return res.status(500).json({ error: "something went wrong" });
  }
};

userCtrl.updateProfile = async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    jobrole,
    skills,
    dob,
    phoneno,
    collegename,
    address,
    zipcode,
    orgname,
    orgtype,
    orgwebsite,
  } = req.body;
  const file = req.file; // Optional: file upload for profile picture
  const userId = req.userId; // Assuming userId is added to the request after authentication

  try {
    // Find the user by ID
    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // If a new email is provided, check if the email is already taken
    if (email && email !== user.email) {
      let userAlready = await User.findOne({ email });
      if (userAlready)
        return res.status(400).json({ message: "Email already exists" });
      user.email = email;
    }

    // If a new password is provided, hash it
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      user.password = hash;
    }

    // If a new profile picture is uploaded
    if (file) {
      const fileUri = getDataUri(file);
      const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);
      user.profilepic = {
        public_id: mycloud.public_id,
        url: mycloud.secure_url,
      };
    }

    // Update other fields if provided
    if (name) user.name = name;
    if (role) user.role = role;
    if (jobrole) user.jobrole = jobrole;
    if (skills) user.skills = skills;
    if (dob) user.dob = dob;
    if (phoneno) user.phoneno = phoneno;
    if (collegename) user.collegename = collegename;
    if (address) user.address = address;
    if (zipcode) user.zipcode = zipcode;
    if (orgname) user.orgname = orgname;
    if (orgtype) user.orgtype = orgtype;
    if (orgwebsite) user.orgwebsite = orgwebsite;

    // Save the updated user to the database
    await user.save();

    // Return success response with updated user data
    return res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (err) {
    console.error("Error Details:", err);
    res.status(500).json({ error: err.message });
  }
};

userCtrl.jobApply = async (req, res) => {
  try {
    const userId = req.userId; // Extract user ID from authentication middleware
    const { jobId } = req.params;
    console.log(jobId)

    // Check if the job post exists
    const job = await JobPost.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // Find user and check if they already applied
    const user = await User.findById(userId);
    if (user.appliedJobPosts.includes(jobId)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "You have already applied for this job",
        });
    }

    // Add the job post to the user's applied jobs
    user.appliedJobPosts.push(jobId);
    await user.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Job application submitted successfully",
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

userCtrl.appliedJobPost=async (req, res) => {
  try {
    const userId = req.userId; // Extract user ID from authentication middleware

    // Find user and populate applied job posts
    const user = await User.findById(userId).populate({
      path: "appliedJobPosts",
      model: "JobPost", // Ensure "JobPost" is the correct model name
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      appliedJobs: user.appliedJobPosts, // This will now contain full job post details
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export default userCtrl;
