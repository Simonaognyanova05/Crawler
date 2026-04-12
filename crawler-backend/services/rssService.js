const cheerio = require("cheerio");
const { safeFetch } = require("../utils/safeFetch");
const { normalizeLink } = require("../utils/normalizeLink");
const { cleanAndDeduplicate } = require("../utils/cleanAndDeduplicate");
const { rssParser } = require("../utils/rssParser");

async function findRSS(url) {
    try {
        const html = await safeFetch(url);
        if (!html) return null;

        const $ = cheerio.load(html);

        const rssLink =
            $('link[type="application/rss+xml"]').attr("href") ||
            $('link[type="application/atom+xml"]').attr("href") ||
            $('a[href*="rss"]').attr("href") ||
            $('a[href$="/feed/"]').attr("href") ||
            $('a[href$="/feed"]').attr("href");

        return normalizeLink(rssLink, url);
    } catch {
        return null;
    }
}

async function parseRSS(url) {
    try {
        const feed = await rssParser.parseURL(url);

        return (feed.items || []).slice(0, 20).map(item => ({
            title: item.title?.trim(),
            description: item.contentSnippet || item.content || "",
            link: normalizeLink(item.link, url),
            pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
            source: feed.title || url
        }));
    } catch (err) {
        console.log(`RSS parseURL failed: ${err.message}. Trying manual parse...`);

        try {
            const xml = await safeFetch(url);
            if (!xml) return [];

            const feed = await rssParser.parseString(xml);

            return (feed.items || []).map(item => ({
                title: item.title?.trim(),
                link: normalizeLink(item.link, url)
            }));
        } catch {
            console.log("All RSS attempts failed.");
            return [];
        }
    }
}

module.exports = { findRSS, parseRSS };
