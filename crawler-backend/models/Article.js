const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    link: { type: String, unique: true },
    pubDate: Date,
    source: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Article", articleSchema);
