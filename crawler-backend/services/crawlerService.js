const Parser = require("rss-parser");
const Article = require("../models/Article");

const parser = new Parser();

async function crawlRSS(url) {
    const feed = await parser.parseURL(url);

    const latest = feed.items.slice(0, 10);
    console.log(latest);

    const results = [];

    for (let item of latest) {
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
}

module.exports = { crawlRSS };
