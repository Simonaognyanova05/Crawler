const cheerio = require("cheerio");
const { safeFetch } = require("../utils/safeFetch");
const { normalizeLink } = require("../utils/normalizeLink");
const { cleanAndDeduplicate } = require("../utils/cleanAndDeduplicate");

async function scrapeHTML(url) {
    try {
        const html = await safeFetch(url);
        if (!html) return [];

        const $ = cheerio.load(html);
        const articles = [];

        const containerSelectors = "article, .post, .loop-card, .card, .story-item";
        const titleSelectors = "h1, h2, h3, .loop-card__title, .post-title";

        $(containerSelectors).each((_, el) => {
            const titleEl = $(el).find(titleSelectors).first();
            const title = titleEl.text().trim();

            if (!title || title.length < 10) return;

            const link =
                normalizeLink(titleEl.attr("href"), url) ||
                normalizeLink($(el).find("a").first().attr("href"), url);

            if (!link) return;

            articles.push({
                title,
                link,
                description: $(el).find("p").first().text().trim().slice(0, 150),
                pubDate: new Date(),
                source: url
            });
        });

        if (articles.length === 0) {
            $("a").each((_, el) => {
                const title = $(el).text().trim();
                if (title.length < 25) return;

                const link = normalizeLink($(el).attr("href"), url);
                if (!link) return;

                if (link.includes("/category/") || link.includes("/tag/")) return;

                articles.push({
                    title,
                    link,
                    source: url,
                    pubDate: new Date()
                });
            });
        }

        return cleanAndDeduplicate(articles).slice(0, 15);

    } catch (err) {
        console.log("HTML scrape error:", err.message);
        return [];
    }
}

module.exports = { scrapeHTML };
