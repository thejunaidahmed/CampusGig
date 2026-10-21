import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Access denied. No token provided." });
        }
        const token = authHeader.split(" ")[1];
        const secret = process.env.JWT_SECRET || "campus_gig_secret_jwt_key_2026_pakistan";
        const decoded = jwt.verify(token, secret);
        const user = await User.findById(decoded.id).select("-password");
        if (!user) return res.status(401).json({ error: "Invalid token. User not found." });
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Session expired or invalid token. Please log in again." });
    }
};

export default authMiddleware;