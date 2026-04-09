const axios = require("axios");
const cheerio = require("cheerio");
const Article = require("../models/Article");

const randomDelay = () => {
    const ms = Math.floor(Math.random() * (5000 - 2000 + 1) + 2000);
    return new Promise(resolve => setTimeout(resolve, ms));
};

async function scrapeHackerNews() {
    let url = "https://thehackernews.com/";
    const results = [];
    const MAX_ARTICLES = 140;

    while (results.length < MAX_ARTICLES && url) {
        try {
            const { data } = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Referer': `${url}`,
                    'Cache-Control': 'no-cache'
                }
            });

            const $ = cheerio.load(data);
            const posts = $(".body-post");

            if (posts.length === 0) {
                console.log("Не са намерени статии на тази страница. Вероятно структурата е променена.");
                break;
            }

            for (let i = 0; i < posts.length; i++) {
                if (results.length >= MAX_ARTICLES) break;

                const el = posts[i];
                const title = $(el).find(".home-title").text().trim();
                const description = $(el).find(".home-desc").text().trim();
                let link = $(el).find("a.story-link").attr("href");

                if (!link) continue;

                const articleData = {
                    title,
                    description,
                    link,
                    pubDate: new Date(),
                    source: "The Hacker News"
                };

                const saved = await Article.findOneAndUpdate(
                    { link },
                    articleData,
                    { upsert: true, returnDocument: 'after' }
                );

                results.push(saved);
            }

            const nextPage = $("#Blog1_blog-pager-older-link").attr("href") || $(".blog-pager-older-link").attr("href");

            if (nextPage && results.length < MAX_ARTICLES) {
                url = nextPage;
                console.log("Waiting for next page...");
                await randomDelay();
            } else {
                url = null;
            }

        } catch (error) {
            if (error.response && error.response.status === 403) {
                console.error("Грешка 403: Сайтът блокира достъпа. Опитай отново след малко или използвай прокси.");
            } else {
                console.error("Грешка при скрапване:", error.message);
            }
            break;
        }
    }

    return results;
}

module.exports = { scrapeHackerNews };