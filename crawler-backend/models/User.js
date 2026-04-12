const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },

    topics: {
        type: [String],
        default: []
    },

    siteUrl: {
        type: String,
        required: true
    },

    subscribed: {
        type: Boolean,
        default: true
    },

    lastNewsLinks: {
        type: [String],
        default: []
    },

    lastNewsIds: {
        type: [String],
        default: []
    },

    lastSentAt: {
        type: Date,
        default: null
    }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);