import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
    gig_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gig',
        required: true
    },
    applicant_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected', 'Withdrawn'],
        default: 'Pending'
    },
}, { timestamps: true });

applicationSchema.index({ gig_id: 1, applicant_id: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);
export default Application