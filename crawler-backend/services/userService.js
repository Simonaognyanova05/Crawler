const User = require("../models/User");
const { smartCrawler } = require("./smartCrawler");
const { classifyText } = require("./classificationService");
const { sendEmail } = require("./emailService");

async function subscribeUserService(email, topics, siteUrl) {
    return await User.findOneAndUpdate(
        { email },
        {
            email,
            topics: Array.isArray(topics) ? topics.map(t => t.toLowerCase()) : [],
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
    if (!articles || !articles.length) return { error: "NO_ARTICLES" };

    const unseenArticles = articles.filter(a => !user.lastNewsLinks.includes(a.link));
    if (!unseenArticles.length) return { error: "NO_NEW_ARTICLES" };

    const normalizedTopics = user.topics || [];
    let filteredArticles = [];

    if (normalizedTopics.length > 0) {
        const llmInput = unseenArticles.map(a => ({
            title: a.title,
            link: a.link
        }));

        const classified = await classifyText(JSON.stringify(llmInput));

        if (Array.isArray(classified) && classified.length > 0) {
            filteredArticles = classified.filter(a =>
                a.topic && normalizedTopics.includes(a.topic.toLowerCase())
            );
        }
    } else {
        filteredArticles = unseenArticles.slice(0, 10);
    }

    if (!filteredArticles.length) return { error: "NO_MATCHING_TOPICS" };

    await sendEmail(user.email, filteredArticles);

    const updatedLinks = [...user.lastNewsLinks, ...filteredArticles.map(a => a.link)];
    user.lastNewsLinks = updatedLinks.slice(-200);
    user.lastSentAt = new Date();
    await user.save();

    return {
        success: true,
        count: filteredArticles.length
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
