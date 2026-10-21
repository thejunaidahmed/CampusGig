import express from "express";
import Gig from "../models/Gig.js";
import Application from "../models/Application.js";
import Review from "../models/Review.js";
import authMiddleware from "../middleware/auth.js";
import expireOpenGigs from "../utils/expireOpenGigs.js";

const router = express.Router();

router.get("/", async (req, res) => {
    const { category, type, payment_type, q, minBudget, maxBudget, status, userId } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (payment_type) filter.payment_type = payment_type;
    if (status) filter.status = status;
    if (userId) filter.user_id = userId;
    if (minBudget || maxBudget) {
        filter.budget = {};
        if (minBudget) filter.budget.$gte = Number(minBudget);
        if (maxBudget) filter.budget.$lte = Number(maxBudget);
    }
    if (q) {
        filter.$or = [
            { title: { $regex: q, $options: "i" } },
            { description: { $regex: q, $options: "i" } },
        ];
    }

    await expireOpenGigs();
    const gigs = await Gig.find(filter).populate("user_id", "name major").sort({ createdAt: -1 });
    res.json(gigs);
});

router.get(
    "/:id",
    (req, res, next) => req.query.includeApps === "true" ? authMiddleware(req, res, next) : next(),
    async (req, res) => {
    await expireOpenGigs();
    const gig = await Gig.findById(req.params.id).populate("user_id", "name major semester bio skills");
    if (!gig) return res.status(404).json({ error: "Gig not found" });

    let applications = [];
    if (
        req.query.includeApps === "true" &&
        gig.user_id._id.toString() === req.user._id.toString()
    ) {
        applications = await Application.find({ gig_id: gig._id }).populate("applicant_id", "name major skills");
    }
    res.json({ ...gig.toObject(), applications });
});

router.post("/", authMiddleware, async (req, res) => {
    try {
        const { title, description, type, category, payment_type, budget, deadline } = req.body;
        if (!title || !description || !type || !category || !payment_type || !deadline) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        if (payment_type === "Paid" && (!budget || budget <= 0)) {
            return res.status(400).json({ error: "Paid gigs require a positive budget" });
        }
        const gig = await Gig.create({
            user_id: req.user._id, title, description, type, category, payment_type,
            budget: payment_type === "Paid" ? budget : null,
            deadline,
        });
        res.status(201).json(gig);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const gig = await Gig.findById(req.params.id);
        if (!gig) return res.status(404).json({ error: "Gig not found" });
        if (gig.user_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Only the gig owner can update this gig" });
        }
        if (gig.status !== "Open") {
            return res.status(400).json({ error: "Only Open gigs can be edited" });
        }

        const allowedFields = ["title", "description", "type", "category", "payment_type", "budget", "deadline"];
        const updates = Object.fromEntries(
            allowedFields
                .filter((field) => Object.hasOwn(req.body, field))
                .map((field) => [field, typeof req.body[field] === "string" ? req.body[field].trim() : req.body[field]])
        );
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: "Provide at least one gig field to update" });
        }
        if (["title", "description"].some((field) => Object.hasOwn(updates, field) && !updates[field])) {
            return res.status(400).json({ error: "Title and description cannot be empty" });
        }

        const paymentType = updates.payment_type ?? gig.payment_type;
        const budget = Object.hasOwn(updates, "budget") ? updates.budget : gig.budget;
        if (paymentType === "Paid" && (!Number.isFinite(Number(budget)) || Number(budget) <= 0)) {
            return res.status(400).json({ error: "Paid gigs require a positive budget" });
        }
        if (paymentType !== "Paid") updates.budget = null;
        if (Object.hasOwn(updates, "deadline") && new Date(updates.deadline) <= new Date()) {
            return res.status(400).json({ error: "Deadline must be in the future" });
        }

        Object.assign(gig, updates);
        await gig.save();
        return res.json(gig);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

