const express = require("express");
const router = express.Router();

const Article = require("../models/Article");
const { scrapeHackerNews } = require("../services/hackerNewsScraper");
const { classifyText } = require("../services/classificationService");
const { sendEmail } = require("../services/emailService");


// 📌 Main endpoint: scrape → save → classify → send email
router.post("/send-hacker-news", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    try {
        // 1) Scrape the latest 140 articles
        const scrapedArticles = await scrapeHackerNews();

        // 2) Clear old articles and save the new ones
        await Article.deleteMany({});
        await Article.insertMany(scrapedArticles);

        // 3) Prepare text for LLM
        const textForLLM = scrapedArticles
            .map(a => `${a.title} — ${a.link}`)
            .join("\n");

        // 4) LLM filters only hacker-related news
        const classified = await classifyText(textForLLM);

        // 5) Prepare HTML email
        const html = `
            <h2>Latest Hacker-Related News</h2>
            <p>Here are the articles selected by the AI:</p>
            <pre style="font-size: 15px; white-space: pre-wrap;">${classified}</pre>
        `;

        // 6) Send email
        await sendEmail(email, html);

        res.json({ success: true, message: "Hacker news sent successfully" });

    } catch (err) {
        console.error("Error sending hacker news:", err);
        res.status(500).json({ error: "Failed to send hacker news" });
    }
});

module.exports = router;
