const { findRSS, parseRSS } = require("./rssService");
const { scrapeHTML } = require("./htmlScraperService");
const { cleanAndDeduplicate } = require("../utils/cleanAndDeduplicate");

async function smartCrawler(url) {
    try {
        console.log(`Начало на извличане: ${url}`);

        const rssUrl = await findRSS(url);

        if (rssUrl) {
            console.log(`Намерен RSS фийд: ${rssUrl}`);
            const articles = await parseRSS(rssUrl);

            if (articles.length > 0) {
                console.log(`Използване на RSS (${articles.length} статии)`);
                return cleanAndDeduplicate(articles);
            }
        }

        console.log("RSS не е намерен или е празен. Преминаване към HTML scraping...");
        const htmlArticles = await scrapeHTML(url);

        console.log(`Използване на HTML Scraping (${htmlArticles.length} статии)`);

        return htmlArticles;
    } catch (err) {
        console.log("SmartCrawl fatal error:", err.message);
        return [];
    }
}

module.exports = { smartCrawler };
