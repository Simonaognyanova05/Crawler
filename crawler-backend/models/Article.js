const mongoose = require("mongoose");

const ArticleSchema = new mongoose.Schema({
  siteUrl: { type: String, required: true },
  title: String,
  description: String,
  link: { type: String, unique: true },
  publishedAt: Date,
  topic: String,
}, { timestamps: true });

module.exports = mongoose.model("Article", ArticleSchema);
