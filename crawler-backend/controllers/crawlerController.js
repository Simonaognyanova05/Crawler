const { crawlRSS } = require('../services/crawlerService');

async function getRSSFeed(req, res) {
    try {
        const { url } = req.query;
        if (!url) return res.status(400).json({ error: "Missing RSS URL" });

        const articles = await crawlRSS(url);
        res.json({ articles });

    } catch (err) {
        console.error("Controller error:", err.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = { getRSSFeed };