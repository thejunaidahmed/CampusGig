import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

const generateToken = (user) => {
    const secret = process.env.JWT_SECRET || "campus_gig_secret_jwt_key_2026_pakistan";
    return jwt.sign({ id: user._id, email: user.email }, secret, { expiresIn: "7d" });
};

router.post("/register", async (req, res) => {
    try {
        const { name, email, password, major, semester, bio, skills, phone } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: "Name, email, and password are required." });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters." });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
            return res.status(400).json({ error: "An account with this email already exists." });
        }

        const user = new User({
            name: name.trim(),
            email: normalizedEmail,
            password,
            major: major || "Computer Science",
            semester: semester ? Number(semester) : 4,
            bio: bio || "University student exploring campus gigs.",
            skills: Array.isArray(skills) && skills.length ? skills : ["Web Development"],
            phone: phone || "03123237006",
        });

        await user.save();
        const token = generateToken(user);

        const safeUser = user.toObject();
        delete safeUser.password;

        return res.status(201).json({
            message: "Account registered successfully!",
            token,
            user: safeUser,
        });
    } catch (err) {
        console.error("Register error:", err.message);
        return res.status(500).json({ error: err.message || "Registration failed." });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Please provide both email and password." });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) return res.status(401).json({ error: "Invalid email or password." });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ error: "Invalid email or password." });

        const token = generateToken(user);
        const safeUser = user.toObject();
        delete safeUser.password;

        return res.json({ message: "Logged in successfully!", token, user: safeUser });
    } catch (err) {
        console.error("Login error:", err.message);
        return res.status(500).json({ error: err.message || "Login failed." });
    }
});

router.get("/me", authMiddleware, async (req, res) => {
    return res.json({ user: req.user });
});

export default router;