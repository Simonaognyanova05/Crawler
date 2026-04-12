const Parser = require("rss-parser");
const cheerio = require("cheerio");
const axios = require("axios");

const parser = new Parser({
    xml2js: { strict: false }
});

// ----------------------------
// SAFE FETCH
// ----------------------------
async function safeFetch(url) {
    try {
        const res = await axios.get(url, {
            timeout: 15000,
            maxRedirects: 5,
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Cache-Control": "no-cache"
            }
        });

        return res.data;
    } catch (err) {
        console.log("Fetch failed:", url, err.message);
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
// DEDUPLICATION
// ----------------------------
function deduplicate(articles) {
    const seen = new Set();
    const unique = [];

    for (const article of articles) {
        if (!seen.has(article.link)) {
            seen.add(article.link);
            unique.push(article);
        }
    }

    return unique;
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
            $('link[type="application/json"]').attr("href") ||
            $('a[href*="rss"]').attr("href") ||
            $('a[href*="feed"]').attr("href");

        if (!rssLink) return null;

        return normalizeLink(rssLink, url);
    } catch {
        return null;
    }
}

// ----------------------------
// PARSE RSS
// ----------------------------
async function parseRSS(url) {
    try {
        const xml = await safeFetch(url);
        if (!xml) return [];

        const feed = await parser.parseString(xml);

        return (feed.items || []).slice(0, 10).map(item => ({
            title: item.title,
            description: item.contentSnippet || item.content || "",
            link: item.link,
            pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
            source: feed.title || url
        }));
    } catch (err) {
        console.log("RSS parse failed:", err.message);
        return [];
    }
}

// ----------------------------
// JSON FEED
// ----------------------------
async function parseJSONFeed(url) {
    try {
        const json = await axios.get(url).then(r => r.data);

        if (!json.items) return [];

        return json.items.slice(0, 10).map(item => ({
            title: item.title,
            description: item.summary || "",
            link: item.url,
            pubDate: new Date(item.date_published || Date.now()),
            source: json.title || url
        }));
    } catch {
        return [];
    }
}

// ----------------------------
// SCHEMA ORG SCRAPER
// ----------------------------
function scrapeSchemaOrg($, url) {
    const articles = [];

    $("script[type='application/ld+json']").each((i, el) => {
        try {
            const json = JSON.parse($(el).html());

            if (json && json.headline && json.url) {
                articles.push({
                    title: json.headline,
                    description: json.description || "",
                    link: normalizeLink(json.url, url),
                    pubDate: new Date(),
                    source: url
                });
            }

            if (json && json["@graph"]) {
                json["@graph"].forEach(item => {
                    if (item.headline && item.url) {
                        articles.push({
                            title: item.headline,
                            description: item.description || "",
                            link: normalizeLink(item.url, url),
                            pubDate: new Date(),
                            source: url
                        });
                    }
                });
            }
        } catch { }
    });

    return articles;
}

// ----------------------------
// OPENGRAPH SCRAPER
// ----------------------------
function scrapeOpenGraph($, url) {
    const articles = [];

    $("meta[property='og:title']").each((i, el) => {
        const title = $(el).attr("content");
        const link = $("meta[property='og:url']").attr("content");

        if (!title || !link) return;

        articles.push({
            title,
            description: "",
            link,
            pubDate: new Date(),
            source: url
        });
    });

    return articles;
}

// ----------------------------
// WIRED SCRAPER
// ----------------------------
function scrapeWired($, url) {
    const articles = [];

    $("a[href*='/story/']").each((i, el) => {
        const title = $(el).text().trim();
        const link = normalizeLink($(el).attr("href"), url);

        if (!title || title.length < 15) return;

        articles.push({
            title,
            description: "",
            link,
            pubDate: new Date(),
            source: "Wired"
        });
    });

    return articles;
}

// ----------------------------
// GENERIC HTML SCRAPER
// ----------------------------
async function scrapeHTML(url) {
    try {
        const html = await safeFetch(url);
        if (!html) return [];

        const $ = cheerio.load(html);
        const articles = [];

        const selectors = [
            "article",
            ".post",
            ".news",
            ".entry",
            ".card",
            ".story",
            ".item",
            ".post-item",
            ".blog-post",
            ".news-item",
            ".teaser"
        ];

        selectors.forEach(sel => {
            $(sel).each((i, el) => {
                const title = $(el).find("h1,h2,h3,h4").first().text().trim();
                let link = $(el).find("a").first().attr("href");

                link = normalizeLink(link, url);

                if (!title || !link) return;

                articles.push({
                    title,
                    description: $(el).find("p").first().text().trim() || "",
                    link,
                    pubDate: new Date(),
                    source: url
                });
            });
        });

        if (articles.length === 0) {
            articles.push(...scrapeSchemaOrg($, url));
        }

        if (articles.length === 0) {
            articles.push(...scrapeOpenGraph($, url));
        }

        if (articles.length === 0) {
            $("a").each((i, el) => {
                const title = $(el).text().trim();
                let link = $(el).attr("href");

                if (!title || title.length < 10) return;

                link = normalizeLink(link, url);
                if (!link) return;

                articles.push({
                    title,
                    description: "",
                    link,
                    pubDate: new Date(),
                    source: url
                });
            });
        }

        return deduplicate(articles).slice(0, 10);
    } catch (err) {
        console.log("HTML scrape error:", err.message);
        return [];
    }
}

// ----------------------------
// SMART CRAWLER
// ----------------------------
async function smartCrawl(url) {
    try {
        console.log("Crawling:", url);

        const rssUrl = await findRSS(url);

        if (rssUrl) {
            console.log("Found RSS:", rssUrl);

            let articles = await parseRSS(rssUrl);

            if (articles.length) {
                console.log("Using RSS");
                return deduplicate(articles);
            }

            articles = await parseJSONFeed(rssUrl);

            if (articles.length) {
                console.log("Using JSON feed");
                return deduplicate(articles);
            }
        }

        if (url.includes("wired.com")) {
            const html = await safeFetch(url);
            const $ = cheerio.load(html);

            const wired = scrapeWired($, url);

            if (wired.length) {
                console.log("Using Wired scraper");
                return deduplicate(wired);
            }
        }

        console.log("Using HTML scraping");
        return await scrapeHTML(url);

    } catch (err) {
        console.log("smartCrawl fatal:", err.message);
        return [];
    }
}

module.exports = { smartCrawl };
