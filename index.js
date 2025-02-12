import express from "express";
import dotenv from "dotenv";
import ConfigureDB from "./config/db.js";
import userCtrl from "./app/controllers/user-ctrl.js";
import singleUpload from "./app/middlewares/multer.js";
import cloudinary from "cloudinary";

import cors from "cors";
import authenticateUser from "./app/middlewares/authenticateUser.js";
import authorizeUser from "./app/middlewares/authorizeUser.js";
import jobpostCtrl from "./app/controllers/jobpost-ctrl.js";

dotenv.config();
ConfigureDB();

const port = process.env.PORT || 3026;
const app = express();
app.use(express.json());
app.use(cors());

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
  api_key: process.env.CLODINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECREAT,
});

app.post("/api/user/register", singleUpload, userCtrl.register);
app.post("/api/user/login", userCtrl.login);

//forgot-password
app.post("/api/user/forgot-password", userCtrl.forgotPassword);
//reset-password
app.put("/api/user/reset-password/:token", userCtrl.resetPassword);

// create jobpost by recruiter
app.post(
  "/api/recruiter/createjobpost",
  authenticateUser,
  authorizeUser(["recruiter"]),
  jobpostCtrl.createjob
);

// get all jobposts
app.get("/api/user/getalljobposts", jobpostCtrl.getAllJobPosts);

//update job post by recruiter
app.put(
  "/api/recruiter/updatejobpost/:id",
  authenticateUser,
  authorizeUser(["recruiter"]),
  jobpostCtrl.updatejob
);

//delete job post by recruiter
app.delete(
  "/api/recruiter/deletejobpost/:id",
  authenticateUser,
  authorizeUser(["recruiter"]),
  jobpostCtrl.deletejob
);

app.listen(port, () => {
  console.log("server running on port " + port);
});
