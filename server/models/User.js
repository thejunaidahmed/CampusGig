import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        default: '03123237006'
    },
    easypaisa_number: {
        type: String,
        default: '03123237006'
    },
    jazzcash_number: {
        type: String,
        default: '03123237006'
    },
    major: {
        type: String,
        required: true,
        default: 'Computer Science'
    },
    semester: {
        type: Number,
        required: true,
        default: 4
    },
    bio: {
        type: String,
        default: 'University student exploring campus gigs and tech collaborations.'
    },
    skills: {
        type: [String],
        default: ['Web Development', 'Problem Solving']
    },
}, { timestamps: true });

// Hash password before saving if modified
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;