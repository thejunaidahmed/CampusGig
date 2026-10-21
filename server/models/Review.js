import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    gig_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gig',
        required: true
    },
    reviewer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reviewee_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment: {
        type: String,
        default: ''
    },
}, { timestamps: true });

reviewSchema.index({ gig_id: 1, reviewer_id: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review