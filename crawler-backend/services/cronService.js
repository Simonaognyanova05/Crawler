const User = require("../models/User");
const { smartCrawler } = require("./smartCrawler");
const { classifyText } = require("./classificationService");
const { sendEmail } = require("./emailService");

async function processDailyNews() {
    try {
        const subscribers = await User.find({ subscribed: true });
        if (!subscribers.length) {
            console.log("Няма активни абонати.");
            return;
        }

        for (const user of subscribers) {
            console.log(`\nОбработка на абонат: ${user.email}`);

            try {
                const rawArticles = await smartCrawler(user.siteUrl);
                if (!rawArticles?.length) {
                    console.log("Няма намерени статии.");
                    continue;
                }

                const unseen = rawArticles.filter(a => !user.lastNewsLinks.includes(a.link));
                if (!unseen.length) {
                    console.log("Няма нови статии.");
                    continue;
                }

                const llmInput = unseen.map(a => ({
                    title: a.title,
                    link: a.link
                }));

                const classified = await classifyText(JSON.stringify(llmInput));
                if (!classified) {
                    console.log("Класификацията върна празен резултат.");
                    continue;
                }

                const finalArticles = (Array.isArray(classified)
                    ? classified
                    : classified.articles || []
                ).filter(a =>
                    user.topics.includes(a.topic?.toLowerCase())
                );

                if (!finalArticles.length) {
                    console.log("Няма статии по интересите на потребителя.");
                    continue;
                }

                await sendEmail(user.email, finalArticles);
                console.log(`Изпратени ${finalArticles.length} статии.`);
                const newLinks = finalArticles.map(a => a.link);

                user.lastNewsLinks = [
                    ...user.lastNewsLinks,
                    ...newLinks
                ].slice(-200); 

                user.lastSentAt = new Date();
                await user.save();

            } catch (err) {
                console.error(`Грешка при обработка на ${user.email}:`, err.message);
            }
        }

    } catch (err) {
        console.error("Критична грешка в Cron задачата:", err.message);
    }
}

module.exports = { processDailyNews };
