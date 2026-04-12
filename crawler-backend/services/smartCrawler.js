const Parser = require("rss-parser");
const cheerio = require("cheerio");
const axios = require("axios");

const parser = new Parser({
    xml2js: { strict: false },
    headers: { 'User-Agent': 'Mozilla/5.0' } // Важно за сайтове като TechCrunch
});

// ----------------------------
// SAFE FETCH (С подобрени хедъри)
// ----------------------------
async function safeFetch(url) {
    try {
        const res = await axios.get(url, {
            timeout: 15000,
            maxRedirects: 5,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Cache-Control": "no-cache"
            }
        });
        return res.data;
    } catch (err) {
        console.log(`❌ Fetch failed: ${url} | ${err.message}`);
        return null;
    }
}

// ----------------------------
// NORMALIZE LINK
// ----------------------------
function normalizeLink(link, baseUrl) {
    try {
        if (!link) return null;
        if (!link.startsWith("http")) {
            link = new URL(link, baseUrl).href;
        }
        return link.split("#")[0];
    } catch {
        return null;
    }
}

// ----------------------------
// DEDUPLICATION & CLEANING
// ----------------------------
function cleanAndDeduplicate(articles) {
    const seen = new Set();
    return articles.filter(article => {
        const isNew = !seen.has(article.link);
        // Филтрираме "шум" - заглавия под 4 думи обикновено не са новини (напр. "Read More", "Login")
        const isNotNoise = article.title && article.title.split(/\s+/).length > 3;

        if (isNew && isNotNoise) {
            seen.add(article.link);
            return true;
        }
        return false;
    });
}

// ----------------------------
// FIND RSS
// ----------------------------
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

// ----------------------------
// PARSE RSS (Подобрена версия)
// ----------------------------
async function parseRSS(url) {
    try {
        // Директното използване на parseURL е много по-стабилно
        const feed = await parser.parseURL(url);

        return (feed.items || []).slice(0, 20).map(item => ({
            title: item.title?.trim(),
            description: item.contentSnippet || item.content || "",
            link: normalizeLink(item.link, url),
            pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
            source: feed.title || url
        }));
    } catch (err) {
        console.log(`⚠️ RSS parseURL failed: ${err.message}. Trying manual string parse...`);
        try {
            const xml = await safeFetch(url);
            if (!xml) return [];
            const feed = await parser.parseString(xml);
            return (feed.items || []).map(item => ({
                title: item.title?.trim(),
                link: normalizeLink(item.link, url)
            }));
        } catch (innerErr) {
            console.log("❌ All RSS attempts failed.");
            return [];
        }
    }
}

// ----------------------------
// GENERIC HTML SCRAPER (С филтър за качество)
// ----------------------------
async function scrapeHTML(url) {
    try {
        const html = await safeFetch(url);
        if (!html) return [];

        const $ = cheerio.load(html);
        const articles = [];

        // Добавени специфични селектори за TechCrunch и модерни медии
        const containerSelectors = "article, .post, .loop-card, .card, .story-item";
        const titleSelectors = "h1, h2, h3, .loop-card__title, .post-title";

        $(containerSelectors).each((i, el) => {
            const titleEl = $(el).find(titleSelectors).first();
            let title = titleEl.text().trim();
            let link = normalizeLink(titleEl.attr("href") || $(el).find("a").first().attr("href"), url);

            if (title && link && title.length > 10) {
                articles.push({
                    title,
                    link,
                    description: $(el).find("p").first().text().trim().substring(0, 150),
                    pubDate: new Date(),
                    source: url
                });
            }
        });

        // Ако не открием нищо със селектори, правим интелигентен филтър на всички линкове
        if (articles.length === 0) {
            $("a").each((i, el) => {
                const title = $(el).text().trim();
                const link = normalizeLink($(el).attr("href"), url);
                // Филтрираме линкове, които са твърде къси или приличат на навигация
                if (title.length > 25 && link && !link.includes("/category/") && !link.includes("/tag/")) {
                    articles.push({ title, link, source: url });
                }
            });
        }

        return cleanAndDeduplicate(articles).slice(0, 15);
    } catch (err) {
        console.log("❌ HTML scrape error:", err.message);
        return [];
    }
}

// ----------------------------
// SMART CRAWLER (Main entry point)
// ----------------------------
async function smartCrawl(url) {
    try {
        console.log(`📡 Начало на извличане: ${url}`);

        // 1. Първо търсим RSS/Feed
        const rssUrl = await findRSS(url);

        if (rssUrl) {
            console.log(`🔗 Намерен RSS фийд: ${rssUrl}`);
            const articles = await parseRSS(rssUrl);
            if (articles.length > 0) {
                console.log(`✅ Използване на RSS (${articles.length} статии)`);
                return cleanAndDeduplicate(articles);
            }
        }

        // 2. Fallback към HTML Scraping
        console.log("⚠️ RSS не е намерен или е празен. Преминаване към HTML scraping...");
        const htmlArticles = await scrapeHTML(url);
        console.log(`✅ Използване на HTML Scraping (${htmlArticles.length} статии)`);

        return htmlArticles;

    } catch (err) {
        console.log("❌ SmartCrawl fatal error:", err.message);
        return [];
    }
}

module.exports = { smartCrawl };