const User = require("../models/User");
const { smartCrawler } = require("./smartCrawler");
const { classifyText } = require("./classificationService");
const { sendEmail } = require("./emailService");

async function subscribeUserService(email, topics, siteUrl) {
    return User.findOneAndUpdate(
        { email },
        {
            email,
            topics: Array.isArray(topics)
                ? topics.map(t => t?.toLowerCase()).filter(Boolean)
                : [],
            siteUrl,
            subscribed: true
        },
        { upsert: true, new: true }
    );
}

async function fetchNewsForUserService(email) {
    const user = await User.findOne({ email });
    if (!user) return { error: "USER_NOT_FOUND" };

    const articles = await smartCrawler(user.siteUrl);
    if (!articles?.length) return { error: "NO_ARTICLES" };

    const unseen = articles.filter(a => !user.lastNewsLinks.includes(a.link));
    if (!unseen.length) return { error: "NO_NEW_ARTICLES" };

    const normalizedTopics = Array.isArray(user.topics)
        ? user.topics.map(t => t?.toLowerCase()).filter(Boolean)
        : [];

    let finalArticles = [];

    if (normalizedTopics.length > 0) {
        const llmInput = unseen.map(a => ({
            title: a.title,
            link: a.link
        }));

        const classified = await classifyText(JSON.stringify(llmInput));
        const classifiedList = Array.isArray(classified)
            ? classified
            : classified?.articles || [];

        if (!classifiedList.length) return { error: "NO_MATCHING_TOPICS" };

        finalArticles = classifiedList.filter(a =>
            a.topic && normalizedTopics.includes(a.topic.toLowerCase())
        );
    } else {
        finalArticles = unseen.slice(0, 10);
    }

    if (!finalArticles.length) return { error: "NO_MATCHING_TOPICS" };

    await sendEmail(user.email, finalArticles);

    const newLinks = finalArticles.map(a => a.link);

    user.lastNewsLinks = [...user.lastNewsLinks, ...newLinks].slice(-200);
    user.lastSentAt = new Date();
    await user.save();

    return {
        success: true,
        count: finalArticles.length
    };
}

async function unsubscribeUserService(email) {
    await User.findOneAndUpdate({ email }, { subscribed: false });
    return true;
}

module.exports = {
    subscribeUserService,
    fetchNewsForUserService,
    unsubscribeUserService
};
