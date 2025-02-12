import { User } from "../models/user-model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../../utils/sendEmail.js";
import getDataUri from "../../utils/dataUri.js";
import cloudinary from "cloudinary";

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

export default userCtrl;
