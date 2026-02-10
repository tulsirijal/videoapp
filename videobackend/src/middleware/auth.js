import jwt from "jsonwebtoken";
import prisma from "../db/prisma.js";
import { JWT_ACCESS_SECRET } from "../config/index.js";

const authMiddleware = async (req, res, next) => {
  try {
    if (req.method === 'OPTIONS') {
      return next();
    }
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const payload = jwt.verify(token, JWT_ACCESS_SECRET);


    const user = await prisma.user.findUnique({ 
      where: { id: payload.sub },
      select: { id: true, email: true, firstname: true, lastname: true } 
    });

    if (!user) {
      return res.status(401).json({ error: "User no longer exists" });
    }


    req.user = user;
    next();
  } catch (error) {
    // If token is expired, return 401 so the frontend axios interceptor triggers a refresh
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
};

export default authMiddleware;