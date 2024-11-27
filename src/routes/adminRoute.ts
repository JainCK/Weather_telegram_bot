import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user";
import dotenv from "dotenv";

dotenv.config();

const router = Router();


// Middleware to authenticate admin
const authenticateAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return; 
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err) => {
    if (err) {
      res.status(403).json({ message: "Forbidden" });
      return; 
    }

    next();
  });
};


router.get("/users", authenticateAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find({}, { telegramId: 1, location: 1, preferences: 1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve users." });
  }
});

// Admin: Block user
router.put("/block/:id", authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { subscribed: false });
    res.json({ message: "User blocked successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to block user." });
  }
});

export default router;
