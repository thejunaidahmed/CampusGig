import express from "express";
import Application from "../models/Application.js";
import Gig from "../models/Gig.js";
import authMiddleware from "../middleware/auth.js";
import expireOpenGigs from "../utils/expireOpenGigs.js";

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
    try {
        await expireOpenGigs();
        const { gig_id, message } = req.body;
        if (!gig_id || !message?.trim()) {
            return res.status(400).json({ error: "Missing fields" });
        }

        const gig = await Gig.findById(gig_id);
        if (!gig) return res.status(404).json({ error: "Gig not found" });
        if (gig.status !== "Open") return res.status(400).json({ error: "Gig is not accepting applications" });
        if (gig.user_id.toString() === req.user._id.toString()) {
            return res.status(400).json({ error: "Cannot apply to your own gig" });
        }

        const existing = await Application.findOne({ gig_id, applicant_id: req.user._id });
        if (existing) return res.status(409).json({ error: "You already applied to this gig" });

        const app = await Application.create({
            gig_id,
            applicant_id: req.user._id,
            message: message.trim(),
        });
        res.status(201).json(app);
    } catch (e) {
        if (e.code === 11000) {
            return res.status(409).json({ error: "You already applied to this gig" });
        }
        res.status(400).json({ error: e.message });
    }
});

router.get("/", authMiddleware, async (req, res) => {
    await expireOpenGigs();
    const { applicant_id, gig_id } = req.query;
    const filter = {};
    const userId = req.user._id.toString();

    if (applicant_id && applicant_id !== userId) {
        return res.status(403).json({ error: "You can only view your own applications" });
    }
    if (applicant_id) filter.applicant_id = userId;

    if (gig_id) {
        const gig = await Gig.findById(gig_id);
        if (!gig) return res.status(404).json({ error: "Gig not found" });
        if (gig.user_id.toString() !== userId) {
            return res.status(403).json({ error: "Only the gig owner can view its applications" });
        }
        filter.gig_id = gig._id;
    }

    if (!applicant_id && !gig_id) filter.applicant_id = req.user._id;

    const apps = await Application.find(filter)
        .populate("gig_id", "title status category type payment_type deadline")
        .populate("applicant_id", "name major")
        .sort({ createdAt: -1 });
    res.json(apps);
});

router.patch("/:id", authMiddleware, async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);
        if (!application) return res.status(404).json({ error: "Application not found" });
        if (application.applicant_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Only the applicant can edit this application" });
        }
        if (application.status !== "Pending") {
            return res.status(400).json({ error: "Only Pending applications can be edited" });
        }
        if (typeof req.body.message !== "string" || !req.body.message.trim()) {
            return res.status(400).json({ error: "A non-empty message is required" });
        }

        application.message = req.body.message.trim();
        await application.save();
        return res.json(application);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);
        if (!application) return res.status(404).json({ error: "Application not found" });
        if (application.applicant_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Only the applicant can withdraw this application" });
        }
        if (application.status !== "Pending") {
            return res.status(400).json({ error: "Only Pending applications can be withdrawn" });
        }

        application.status = "Withdrawn";
        await application.save();
        return res.status(204).end();
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

export default router;