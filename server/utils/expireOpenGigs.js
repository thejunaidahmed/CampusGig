import Gig from "../models/Gig.js";

export default function expireOpenGigs() {
    return Gig.updateMany(
        { status: "Open", deadline: { $lt: new Date() } },
        { $set: { status: "Expired" } }
    );
}
