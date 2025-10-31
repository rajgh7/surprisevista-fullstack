import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token failed" });
  }
};
