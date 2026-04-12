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


// ----------------------
// ROUTES
// ----------------------

app.use("/", fetchNewsRoutes);

app.use("/", newsRoutes);


// ----------------------
// DAILY CRON (8:00 AM)
// ----------------------

// ----------------------
// DAILY CRON (8:00 AM)
// ----------------------

cron.schedule("42 10 * * *", async () => {
    console.log("📅 Running daily news job...");

    try {
        const users = await User.find({ subscribed: true });

        for (const user of users) {
            try {
                console.log("Processing:", user.email);

                const normalizedTopics = Array.isArray(user.topics)
                    ? user.topics.map(t => t?.toLowerCase()).filter(Boolean)
                    : [];

                // 1. SCRAPE
                const articles = await smartCrawl(user.siteUrl);

                if (!articles.length) {
                    console.log("No articles found for:", user.email);
                    continue;
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
                    console.log("No new articles for:", user.email);
                    continue;
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

                console.log("📧 Sent:", user.email);

            } catch (err) {
                console.error("User processing error:", user.email, err.message);
            }
        }

    } catch (err) {
        console.error("Daily job error:", err.message);
    }

}, {
    timezone: "Europe/Sofia"
});



// ----------------------
// MongoDB
// ----------------------

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
    });


// ----------------------
// ERROR HANDLER
// ----------------------

app.use((err, req, res, next) => {
    console.error("Server error:", err.stack);

    res.status(500).json({
        error: "Something went wrong on the server."
    });
});


// ----------------------
// SERVER START
// ----------------------

const PORT = process.env.PORT || 3030;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Local link: http://localhost:${PORT}`);
});