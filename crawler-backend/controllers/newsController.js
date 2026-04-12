const { newsService } = require("../services/newsService");

async function fetchNews(req, res) {
    try {
        const result = await newsService(req.body);

        if (result.error) {
            return res.status(result.status).json({ error: result.message });
        }

        res.json({
            success: true,
            message: result.message,
            count: result.count
        });

    } catch (err) {
        console.error("Controller error:", err);
        res.status(500).json({ error: "Вътрешна грешка при обработка на новините" });
    }
}

module.exports = { fetchNews };
