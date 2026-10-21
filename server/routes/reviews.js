import express from "express";
import Review from "../models/Review.js";
import Gig from "../models/Gig.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
    try {
        const { gig_id, rating, comment } = req.body;
        if (!gig_id || rating === undefined) {
            return res.status(400).json({ error: "Missing fields" });
        }
        const numericRating = Number(rating);
        if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
            return res.status(400).json({ error: "Rating must be a whole number from 1 to 5" });
        }

        const gig = await Gig.findById(gig_id);
        if (!gig) return res.status(404).json({ error: "Gig not found" });
        if (gig.status !== "Completed") {
            return res.status(400).json({ error: "Can only review completed gigs" });
        }

        const ownerId = gig.user_id.toString();
        const applicantId = gig.accepted_applicant_id?.toString();
        const reviewerId = req.user._id;
        const reviewerStr = reviewerId.toString();
        if (!applicantId) {
            return res.status(400).json({ error: "This gig has no accepted applicant to review" });
        }

        let reviewee_id;
        if (reviewerStr === ownerId) reviewee_id = applicantId;
        else if (reviewerStr === applicantId) reviewee_id = ownerId;
        else return res.status(403).json({ error: "You are not a participant in this gig" });

        const existing = await Review.findOne({ gig_id, reviewer_id: reviewerId });
        if (existing) return res.status(400).json({ error: "You already reviewed this gig" });

        const review = await Review.create({ gig_id, reviewer_id: reviewerId, reviewee_id, rating: numericRating, comment });
        res.status(201).json(review);
    } catch (e) {
        if (e.code === 11000) {
            return res.status(409).json({ error: "You already reviewed this gig" });
        }
        res.status(400).json({ error: e.message });
    }
});

router.get("/", async (req, res) => {
    const { reviewee_id, gig_id } = req.query;
    const filter = {};
    if (reviewee_id) filter.reviewee_id = reviewee_id;
    if (gig_id) filter.gig_id = gig_id;

    const reviews = await Review.find(filter)
        .populate("reviewer_id", "name")
        .populate("reviewee_id", "name");
    res.json(reviews);
});

router.patch("/:id", authMiddleware, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ error: "Review not found" });
        if (review.reviewer_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Only the reviewer can edit this review" });
        }

        if (Object.hasOwn(req.body, "rating")) {
            const rating = Number(req.body.rating);
            if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
                return res.status(400).json({ error: "Rating must be a whole number from 1 to 5" });
            }
            review.rating = rating;
        }
        if (Object.hasOwn(req.body, "comment")) {
            if (typeof req.body.comment !== "string") {
                return res.status(400).json({ error: "Comment must be text" });
            }
            review.comment = req.body.comment.trim();
        }
        if (!Object.hasOwn(req.body, "rating") && !Object.hasOwn(req.body, "comment")) {
            return res.status(400).json({ error: "Provide a rating or comment to update" });
        }

        await review.save();
        return res.json(review);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ error: "Review not found" });
        if (review.reviewer_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Only the reviewer can delete this review" });
        }

        await review.deleteOne();
        return res.status(204).end();
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

export default router;