const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { smartCrawl } = require("../services/smartCrawler");
const { classifyText } = require("../services/classificationService");
const { sendEmail } = require("../services/emailService");

router.post("/fetch-news", async (req, res, next) => {
    try {
        const { email, siteUrl, topics = [] } = req.body;

        if (!email || !siteUrl) {
            return res.status(400).json({ error: "email и siteUrl са задължителни" });
        }

        // 1. ПОТРЕБИТЕЛ И ТЕМИ
        let user = await User.findOne({ email });
        const isSubscriber = Boolean(user);

        // Вземаме темите от базата ако е абонат, иначе от тялото на заявката
        const effectiveTopics = isSubscriber ? user.topics : topics;
        const normalizedTopics = Array.isArray(effectiveTopics)
            ? effectiveTopics.map(t => t?.toLowerCase()).filter(Boolean)
            : [];

        // 2. SCRAPE
        console.log(`🔍 Извличане от: ${siteUrl}`);
        const articles = await smartCrawl(siteUrl);

        if (!articles || !articles.length) {
            return res.status(404).json({ error: "Няма намерени новини на този адрес" });
        }

        // 3. ПЪРВОНАЧАЛНО ФИЛТРИРАНЕ (Махаме вече изпратените)
        let unseenArticles = articles;
        if (isSubscriber && user.lastNewsLinks) {
            unseenArticles = articles.filter(a => !user.lastNewsLinks.includes(a.link));
        }

        if (unseenArticles.length === 0) {
            return res.status(200).json({ message: "Няма нови статии от последното посещение" });
        }

        // 4. CLASSIFICATION (Ако има избрани теми)
        let finalArticles = unseenArticles;

        if (normalizedTopics.length > 0) {
            const llmInput = unseenArticles.map(a => ({
                title: a.title,
                link: a.link
            }));

            // Използваме фиксирания classifyText
            const classified = await classifyText(JSON.stringify(llmInput));

            if (Array.isArray(classified) && classified.length > 0) {
                finalArticles = classified.filter(a =>
                    a.topic && normalizedTopics.includes(a.topic.toLowerCase())
                );
            } else {
                console.log("ℹ️ LLM не откри съвпадения по теми.");
                return res.status(200).json({ message: "Няма новини, отговарящи на вашите теми" });
            }
        }

        if (finalArticles.length === 0) {
            return res.status(200).json({ message: "Няма статии за изпращане след филтриране" });
        }

        // 5. SEND EMAIL
        // Подаваме САМО email и масива finalArticles. 
        // emailService ще генерира HTML-а сам.
        await sendEmail(email, finalArticles);

        // 6. SAVE PROGRESS (Само за абонати)
        if (isSubscriber) {
            const updatedLinks = [...user.lastNewsLinks, ...finalArticles.map(a => a.link)];
            user.lastNewsLinks = updatedLinks.slice(-200);
            user.lastSentAt = new Date();
            await user.save();
        }

        return res.json({
            success: true,
            message: isSubscriber ? "Изпратени нови абонаментни статии" : "Изпратен еднократен имейл",
            count: finalArticles.length
        });

    } catch (err) {
        console.error("❌ Fetch news error:", err);
        res.status(500).json({ error: "Възникна грешка при обработката на новините" });
    }
});

module.exports = router;