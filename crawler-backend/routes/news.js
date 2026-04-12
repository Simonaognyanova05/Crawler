const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { smartCrawl } = require("../services/smartCrawler");
const { classifyText } = require("../services/classificationService");
const { sendEmail } = require("../services/emailService");

// ----------------------
// SUBSCRIBE / UPDATE
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
                topics: Array.isArray(topics) ? topics.map(t => t.toLowerCase()) : [],
                siteUrl,
                subscribed: true
            },
            { upsert: true, new: true }
        );

        res.json({ success: true, message: "Абонаментът е успешен", user });
    } catch (err) {
        res.status(500).json({ error: "Грешка при абониране" });
    }
});

// ----------------------
// FETCH & SEND NEWS (Унифициран маршрут)
// ----------------------
router.post("/fetch-news", async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "Потребителят не е намерен" });

        console.log(`📡 Скрапване на: ${user.siteUrl} за ${email}`);

        // 1. SCRAPE
        const articles = await smartCrawl(user.siteUrl);
        if (!articles || !articles.length) {
            return res.status(404).json({ error: "Няма намерени статии в сайта. Опитайте по-късно." });
        }

        // 2. FILTER ALREADY SENT
        const unseenArticles = articles.filter(a => !user.lastNewsLinks.includes(a.link));

        if (!unseenArticles.length) {
            return res.status(200).json({ message: "Няма нови статии от последното изпращане." });
        }

        // 3. CLASSIFY чрез AI
        const normalizedTopics = user.topics || [];
        let filteredArticles = [];

        if (normalizedTopics.length > 0) {
            const llmInput = unseenArticles.map(a => ({
                title: a.title,
                link: a.link
            }));

            // classifyText вече връща масив благодарение на последните фиксове
            const classified = await classifyText(JSON.stringify(llmInput));

            if (Array.isArray(classified) && classified.length > 0) {
                // Филтрираме само тези, които съвпадат с темите на потребителя
                filteredArticles = classified.filter(a =>
                    a.topic && normalizedTopics.includes(a.topic.toLowerCase())
                );
            }
        } else {
            // Ако потребителят няма избрани теми, пращаме всичко ново (или първите 5)
            filteredArticles = unseenArticles.slice(0, 10);
        }

        if (!filteredArticles.length) {
            return res.status(200).json({ message: "Новите статии не съвпадат с Вашите теми." });
        }

        // 4. SEND EMAIL
        // ВАЖНО: Вече пращаме масива filteredArticles, а НЕ HTML стринг
        await sendEmail(user.email, filteredArticles);

        // 5. UPDATE USER HISTORY
        const updatedLinks = [...user.lastNewsLinks, ...filteredArticles.map(a => a.link)];
        user.lastNewsLinks = updatedLinks.slice(-200);
        user.lastSentAt = new Date();
        await user.save();

        res.json({
            success: true,
            message: `Успешно изпратени ${filteredArticles.length} новини.`,
            sentCount: filteredArticles.length
        });

    } catch (err) {
        console.error("❌ Грешка при обработка на новините:", err);
        res.status(500).json({ error: "Вътрешна сървърна грешка при изпращане." });
    }
});

// ----------------------
// UNSUBSCRIBE
// ----------------------
router.post("/unsubscribe", async (req, res) => {
    const { email } = req.body;
    try {
        await User.findOneAndUpdate({ email }, { subscribed: false });
        res.json({ success: true, message: "Успешно отписване." });
    } catch (err) {
        res.status(500).json({ error: "Грешка при отписване." });
    }
});

module.exports = router;