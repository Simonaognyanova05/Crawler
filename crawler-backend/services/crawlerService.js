const { rssParser } = require("../utils/rssParser");
const Article = require("../models/Article");

async function crawlRSS(url) {
    try {
        const feed = await rssParser.parseURL(url);

        const latest = feed.items.slice(0, 10);
        const results = [];

        for (const item of latest) {
            const articleData = {
                title: item.title,
                description: item.contentSnippet || item.content || "",
                link: item.link,
                pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
                source: feed.title
            };

            const article = await Article.findOneAndUpdate(
                { link: item.link },
                articleData,
                { upsert: true, new: true }
            );

            results.push(article);
        }

        return results;

    } catch (err) {
        console.error("RSS parsing error:", err.message);
        return [];
    }
}

module.exports = { crawlRSS };
