import mongoose from "mongoose";

const { Schema } = mongoose;

const userModel = new Schema({
    name: {
        type: String,
        trim: true,
        required: true

    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        trim: true,
        required: true,
        min: 8,
        max: 45,
    }
}, { timestamps: true });

export default mongoose.model('users', userModel);