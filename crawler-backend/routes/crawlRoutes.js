const express = require("express");
const router = express.Router();
const { crawlRSS } = require("../services/crawlerService");
const { scrapeHackerNews } = require("../services/hackerNewsScraper");

router.get("/", async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: "URL is required" });
    }

    try {
        let articles;
        try {
            articles = await crawlRSS(url);
        } catch (err) {
            console.log("RSS failed, fallback to scraping...");
            articles = await scrapeSite(url);
        }
        res.json(articles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/hackernews", async (req, res) => {
    try {
        console.log("Starting Hacker News scrape...");
        const articles = await scrapeHackerNews();
        res.json(articles);
    } catch (err) {
        console.error("Route error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;