router.patch("/:id", authMiddleware, async (req, res) => {
    try {
        await expireOpenGigs();
        const gig = await Gig.findById(req.params.id);
        if (!gig) return res.status(404).json({ error: "Gig not found" });

        if (gig.user_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Only the gig owner can modify this gig" });
        }

        const { action, applicant_id } = req.body;
        if (action === "accept") {
            if (!applicant_id) return res.status(400).json({ error: "applicant_id required" });
            if (gig.user_id.toString() === applicant_id.toString()) {
                return res.status(400).json({ error: "Gig owners cannot accept their own applications" });
            }
            if (gig.status !== "Open") return res.status(400).json({ error: "Gig is not Open" });
            if (gig.deadline < new Date()) {
                gig.status = "Expired";
                await gig.save();
                return res.status(400).json({ error: "Gig deadline has passed" });
            }

            const app = await Application.findOne({ gig_id: gig._id, applicant_id, status: "Pending" });
            if (!app) return res.status(404).json({ error: "Application not found" });

            const claimedGig = await Gig.findOneAndUpdate(
                { _id: gig._id, status: "Open", deadline: { $gte: new Date() } },
                { $set: { status: "In Progress", accepted_applicant_id: applicant_id } },
                { new: true }
            );
            if (!claimedGig) return res.status(409).json({ error: "Gig is no longer Open" });

            await Application.updateOne({ _id: app._id, status: "Pending" }, { $set: { status: "Accepted" } });
            await Application.updateMany(
                { gig_id: gig._id, _id: { $ne: app._id }, status: "Pending" },
                { $set: { status: "Rejected" } }
            );
            return res.json(claimedGig);
        }

        if (action === "reject") {
            if (!applicant_id) return res.status(400).json({ error: "applicant_id required" });
            if (gig.status !== "Open") return res.status(400).json({ error: "Gig is not accepting application decisions" });

            const result = await Application.updateOne(
                { gig_id: gig._id, applicant_id, status: "Pending" },
                { $set: { status: "Rejected" } }
            );
            if (!result.modifiedCount) return res.status(404).json({ error: "Pending application not found" });
            return res.json({ message: "Application rejected" });
        }

        if (action === "complete") {
            if (gig.status !== "In Progress") {
                return res.status(400).json({ error: "Can only complete In Progress gigs" });
            }
            gig.status = "Completed";
            await gig.save();
            return res.json(gig);
        }

        res.status(400).json({ error: "No valid action" });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const gig = await Gig.findById(req.params.id);
        if (!gig) return res.status(404).json({ error: "Gig not found" });
        if (gig.user_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Only the gig owner can delete this gig" });
        }
        if (!["Open", "Expired", "Cancelled"].includes(gig.status)) {
            return res.status(400).json({ error: "Only gigs without an active assignment can be deleted" });
        }

        const [applicationExists, reviewExists] = await Promise.all([
            Application.exists({ gig_id: gig._id }),
            Review.exists({ gig_id: gig._id }),
        ]);
        if (applicationExists || reviewExists) {
            return res.status(409).json({ error: "Gigs with application or review history cannot be deleted" });
        }

        await gig.deleteOne();
        return res.status(204).end();
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

router.post("/:id/payment", async (req, res) => {
    try {
        const { method, sender_number, trx_id } = req.body;
        if (!method || !trx_id || !sender_number) {
            return res.status(400).json({ error: "Payment method, Sender Number, and TRX ID are required." });
        }
        const gig = await Gig.findById(req.params.id);
        if (!gig) return res.status(404).json({ error: "Gig not found." });

        gig.payment_method = method;
        gig.payment_phone = "03123237006";
        gig.payment_trx_id = trx_id.trim();
        gig.payment_sender_number = sender_number.trim();
        gig.payment_status = "Paid";
        gig.payment_date = new Date();
        await gig.save();

        return res.json({ message: `Payment verified via ${method} (TRX ID: ${trx_id})`, gig });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

export default router;