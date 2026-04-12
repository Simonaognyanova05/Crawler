const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      sparse: true
    },

    title: {
      type: String,
      required: true
    },

    description: {
      type: String,
      default: ""
    },

    link: {
      type: String,
      unique: true,
      required: true
    },

    topic: {
      type: String,
      default: null
    },

    pubDate: {
      type: Date,
      required: true
    },

    source: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

articleSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Article", articleSchema);