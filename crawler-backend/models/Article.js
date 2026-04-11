const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    link: { type: String, unique: true, required: true },
    pubDate: { type: Date, required: true },
    source: { type: String, required: true }
  },
  { timestamps: true }
);

articleSchema.index({ pubDate: -1 });


module.exports = mongoose.model("Article", articleSchema);
