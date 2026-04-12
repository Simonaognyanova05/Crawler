const express = require("express");
const router = express.Router();

const User = require("../models/User");
const { smartCrawl } = require("../services/smartCrawler");
const { classifyText } = require("../services/classificationService");
const { sendEmail } = require("../services/emailService");

// ----------------------
// SAFE JSON PARSE
// ----------------------
function safeJsonParse(str) {
    try {
        return JSON.parse(str);
    } catch {
        return null;
    }
}

// ----------------------
// SUBSCRIBE (email + siteUrl + topics)
// ----------------------
router.post("/subscribe", async (req, res) => {
    const { email, topics, siteUrl } = req.body;

    if (!email || !siteUrl) {
        return res.status(400).json({ error: "Email и siteUrl са задължителни" });
    }

    try {
        const user = await User.findOneAndUpdate(
            { email },
            {
                email,
                topics: topics || [],
                siteUrl,
                subscribed: true,
                lastNewsLinks: []
            },
            { upsert: true, returnDocument: "after" }
        );

        res.json({ success: true, message: "Subscribed successfully", user });
    } catch (err) {
        res.status(500).json({ error: "Failed to subscribe" });
    }
});

// ----------------------
// UNSUBSCRIBE
// ----------------------
router.post("/unsubscribe", async (req, res) => {
    const { email } = req.body;

    if (!email) return res.status(400).json({ error: "Email is required" });

    try {
        const deleted = await User.findOneAndDelete({ email });

        if (!deleted) return res.status(404).json({ error: "User not found" });

        res.json({ success: true, message: "User unsubscribed" });
    } catch {
        res.status(500).json({ error: "Failed to unsubscribe" });
    }
});

// ----------------------
// DAILY NEWS (UNIVERSAL)
// ----------------------
router.post("/send-daily-news", async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.siteUrl) {
        return res.status(400).json({ error: "User has no siteUrl set" });
    }

    const normalizedTopics = Array.isArray(user.topics)
        ? user.topics.map(t => t?.toLowerCase()).filter(Boolean)
        : [];

    try {
        console.log("📡 Crawling:", user.siteUrl);

        // 1. SCRAPE
        const articles = await smartCrawl(user.siteUrl);

        if (!articles.length) {
            return res.json({ success: false, message: "No articles found" });
        }

        let filteredArticles = articles;

        // 2. CLASSIFY ONLY IF SITE IS HACKER NEWS
        const isHackerNews =
            user.siteUrl.includes("hnrss") ||
            user.siteUrl.includes("news.ycombinator.com");

        if (normalizedTopics.length > 0 && isHackerNews) {
            const llmInput = articles.map(a => ({
                title: a.title,
                link: a.link,
                description: a.description
            }));

            let classified = await classifyText(JSON.stringify(llmInput));
            const parsed = safeJsonParse(classified);

            if (!parsed || !Array.isArray(parsed)) {
                console.log("⚠ LLM returned empty → skipping classification");
                filteredArticles = articles;
            } else {
                filteredArticles = parsed.filter(a =>
                    a.topic &&
                    normalizedTopics.includes(a.topic.toLowerCase())
                );
            }
        }

        // 3. REMOVE ALREADY SENT
        const newArticles = filteredArticles.filter(
            a => !user.lastNewsLinks.includes(a.link)
        );

        if (!newArticles.length) {
            return res.json({ success: true, message: "No new articles" });
        }

        // 4. EMAIL HTML
        const html = `
            <h2>Your Daily News</h2>
            <ul>
                ${newArticles
                    .map(a => `<li><a href="${a.link}">${a.title}</a></li>`)
                    .join("")}
            </ul>
        `;

        // 5. SEND EMAIL
        await sendEmail(user.email, html);

        // 6. UPDATE USER
        user.lastNewsLinks.push(...newArticles.map(a => a.link));
        user.lastSentAt = new Date();
        await user.save();

        res.json({ success: true, sent: newArticles.length });

    } catch (err) {
        console.error("❌ Daily news error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
