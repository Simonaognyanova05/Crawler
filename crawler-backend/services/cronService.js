const User = require("../models/User");
const { smartCrawler } = require("./smartCrawler");
const { classifyText } = require("./classificationService");
const { sendEmail } = require("./emailService");

async function processDailyNews() {
    try {
        const subscribers = await User.find({ subscribed: true });

        for (const user of subscribers) {
            try {
                console.log(`Процесиране на абонат: ${user.email}`);

                const rawArticles = await smartCrawler(user.siteUrl);
                if (!rawArticles || rawArticles.length === 0) continue;

                const unseen = rawArticles.filter(a => !user.lastNewsLinks.includes(a.link));
                if (unseen.length === 0) continue;

                const llmInput = unseen.map(a => ({ title: a.title, link: a.link }));
                const classified = await classifyText(JSON.stringify(llmInput));

                let finalArticles = [];

                if (Array.isArray(classified)) {
                    finalArticles = classified.filter(a =>
                        user.topics.includes(a.topic?.toLowerCase())
                    );
                } else if (classified && classified.articles) {
                    finalArticles = classified.articles.filter(a =>
                        user.topics.includes(a.topic?.toLowerCase())
                    );
                }

                if (finalArticles.length > 0) {
                    await sendEmail(user.email, finalArticles);

                    user.lastNewsLinks = [
                        ...user.lastNewsLinks,
                        ...finalArticles.map(a => a.link)
                    ].slice(-200);

                    user.lastSentAt = new Date();
                    await user.save();
                }

            } catch (err) {
                console.error(`Грешка при обработка на потребител ${user.email}:`, err.message);
            }
        }
    } catch (err) {
        console.error("Критична грешка в Cron задачата:", err.message);
    }
}

module.exports = { processDailyNews };
