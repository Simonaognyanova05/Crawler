const Parser = require("rss-parser");
const Article = require("../models/Article");

// ВАЖНО: включваме "xml2js" safe mode
const parser = new Parser({
    xml2js: {
        strict: false, // позволява счупени тагове
        normalizeTags: true
    }
});

async function crawlRSS(url) {
    try {
        const feed = await parser.parseURL(url);

        const latest = feed.items.slice(0, 10);
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

    } catch (err) {
        console.error("RSS parsing error:", err.message);
        return [];
    }
}

module.exports = { crawlRSS };
