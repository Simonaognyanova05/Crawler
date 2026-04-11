const express = require("express");
const router = express.Router();

const Article = require("../models/Article");
const { scrapeHackerNews } = require("../services/hackerNewsScraper");
const { classifyText } = require("../services/classificationService");
const { sendEmail } = require("../services/emailService");
const User = require("../models/User");

// ----------------------
// SAFE JSON PARSE HELPER
// ----------------------
function safeJsonParse(str) {
    try {
        return JSON.parse(str);
    } catch (err) {
        console.error("❌ JSON parse error:", err.message);
        console.error("❌ Received text from LLM:", str);
        return null;
    }
}

// ----------------------
// EMAIL HTML GENERATOR
// ----------------------
function generateEmailHtml(articles) {
    return `
        <h2>Today's Hacker News Updates</h2>
        <ul>
            ${articles
            .map(a => `<li><a href="${a.link}">${a.title}</a></li>`)
            .join("")}
        </ul>
    `;
}

// ----------------------
// SUBSCRIBE
// ----------------------
router.post("/subscribe", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    try {
        const user = await User.findOneAndUpdate(
            { email },
            { email },
            { upsert: true, new: true }
        );

        res.json({ success: true, message: "Subscribed successfully", user });
    } catch (err) {
        res.status(500).json({ error: "Failed to subscribe" });
    }
});

// ----------------------
// UNSUBSCRIBE (DELETE USER)
// ----------------------
router.post("/unsubscribe", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    try {
        const deleted = await User.findOneAndDelete({ email });

        if (!deleted) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ success: true, message: "User unsubscribed and removed." });
    } catch (err) {
        res.status(500).json({ error: "Failed to unsubscribe" });
    }
});

// ----------------------
// SEND HACKER NEWS
// ----------------------
router.post("/send-hacker-news", async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    try {
        // 1. Scrape
        const scrapedArticles = await scrapeHackerNews();

        // 2. Save to DB
        await Article.deleteMany({});
        await Article.insertMany(scrapedArticles);

        // 3. Classify with LLM
        const classifiedText = await classifyText(JSON.stringify(scrapedArticles));

        // 4. Safe JSON parse
        let classifiedArticles = safeJsonParse(classifiedText);

        // ❗ Fallback: ако LLM върне текст → не спираме процеса
        if (!classifiedArticles) {
            console.warn("⚠️ LLM did NOT return JSON. Falling back to empty list.");
            classifiedArticles = [];
        }

        // 5. Filter only new ones
        const newArticles = classifiedArticles.filter(
            a => !user.lastNewsIds.includes(a.id)
        );

        if (newArticles.length === 0) {
            return res.json({ success: true, message: "No new articles" });
        }

        // 6. Send email (HTML instead of array)
        const html = generateEmailHtml(newArticles);
        await sendEmail(email, html);

        // 7. Update user
        user.lastNewsIds = newArticles.map(a => a.id);
        user.lastSentAt = new Date();
        await user.save();

        res.json({ success: true, sent: newArticles.length });

    } catch (err) {
        console.error("❌ Error in /send-hacker-news:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
