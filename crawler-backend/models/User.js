const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    lastSentAt: { type: Date, default: null },
    lastNewsIds: { type: [String], default: [] } // store IDs of last sent articles
});

module.exports = mongoose.model("User", userSchema);
