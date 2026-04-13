const User = require("../models/User");
const { smartCrawler } = require("./smartCrawler");
const { classifyText } = require("./classificationService");
const { sendEmail } = require("./emailService");

async function newsService({ email, siteUrl, topics = [] }) {
    if (!email || !siteUrl) {
        return {
            error: true,
            status: 400,
            message: "email и siteUrl са задължителни"
        };
    }

    const user = await User.findOne({ email });
    const isSubscriber = Boolean(user);

    const effectiveTopics = isSubscriber ? user.topics : topics;

    const normalizedTopics = Array.isArray(effectiveTopics)
        ? effectiveTopics.map(t => t?.toLowerCase()).filter(Boolean)
        : [];

    const articles = await smartCrawler(siteUrl);

    if (!articles?.length) {
        return {
            error: true,
            status: 404,
            message: "Няма намерени новини на този адрес"
        };
    }

    let unseenArticles = articles;

    if (isSubscriber && Array.isArray(user.lastNewsLinks)) {
        unseenArticles = articles.filter(a => !user.lastNewsLinks.includes(a.link));
    }

    if (!unseenArticles.length) {
        return {
            error: true,
            status: 200,
            message: "Няма нови статии от последното посещение"
        };
    }

    let finalArticles = unseenArticles;

    if (normalizedTopics.length > 0) {
        const llmInput = unseenArticles.map(a => ({
            title: a.title,
            link: a.link
        }));

        const classified = await classifyText(JSON.stringify(llmInput));

        const classifiedList = Array.isArray(classified)
            ? classified
            : classified?.articles || [];

        if (!classifiedList.length) {
            return {
                error: true,
                status: 200,
                message: "Няма новини, отговарящи на вашите теми"
            };
        }

        finalArticles = classifiedList.filter(a =>
            a.topic && normalizedTopics.includes(a.topic.toLowerCase())
        );
    }

    if (!finalArticles.length) {
        return {
            error: true,
            status: 200,
            message: "Няма статии за изпращане след филтриране"
        };
    }

    await sendEmail(email, finalArticles);

    if (isSubscriber) {
        const newLinks = finalArticles.map(a => a.link);

        user.lastNewsLinks = [
            ...user.lastNewsLinks,
            ...newLinks
        ].slice(-200);

        user.lastSentAt = new Date();
        await user.save();
    }

    return {
        error: false,
        status: 200,
        message: isSubscriber
            ? "Изпратени нови абонаментни статии"
            : "Изпратен еднократен имейл",
        count: finalArticles.length
    };
}

module.exports = { newsService };
