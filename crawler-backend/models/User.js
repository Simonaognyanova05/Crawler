const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    topics: { type: [String], default: [] },
    lastSentAt: { type: Date, default: null },
    lastNewsIds: { type: [String], default: [] }
});

module.exports = mongoose.model("User", userSchema);
