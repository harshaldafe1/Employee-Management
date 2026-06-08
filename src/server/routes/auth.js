import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const router = express.Router();

const generateToken = (id, role, name) => {
  return jwt.sign(
    { id, role, name },
    process.env.JWT_SECRET || "supersafesecretkey_for_development_only_please_change",
    { expiresIn: "30d" }
  );
};

// @route   POST /api/auth/login
// @access  Public
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Development convenience: Create default admin if DB is empty
    const count = await User.countDocuments();
    if (count === 0 && email === "admin@example.com") {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123", salt);
      await User.create({
        name: "Default Admin",
        email: "admin@example.com",
        password: hashedPassword,
        role: "Admin",
      });
    }

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role, user.name),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/auth/profile
// @access  Private
import { protect } from "../middleware/auth.js";
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
