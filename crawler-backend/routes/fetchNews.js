const express = require("express");
const router = express.Router();

const User = require("../models/User");
const { smartCrawl } = require("../services/smartCrawler");
const { classifyText } = require("../services/classificationService");
const { sendEmail } = require("../services/emailService");

// ----------------------------
// SAFE JSON PARSE
// ----------------------------
function safeJsonParse(str) {
    try {
        return JSON.parse(str);
    } catch {
        return null;
    }
}

router.post("/fetch-news", async (req, res, next) => {
    try {
        const { email, siteUrl, topics = [] } = req.body;

        if (!email || !siteUrl) {
            return res.status(400).json({ error: "email и siteUrl са задължителни" });
        }

        // ----------------------------
        // USER
        // ----------------------------
        let user = await User.findOne({ email });
        const isSubscriber = Boolean(user);

        const effectiveTopics = isSubscriber ? user.topics : topics;

        const normalizedTopics = Array.isArray(effectiveTopics)
            ? effectiveTopics.map(t => t?.toLowerCase()).filter(Boolean)
            : [];

        // ----------------------------
        // SCRAPE
        // ----------------------------
        const articles = await smartCrawl(siteUrl);

        if (!articles.length) {
            return res.status(404).json({ error: "Няма намерени новини" });
        }

        let filteredArticles = articles;

        // ----------------------------
        // CLASSIFY (ONLY FOR HACKER NEWS)
        // ----------------------------
        const isHackerNews =
            siteUrl.includes("hnrss") ||
            siteUrl.includes("news.ycombinator.com");

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

        // ----------------------------
        // REMOVE ALREADY SENT
        // ----------------------------
        let finalArticles = filteredArticles;

        if (isSubscriber) {
            finalArticles = filteredArticles.filter(
                a => !user.lastNewsLinks.includes(a.link)
            );
        }

        if (finalArticles.length === 0) {
            return res.json({ message: "Няма нови статии за изпращане" });
        }

        // ----------------------------
        // SEND EMAIL
        // ----------------------------
        const html = `
            <h2>Вашите новини</h2>
            <ul>
                ${finalArticles.map(a => `<li><a href="${a.link}">${a.title}</a></li>`).join("")}
            </ul>
        `;

        await sendEmail(email, html);

        // ----------------------------
        // SAVE USER
        // ----------------------------
        if (isSubscriber) {
            user.lastNewsLinks.push(...finalArticles.map(a => a.link));
            user.lastSentAt = new Date();
            await user.save();
        }

        return res.json({
            message: isSubscriber ? "Изпратени нови статии" : "Изпратен еднократен имейл",
            count: finalArticles.length
        });

    } catch (err) {
        console.error("Fetch news error:", err);
        next(err);
    }
});

module.exports = router;
