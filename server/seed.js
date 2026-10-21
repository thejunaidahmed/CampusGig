import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import User from "./models/User.js";
import Gig from "./models/Gig.js";
import Application from "./models/Application.js";
import Review from "./models/Review.js";

dotenv.config();

const categories = ["Programming", "Design", "Writing", "Tutoring"];
const types = ["Offering", "Requesting"];
const payments = ["Paid", "SkillSwap", "Free"];
const firstNames = ["Aisha", "Bilal", "Chen", "Dana", "Ehsan", "Fatima", "Ghulam", "Hina", "Imran", "Jia", "Kiran", "Leo"];
const majors = ["CS", "SE", "Design", "English Lit", "Business", "Math", "EE", "Mass Comm"];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export async function seedDatabase(force = false) {
    const existingUsers = await User.countDocuments();
    if (!force && existingUsers > 0) {
        console.log(`ℹ️ Database already populated with ${existingUsers} users. Auto-seed skipped.`);
        return;
    }

    console.log("🌱 Populating database with sample users and gigs...");
    await User.deleteMany({});
    await Gig.deleteMany({});
    await Application.deleteMany({});
    await Review.deleteMany({});

    // 12 users
    const users = [];
    for (let i = 0; i < 12; i++) {
        users.push(await User.create({
            name: `${firstNames[i]} ${String.fromCharCode(65 + i)}.`,
            email: `user${i + 1}@campus.edu`,
            password: "password123",
            phone: "03123237006",
            easypaisa_number: "03123237006",
            jazzcash_number: "03123237006",
            major: pick(majors),
            semester: randInt(1, 8),
            bio: `Student ${i + 1} — ${pick(["loves coding", "into design", "a wordsmith", "tutoring math"])}`,
            skills: [pick(["React", "Node", "Figma", "Photoshop", "Copywriting", "Editing", "Calculus", "Physics"])],
        }));
    }

    // 25 gigs
    const statuses = ["Open", "Open", "Open", "In Progress", "Completed", "Completed", "Open", "Cancelled"];
    const gigs = [];
    for (let i = 0; i < 25; i++) {
        const payment = pick(payments);
        const deadline = new Date(Date.now() + randInt(-30, 60) * 86400000);
        gigs.push(await Gig.create({
            user_id: pick(users)._id,
            title: `${pick(["Need", "Offering", "Looking for"])} ${pick(["help with", "services in"])} ${pick(["React app", "poster design", "essay editing", "calculus tutoring", "bug fixing", "logo"])}`,
            description: `Detailed description for gig #${i + 1}. Legitimate need or offer for a short-term campus task.`,
            type: pick(types),
            category: pick(categories),
            payment_type: payment,
            budget: payment === "Paid" ? randInt(500, 5000) : null,
            deadline,
            status: pick(statuses),
        }));
    }

    // 20 applications
    const appKeys = new Set();
    let appCount = 0;
    let guard = 0;
    while (appCount < 20 && guard < 500) {
        guard++;
        const gig = pick(gigs);
        const applicant = pick(users);
        if (gig.user_id.toString() === applicant._id.toString()) continue;
        if (gig.status === "Completed" || gig.status === "Cancelled") continue;
        const key = `${gig._id}_${applicant._id}`;
        if (appKeys.has(key)) continue;
        appKeys.add(key);
        await Application.create({
            gig_id: gig._id,
            applicant_id: applicant._id,
            message: `Hi! I'm keen to help — ${pick(["I have experience", "I can start today", "I love this category"])}.`,
            status: "Pending",
        });
        appCount++;
    }

    // 8 reviews on Completed gigs (two-way)
    const completed = await Gig.find({ status: "Completed" }).limit(8);
    for (const gig of completed) {
        if (!gig.accepted_applicant_id) {
            const applicant = pick(users);
            if (applicant._id.toString() === gig.user_id.toString()) continue;
            gig.accepted_applicant_id = applicant._id;
            await gig.save();
        }
        try {
            await Review.create({
                gig_id: gig._id, reviewer_id: gig.user_id, reviewee_id: gig.accepted_applicant_id,
                rating: randInt(3, 5), comment: "Great collaboration, would work with again.",
            });
            await Review.create({
                gig_id: gig._id, reviewer_id: gig.accepted_applicant_id, reviewee_id: gig.user_id,
                rating: randInt(3, 5), comment: "Clear instructions, on time.",
            });
        } catch (e) { /* ignore dupes */ }
    }

    const counts = {
        users: await User.countDocuments(),
        gigs: await Gig.countDocuments(),
        applications: await Application.countDocuments(),
        reviews: await Review.countDocuments(),
    };
    console.log("✅ Seed complete:", counts);
}

// Standalone: node seed.js
const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectRun) {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => seedDatabase(true))
        .then(() => mongoose.disconnect())
        .catch((e) => { console.error("Seed error:", e); process.exit(1); });
}