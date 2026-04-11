const Parser = require("rss-parser");
const Article = require("../models/Article");

const parser = new Parser();

async function scrapeHackerNews() {
    try {
        // 1) Взимаме RSS feed (много по-стабилно от HTML scraping)
        const feed = await parser.parseURL("https://hnrss.org/frontpage");

        // 2) Взимаме последните 140 новини
        const items = feed.items.slice(0, 140);

        const results = [];

        for (const item of items) {
            const articleData = {
                title: item.title,
                description: item.contentSnippet || "",
                link: item.link,
                pubDate: new Date(item.pubDate),
                source: "HackerNews"
            };

            // 3) Записваме в базата (upsert)
            const saved = await Article.findOneAndUpdate(
                { link: item.link },
                articleData,
                { upsert: true, returnDocument: "after" }
            );

            results.push(saved);
        }

        return results;

    } catch (err) {
        console.error("Грешка при извличане на Hacker News RSS:", err.message);
        return [];
    }
}

module.exports = { scrapeHackerNews };
