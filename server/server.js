import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDb from "./config/db.js";
import { seedDatabase } from "./seed.js";

import userRoutes from "./routes/users.js";
import gigRoutes from "./routes/gigs.js";
import applicationRoutes from "./routes/applications.js";
import reviewRoutes from "./routes/reviews.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/gigs", gigRoutes);
app.use("/applications", applicationRoutes);
app.use("/reviews", reviewRoutes);

app.get("/", (_, res) => res.json({ ok: true, service: "Campus Gig API" }));

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDb();
        await seedDatabase(false);
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port: ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Server initialization failed:", error.message);
        process.exit(1);
    }
};

startServer();