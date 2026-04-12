require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");

const User = require("./models/User");
const { smartCrawl } = require("./services/smartCrawler");
const { classifyText } = require("./services/classificationService");
const { sendEmail } = require("./services/emailService");

const fetchNewsRoutes = require("./routes/fetchNews");
const newsRoutes = require("./routes/news");

const app = express();
app.use(cors());
app.use(express.json());

// ROUTES
app.use("/", fetchNewsRoutes);
app.use("/", newsRoutes);

// ----------------------
// DAILY CRON (Автоматизирано изпращане)
// ----------------------
cron.schedule("16 12 * * *", async () => {
    console.log("📅 Стартиране на ежедневната задача за новини...");

    try {
        const subscribers = await User.find({ subscribed: true });

        // В кода, където обхождаш абонатите (Cron Job)
        for (const user of subscribers) {
            try {
                console.log(`Процесиране на абонат: ${user.email}`);

                const rawArticles = await smartCrawl(user.siteUrl);
                if (!rawArticles || rawArticles.length === 0) continue;

                // Филтриране на вече изпратени
                const unseen = rawArticles.filter(a => !user.lastNewsLinks.includes(a.link));
                if (unseen.length === 0) continue;

                // Класификация
                const llmInput = unseen.map(a => ({ title: a.title, link: a.link }));

                // ВАЖНО: Тук classifyText връща масив благодарение на нашия фикс
                const classified = await classifyText(JSON.stringify(llmInput));

                // ТУК Е ФИКСЪТ: Проверка дали наистина е масив преди филтриране
                let finalArticles = [];
                if (Array.isArray(classified)) {
                    finalArticles = classified.filter(a =>
                        user.topics.includes(a.topic?.toLowerCase())
                    );
                } else if (classified && classified.articles) {
                    // Защита, ако случайно върне обекта {"articles": [...]}
                    finalArticles = classified.articles.filter(a =>
                        user.topics.includes(a.topic?.toLowerCase())
                    );
                }

                if (finalArticles.length > 0) {
                    // Изпращане - тук sendEmail очаква МАСИВ
                    await sendEmail(user.email, finalArticles);

                    // Обновяване на историята
                    user.lastNewsLinks = [...user.lastNewsLinks, ...finalArticles.map(a => a.link)].slice(-200);
                    user.lastSentAt = new Date();
                    await user.save();
                }
            } catch (err) {
                console.error(`❌ Грешка при обработка на потребител ${user.email}:`, err.message);
            }
        }
    } catch (err) {
        console.error("❌ Критична грешка в Cron задачата:", err.message);
    }
}, {
    timezone: "Europe/Sofia"
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB свързана успешно"))
    .catch(err => console.error("❌ MongoDB грешка:", err));

// SERVER START
const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
    console.log(`🚀 Сървърът е активен на: http://localhost:${PORT}`);
});