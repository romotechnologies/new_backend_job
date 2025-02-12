import jwt from "jsonwebtoken";

export default function authenticateUser(req, res, next) {
  let token = req.headers["authorization"];
  // If no token in headers, check query parameters
  if (!token) {
    token = req.query.token; // Check if token is in query
  }
  if (!token) {
    return res.status(401).json({ message: "token is required" });
  }
  try {
    const tokenData = jwt.verify(token, process.env.SECREAT_KEY);
    // console.log(tokenData);
    req.userId = tokenData.userId;
    req.role = tokenData.role;
    // console.log("1", req);
    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({ errors: err.message });
  }
}
