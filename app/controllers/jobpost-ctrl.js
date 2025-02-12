import { JobPost } from "../models/jobpost-model.js";

const jobpostCtrl = {};

jobpostCtrl.createjob = async (req, res) => {
  const { jobTitle, jobDescription, jobLocation, jobPay, jobType } = req.body;

  try {
    const jobPost = await JobPost.create({
      jobTitle,
      jobDescription,
      jobLocation,
      jobPay,
      jobType,
    });

    jobPost.recruiterId = req.userId;
    await jobPost.save();
    return res.status(200).json({
      message: "Job Post created sucessfully",
      jobPost,
    });
  } catch (err) {
    console.error("Error Details:", err);
    res.status(500).json({ error: err.message });
  }
};

jobpostCtrl.getAllJobPosts = async (req, res) => {
  const jobtite = req.query.jobtitle || "";
  const joblocation = req.query.joblocation || "";
  try {
    const jobPosts = await JobPost.find({
      jobTitle: {
        $regex: jobtite,
        $options: "i",
      },
      jobLocation: {
        $regex: joblocation,
        $options: "i",
      },
    });
    res.json(jobPosts);
  } catch (err) {
    res.status(500).json({ error: "something went wrong" });
  }
};

jobpostCtrl.deletejob = async (req, res) => {
  const { id } = req.params;
  try {
    const jobpost = await JobPost.findById(id);
    if (!jobpost) return res.status(404).json({ message: "jobpost not found" });
    await jobpost.deleteOne();
    res.status(200).json({ message: "job Post deleted successfully" });
  } catch (err) {
    console.error("Error Details:", err);
    res.status(500).json({ error: err.message });
  }
};

jobpostCtrl.updatejob = async (req, res) => {
  const { id } = req.params;
  const { jobTitle, jobDescription, jobLocation, jobPay, jobType } = req.body;

  try {
    const jobpost = await JobPost.findById(id);
    if (!jobpost) return res.status(404).json({ message: "jobpost not found" });

    if (jobTitle) jobpost.jobTitle = jobTitle;
    if (jobDescription) jobpost.jobDescription = jobDescription;
    if (jobLocation) jobpost.jobLocation = jobLocation;
    if (jobPay) jobpost.jobPay = jobPay;
    if (jobType) jobpost.jobType = jobType;

    await jobpost.save();

    res.status(200).json({ message: "job Post edited successfully" });
  } catch (err) {
    console.error("Error Details:", err);
    res.status(500).json({ error: err.message });
  }
};

export default jobpostCtrl;
