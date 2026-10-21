import express from "express";
import User from "../models/User.js";
import Gig from "../models/Gig.js";
import Review from "../models/Review.js";

const router = express.Router();

router.get("/", async (req, res) => {
    const users = await User.find().select("name email major semester");
    res.json(users);
});

router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ error: "User not found" });

        const gigsPosted = await Gig.countDocuments({ user_id: user._id });
        const gigsCompleted = await Gig.countDocuments({ accepted_applicant_id: user._id, status: "Completed" });
        const reviews = await Review.find({ reviewee_id: user._id });
        const avgRating = reviews.length
            ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
            : 0;

        res.json({
            ...user.toObject(),
            gigsPosted,
            gigsCompleted,
            averageRating: Number(avgRating.toFixed(2)),
            reviewCount: reviews.length,
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

export default router;