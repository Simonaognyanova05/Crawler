const { findRSS, parseRSS } = require("./rssService");
const { scrapeHTML } = require("./htmlScraperService");
const { cleanAndDeduplicate } = require("../utils/cleanAndDeduplicate");

async function smartCrawler(url) {
    console.log(`Старт на извличане: ${url}`);

    try {
        const rssUrl = await findRSS(url);

        if (rssUrl) {
            console.log(`Намерен RSS фийд: ${rssUrl}`);

            const rssArticles = await parseRSS(rssUrl);

            if (rssArticles?.length > 0) {
                console.log(`Използване на RSS (${rssArticles.length} статии)`);

                return cleanAndDeduplicate(rssArticles);
            }
        }
        console.log("RSS липсва или е празен → преминаване към HTML scraping...");

        const htmlArticles = await scrapeHTML(url);

        console.log(`HTML scraping върна ${htmlArticles.length} статии`);

        return htmlArticles;

    } catch (err) {
        console.error("SmartCrawler fatal error:", err.message);
        return [];
    }
}

module.exports = { smartCrawler };
