import mongoose from "mongoose";

const gigSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Offering', 'Requesting'],
        required: true
    },
    category: {
        type: String,
        enum: ['Programming', 'Design', 'Writing', 'Tutoring'],
        required: true
    },
    payment_type: {
        type: String,
        enum: ['Paid', 'SkillSwap', 'Free'],
        required: true
    },
    budget: {
        type: Number,
        default: null
    },
    deadline: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Completed', 'Expired', 'Cancelled'],
        default: 'Open'
    },
    accepted_applicant_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    // Pakistan EasyPaisa / JazzCash payment details
    payment_status: {
        type: String,
        enum: ['Unpaid', 'Pending_Verification', 'Paid'],
        default: 'Unpaid'
    },
    payment_method: {
        type: String,
        enum: ['EasyPaisa', 'JazzCash', 'None'],
        default: 'None'
    },
    payment_phone: {
        type: String,
        default: '03123237006'
    },
    payment_trx_id: {
        type: String,
        default: ''
    },
    payment_sender_number: {
        type: String,
        default: ''
    },
    payment_date: {
        type: Date,
        default: null
    }
}, { timestamps: true });

const Gig = mongoose.model('Gig', gigSchema);
export default Gig;